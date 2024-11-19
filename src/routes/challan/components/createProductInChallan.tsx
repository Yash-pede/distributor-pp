import { Database } from "@/utilities";
import { challanProductAddingType } from "@/utilities/constants";
import { Create, useDrawerForm } from "@refinedev/antd";
import { BaseOption } from "@refinedev/core";
import { Drawer, Form, InputNumber, Select, SelectProps } from "antd";
import { DefaultOptionType } from "antd/es/select";

const CreateProductInChallan = ({
  openDrawer,
  productSelectProps,
  challan,
  productsData,
  setChallan,
  setOpenDrawer
}: {
  openDrawer: boolean;
  productSelectProps: SelectProps<BaseOption, DefaultOptionType>;
  challan: challanProductAddingType[];
  productsData: any;
  setChallan: React.Dispatch<React.SetStateAction<challanProductAddingType[]>>;
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>
}) => {

  const { formProps, drawerProps, form, saveButtonProps } = useDrawerForm<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    action: "create",
  });

  formProps.onFinish= (values:any) =>{
    const totalQuantity = values.free_q + values.quantity;
    const modifiedValues = {
      ...values,
      quantity: totalQuantity,
      actual_q: values.quantity,
    };

    setChallan((prevChallan: any[]) => {
      setOpenDrawer(false);
      if (prevChallan) {
        return [...prevChallan, modifiedValues];
      }
      return [modifiedValues];
    });

    form.resetFields();
  }

  return (
    <Drawer {...drawerProps} open={openDrawer} onClose={() => setOpenDrawer(false)}>
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item<challanProductAddingType>
            label="Product"
            name="product_id"
            rules={[{ required: true, message: "Product is required" }]}
          >
            <Select
              {...productSelectProps}
              onChange={() => {
                const selectedProduct = productsData?.data?.find(
                  (product:any) => product.id === form.getFieldValue("product_id")
                );
                const defaultSellingPrice = selectedProduct?.selling_price || 0;
                form.setFieldsValue({
                  selling_price: defaultSellingPrice,
                });
              }}
            />
          </Form.Item>
          <Form.Item<challanProductAddingType>
            label="Quantity"
            name="quantity"
            initialValue={0}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>
          <Form.Item<challanProductAddingType>
            label="free Quantity"
            name="free_q"
            initialValue={0}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item<challanProductAddingType>
            label="discount"
            name="discount"
            initialValue={0}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item<challanProductAddingType>
            label="Selling Price"
            name="selling_price"
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Create>
    </Drawer>
  );
};

export default CreateProductInChallan;
