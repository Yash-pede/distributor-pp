-- Function to log batch details
CREATE OR REPLACE FUNCTION log_batch_details(
    order_id BIGINT,
    product_id BIGINT,
    batch_info JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO challan_batch_info (challan_id, product_id, batch_info)
    VALUES (order_id, product_id, batch_info);
END;
$$ LANGUAGE plpgsql;

-- Function to deduct inventory based on the product_info column in challan
CREATE OR REPLACE FUNCTION deduct_inventory() RETURNS TRIGGER AS $$
DECLARE
    product_item JSONB;
    product_id_local INTEGER;
    ordered_quantity_local INTEGER;
    remaining_quantity INTEGER;
    inventory_row RECORD;
    batch_details JSONB := '[]'::jsonb;
    batch_log JSONB;
BEGIN
    -- Loop over each product in the product_info JSONB array
    FOR product_item IN SELECT * FROM jsonb_array_elements(NEW.product_info)
    LOOP
        product_id_local := (product_item->>'product_id')::INTEGER;
        ordered_quantity_local := (product_item->>'quantity')::INTEGER;
        remaining_quantity := ordered_quantity_local; -- Track remaining quantity to deduct
        
        -- Loop to deduct the ordered quantity from the inventory, ordered by id ASC
        FOR inventory_row IN
            SELECT * FROM inventory
            WHERE product_id = product_id_local
              AND distributor_id = NEW.distributor_id
              AND quantity > 0  -- Only consider rows with available quantity
            ORDER BY id  -- Order by id ASC
        LOOP
            IF remaining_quantity <= 0 THEN
                EXIT;
            END IF;
            
            IF inventory_row.quantity >= remaining_quantity THEN
                -- Enough quantity in this inventory row to fulfill remaining_quantity
                UPDATE inventory
                SET quantity = quantity - remaining_quantity
                WHERE id = inventory_row.id;
                
                batch_log := jsonb_build_object('batch_id', inventory_row.batch_id, 'quantity', remaining_quantity);
                batch_details := batch_details || batch_log;
                
                remaining_quantity := 0;  -- All ordered quantity deducted
            ELSE
                -- Not enough in this inventory row, deduct what's available
                batch_log := jsonb_build_object('batch_id', inventory_row.batch_id, 'quantity', inventory_row.quantity);
                batch_details := batch_details || batch_log;
                
                remaining_quantity := remaining_quantity - inventory_row.quantity;
                UPDATE inventory
                SET quantity = 0
                WHERE id = inventory_row.id;
            END IF;
        END LOOP;
        
        -- If remaining_quantity is still > 0, it means inventory is insufficient
        IF remaining_quantity > 0 THEN
            RAISE EXCEPTION 'Insufficient inventory for product_id %', product_id_local;
        END IF;
        
        -- Log batch details for the product
        PERFORM log_batch_details(NEW.id, product_id_local, batch_details);
        
        -- Reset batch details for the next product
        batch_details := '[]'::jsonb;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the deduct_inventory function after insert on challan
CREATE OR REPLACE TRIGGER trg_deduct_inventory
AFTER INSERT ON challan
FOR EACH ROW
EXECUTE FUNCTION deduct_inventory();
