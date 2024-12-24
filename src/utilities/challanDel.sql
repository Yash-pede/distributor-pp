CREATE OR REPLACE FUNCTION revert_inventory_on_challan_deletion()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
    batch_record RECORD;
    total_quantity bigint;
    has_transfers boolean;
BEGIN
    -- Check if status changed from REQ_DELETION to DELETED
    IF (OLD.status = 'REQ_DELETION' AND NEW.status = 'DELETED') THEN
        -- Check for existing transfers
        SELECT EXISTS (
            SELECT 1 
            FROM transfers 
            WHERE status = 'Credit' 
            AND from_user_id = OLD.distributor_id
            AND description LIKE 'Transfer created after updating receiving in challan ' || OLD.id || '%'
        ) INTO has_transfers;

        IF has_transfers THEN
            RAISE EXCEPTION 'Cannot delete challan % as payments have been received', OLD.id;
        END IF;

        -- Loop through each product in the challan's product_info
        FOR product_record IN 
            SELECT 
                (p->>'product_id')::bigint AS product_id,
                (p->>'actual_q')::bigint AS actual_quantity,
                (p->>'free_q')::bigint AS free_quantity,
                ((p->>'actual_q')::bigint + (p->>'free_q')::bigint) AS total_q
            FROM jsonb_array_elements(OLD.product_info) AS p
        LOOP
            -- For each product, get its batch information
            FOR batch_record IN 
                SELECT 
                    b->>'batch_id' AS batch_id,
                    (b->>'quantity')::bigint AS quantity
                FROM challan_batch_info cbi,
                     jsonb_array_elements(cbi.batch_info) AS b
                WHERE cbi.challan_id = OLD.id 
                AND cbi.product_id = product_record.product_id
            LOOP
                -- Proceed only if batch_id and quantity are valid
                IF batch_record.batch_id IS NOT NULL AND batch_record.quantity IS NOT NULL THEN
                    -- Calculate total quantity including both actual and free
                    total_quantity := batch_record.quantity * 
                        (product_record.actual_quantity + product_record.free_quantity)::float / 
                        NULLIF(product_record.total_q, 0);

                    -- Update or insert inventory
                    IF EXISTS (
                        SELECT 1 
                        FROM inventory 
                        WHERE distributor_id = OLD.distributor_id
                        AND product_id = product_record.product_id
                        AND batch_id = batch_record.batch_id
                    ) THEN
                        UPDATE inventory
                        SET 
                            quantity = quantity + total_quantity,
                            updated_at = now()
                        WHERE distributor_id = OLD.distributor_id
                        AND product_id = product_record.product_id
                        AND batch_id = batch_record.batch_id;
                    ELSE
                        INSERT INTO inventory (
                            distributor_id,
                            product_id,
                            batch_id,
                            quantity
                        ) VALUES (
                            OLD.distributor_id,
                            product_record.product_id,
                            batch_record.batch_id,
                            total_quantity
                        );
                    END IF;
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