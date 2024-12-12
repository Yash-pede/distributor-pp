import { Database } from "@/utilities";
import { challanProductAddingType } from "@/utilities/constants";
import { Create, useDrawerForm } from "@refinedev/antd";
import { BaseOption, useOne } from "@refinedev/core";
import { Drawer, Form, InputNumber, Select, SelectProps } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { useEffect } from "react";

const CreateProductInChallan = ({
  openDrawer,
  productSelectProps,
  challan,
  setChallan,
  setOpenDrawer,
}: {
  openDrawer: boolean;
  productSelectProps: SelectProps<BaseOption, DefaultOptionType>;
  challan: challanProductAddingType[];
  setChallan: React.Dispatch<React.SetStateAction<challanProductAddingType[]>>;
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { formProps, drawerProps, form, saveButtonProps } = useDrawerForm<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    action: "create",
  });

  formProps.onFinish = (values: any) => {
    const totalQuantity = values.free_q + values.quantity;
    if (totalQuantity < 0) {
      form.resetFields();
      return;
    }
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
  };

  const {
    data: product,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
  } = useOne<Database["public"]["Tables"]["products"]["Row"]>({
    resource: "products",
    id: form.getFieldValue("product_id"),
    queryOptions: {
      enabled: false,
    },
  });

  useEffect(() => {
    const productId = form.getFieldValue("product_id");
    if (productId) {
      refetchProduct();
    }
  }, [form.getFieldValue("product_id")]);

  useEffect(() => {
    if (product?.data && !isRefetchingProduct) {
      const defaultSellingPrice = product.data.selling_price ?? 0;
      form.setFieldsValue({
        selling_price: defaultSellingPrice,
      });
    }
  }, [product]);

  return (
    <Drawer
      {...drawerProps}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
    >
      <Create saveButtonProps={saveButtonProps} isLoading={isRefetchingProduct}>
        <Form {...formProps} layout="vertical">
          <Form.Item<challanProductAddingType>
            label="Product"
            name="product_id"
            rules={[{ required: true, message: "Product is required" }]}
          >
            <Select
              {...productSelectProps}
              onChange={() => {
                const productId = form.getFieldValue("product_id");
                if (productId) refetchProduct();
              }}
            />
          </Form.Item>

          <Form.Item<challanProductAddingType>
            label="Quantity"
            name="quantity"
            initialValue={0}
            rules={[
              { required: true, message: "Quantity is required" },
              { type: "number", min: 1, message: "Quantity must be greater than 0" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item<challanProductAddingType>
            label="Free Quantity"
            name="free_q"
            initialValue={0}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item<challanProductAddingType>
            label="Discount"
            name="discount"
            initialValue={0}
            rules={[
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Discount must be between 0-100%",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item<challanProductAddingType>
            label="Selling Price"
            name="selling_price"
            rules={[
              { required: true, message: "Selling price is required" },
              { type: "number", min: 1, message: "Price must be greater than 0" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Create>
    </Drawer>
  );
};

export default CreateProductInChallan;
