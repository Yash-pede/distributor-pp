-- Function to deduct inventory based on the product_info column in challan
CREATE OR REPLACE FUNCTION deduct_inventory() RETURNS TRIGGER AS $$
DECLARE
    product_item JSONB;
    product_id_local INTEGER;
    ordered_quantity_local INTEGER;
    remaining_quantity INTEGER;
    inventory_row RECORD;  -- Define a record variable for inventory_row
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
                remaining_quantity := 0;  -- All ordered quantity deducted
            ELSE
                -- Not enough in this inventory row, deduct what's available
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
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after an insert on challan table
CREATE OR REPLACE TRIGGER trg_deduct_inventory
AFTER INSERT ON challan
FOR EACH ROW
EXECUTE FUNCTION deduct_inventory();
