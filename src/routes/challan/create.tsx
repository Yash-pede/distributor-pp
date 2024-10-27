import React, { useEffect } from "react";
import {
  useCreate,
  useGetIdentity,
  useGo,
  useList,
  useOne,
} from "@refinedev/core";
import { Create, useModal, useSelect } from "@refinedev/antd";
import {
  Button,
  Form,
  Modal,
  Select,
  Table,
  type FormProps,
  Typography,
  InputNumber,
} from "antd";
import { challanProductAddingType } from "@/utilities/constants";
import { Database } from "@/utilities";

export const ChallanCreate = ({ sales }: { sales?: boolean }) => {
  const go = useGo();
  const [challan, setChallan] = React.useState<any>([]);
  const [availableqty, setAvailableqty] = React.useState<any>();
  const [customer, setCustomer] = React.useState<any>();
  const [totalAmount, setTotalAmount] = React.useState<any>();
  const [billAmount, setBillAmount] = React.useState<any>();
  const { show, close, modalProps } = useModal();
  const { data: User } = useGetIdentity<any>();

  const { data: bossData, isLoading: isLoadingBossId } = useOne<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    id: User?.id,
    queryOptions: {
      enabled: !!User && sales,
    },
  });

  const { data: inventory } = useList<
    Database["public"]["Tables"]["inventory"]["Row"]
  >({
    resource: "inventory",
    filters: [
      {
        field: "distributor_id",
        operator: "eq",
        value: sales ? bossData?.data?.boss_id : User?.id,
      },
    ],
    pagination: {
      current: 1,
      pageSize: 1000,
    },
  });

  const { selectProps: productSelectProps, queryResult: products } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
    filters: [
      {
        field: "id",
        operator: "in",
        value: inventory?.data
          ?.filter((stock) => (stock.quantity ?? 0) > 0)
          .map((stock) => stock.product_id),
      },
    ],
    onSearch: (value) => {
      return [
        {
          field: "name",
          operator: "contains",
          value,
        },
      ];
    },
    pagination: {
      current: 1,
      pageSize: 1000,
    },
  });

  const onFinish: FormProps<challanProductAddingType>["onFinish"] = (
    values
  ) => {
    const totalQuantity = values.free_q + values.quantity;
    const modifiedValues = {
      ...values,
      quantity: totalQuantity,
      actual_q: values.quantity,
    };

    setChallan((prevChallan: any[]) => {
      close();
      if (prevChallan) {
        return [...prevChallan, modifiedValues];
      }
      return [modifiedValues];
    });

    form.resetFields();
    setAvailableqty(null);
  };

  const { mutate, isError } =
    useCreate<Database["public"]["Tables"]["challan"]["Insert"]>();
  const { data: allProducts, isLoading: allProductsLoading } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    pagination: {
      pageSize: 10000,
    },
  });
  useEffect(() => {
    if (challan && allProducts?.data) {
      const newTotalAmount: number = challan.reduce(
        (total: number, item: any) => {
          const product = allProducts.data.find(
            (product: any) => product.id === item.product_id
          );
          if (product) {
            const subtotal: number =
              item.actual_q * (product.selling_price || 0);
            const discountAmount: number =
              subtotal * (item.discount * 0.01 || 0);
            return total + subtotal - discountAmount;
          }
          return total;
        },
        0 as number
      );
      const newBillAmount: number = challan.reduce(
        (total: number, item: any) => {
          const product = allProducts.data.find(
            (product: any) => product.id === item.product_id
          );
          if (product) {
            const subtotal: number =
              item.actual_q * (product.selling_price || 0);
            return total + subtotal;
          }
          return total;
        },
        0 as number
      );

      setBillAmount(newBillAmount);
      setTotalAmount(newTotalAmount);
    }
  }, [challan, allProducts?.data]);

  const onChallanCreate = () => {
    mutate({
      resource: "challan",
      values: {
        distributor_id: sales ? bossData?.data?.boss_id : User?.id,
        product_info: challan,
        total_amt: totalAmount,
        received_amt: 0,
        pending_amt: totalAmount,
        customer_id: customer,
        bill_amt: billAmount,
        sales_id: sales ? User?.id : null,
      },
    });
    if (!isError) {
      go({
        to: { action: "list", resource: "challan" },
        options: {
          keepQuery: true,
        },
        type: "push",
      });
    }
  };
  const { selectProps: customerSelectProps } = useSelect<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    optionValue: "id",
    optionLabel: "full_name",
    filters: [
      {
        field: sales ? "sales_id" : "distributor_id",
        operator: "eq",
        value: User?.id,
      },
    ],
  });

  const [form] = Form.useForm();

  return (
    <>
      <Create
        saveButtonProps={{ style: { display: "none" } }}
        footerButtons={
          <Button type="primary" onClick={onChallanCreate} disabled={!customer || challan.length === 0}>
            Create Challan
          </Button>
        }
        headerButtons={
          <>
            <Button style={{ margin: "10px 0" }} onClick={show}>
              Add Products
            </Button>
          </>
        }
      >
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            marginBottom: "10px",
            gap: "10px",
          }}
        >
          <label>Select Customer</label>
          <Select
            style={{ width: "100%" }}
            onSelect={(value) => setCustomer(value)}
            {...customerSelectProps}
          />
        </div>
        <Table
          dataSource={challan}
          columns={[
            {
              title: "Product",
              dataIndex: "product_id",
              render: (value) => (
                <Typography.Text>
                  {
                    products.data?.data.find((product) => product.id === value)
                      ?.name
                  }
                </Typography.Text>
              ),
            },
            {
              title: "Quantity",
              dataIndex: "actual_q",
            },

            {
              title: "Free",
              dataIndex: "free_q",
            },
            {
              title: "Total",
              dataIndex: "quantity",
            },
          ]}
        />
      </Create>
      <Modal
        {...modalProps}
        okButtonProps={{ style: { display: "none" } }}
        onCancel={() => {
          form.resetFields();
          setAvailableqty(null);
          close();
        }}
      >
        <Form
          form={form}
          name="Product Challan"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
        >
          {availableqty ? (
            <Button type="text" style={{ width: "100%" }}>
              Available Quantity {availableqty}
            </Button>
          ) : null}
          <Form.Item<challanProductAddingType>
            label="Product"
            name="product_id"
            rules={[{ required: true, message: "Product is required" }]}
          >
            <Select {...productSelectProps} />
          </Form.Item>

          <Form.Item<challanProductAddingType>
            label="Quantity"
            name="quantity"
            initialValue={0}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={availableqty}
              addonAfter={availableqty}
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
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
