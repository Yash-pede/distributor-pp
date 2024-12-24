CREATE OR REPLACE FUNCTION revert_inventory_on_challan_deletion()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
    batch_record RECORD;
    total_quantity bigint;
BEGIN
    IF (OLD.status = 'REQ_DELETION' AND NEW.status = 'DELETED') THEN
        -- Check pending amount
        IF OLD.pending_amt < OLD.total_amt THEN
            RAISE EXCEPTION 'Cannot delete challan % as payments have been received', OLD.id;
        END IF;

        -- Process products
        FOR product_record IN 
            SELECT 
                (p->>'product_id')::bigint AS product_id,
                (p->>'actual_q')::bigint AS actual_quantity,
                (p->>'free_q')::bigint AS free_quantity,
                ((p->>'actual_q')::bigint + (p->>'free_q')::bigint) AS total_q
            FROM jsonb_array_elements(OLD.product_info) AS p
        LOOP
            FOR batch_record IN 
                SELECT 
                    b->>'batch_id' AS batch_id,
                    (b->>'quantity')::bigint AS quantity
                FROM challan_batch_info cbi,
                     jsonb_array_elements(cbi.batch_info) AS b
                WHERE cbi.challan_id = OLD.id 
                AND cbi.product_id = product_record.product_id
            LOOP
                IF batch_record.batch_id IS NOT NULL AND batch_record.quantity IS NOT NULL THEN
                    total_quantity := batch_record.quantity;

                    WITH updated AS (
                        UPDATE inventory
                        SET 
                            quantity = quantity + total_quantity,
                            updated_at = now()
                        WHERE id = (
                            SELECT id 
                            FROM inventory 
                            WHERE distributor_id = OLD.distributor_id
                            AND product_id = product_record.product_id
                            AND batch_id = batch_record.batch_id
                            ORDER BY id ASC
                            LIMIT 1
                        )
                        RETURNING id
                    )
                    INSERT INTO inventory (
                        distributor_id,
                        product_id,
                        batch_id,
                        quantity
                    )
                    SELECT 
                        OLD.distributor_id,
                        product_record.product_id,
                        batch_record.batch_id,
                        total_quantity
                    WHERE NOT EXISTS (SELECT 1 FROM updated);
                END IF;
            END LOOP;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS trg_revert_inventory_on_challan_deletion ON challan;
CREATE TRIGGER trg_revert_inventory_on_challan_deletion
    AFTER UPDATE OF status ON challan
    FOR EACH ROW
    EXECUTE FUNCTION revert_inventory_on_challan_deletion();