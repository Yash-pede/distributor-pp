CREATE OR REPLACE FUNCTION revert_inventory_on_challan_deletion()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
    batch_record RECORD;
    total_quantity bigint;
BEGIN
    -- Check if status changed from REQ_DELETION to DELETED
    IF (OLD.status = 'REQ_DELETION' AND NEW.status = 'DELETED') THEN
        -- Loop through each product in the challan's product_info
        FOR product_record IN 
            SELECT 
                (p->>'product_id')::bigint AS product_id,
                (p->>'actual_q')::bigint AS actual_quantity,
                (p->>'free_q')::bigint AS free_quantity,
                ((p->>'actual_q')::bigint + (p->>'free_q')::bigint) AS total_q
            FROM jsonb_array_elements(OLD.product_info) AS p
        LOOP
            -- For each product, get its batch information from challan_batch_info
            FOR batch_record IN 
                SELECT 
                    b->>'batch_id' AS batch_id,
                    (b->>'quantity')::bigint AS quantity
                FROM challan_batch_info cbi,
                     jsonb_array_elements(cbi.batch_info) AS b
                WHERE cbi.challan_id = OLD.id 
                AND cbi.product_id = product_record.product_id
            LOOP
                -- Only proceed if we have valid batch_id and quantity
                IF batch_record.batch_id IS NOT NULL AND batch_record.quantity IS NOT NULL THEN
                    -- Calculate what portion of this batch's quantity represents both actual and free products
                    total_quantity := batch_record.quantity * 
                        (product_record.actual_quantity + product_record.free_quantity)::float / 
                        NULLIF(product_record.total_q, 0);

                    -- Check if inventory record exists for this batch
                    IF EXISTS (
                        SELECT 1 
                        FROM inventory 
                        WHERE distributor_id = OLD.distributor_id
                        AND product_id = product_record.product_id
                        AND batch_id = batch_record.batch_id
                    ) THEN
                        -- Update existing inventory record
                        UPDATE inventory
                        SET quantity = quantity + total_quantity
                        WHERE distributor_id = OLD.distributor_id
                        AND product_id = product_record.product_id
                        AND batch_id = batch_record.batch_id;
                    ELSE
                        -- Create new inventory record
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



-- Create the trigger
CREATE TRIGGER trg_revert_inventory_on_challan_deletion
    AFTER UPDATE OF status ON challan
    FOR EACH ROW
    EXECUTE FUNCTION revert_inventory_on_challan_deletion();