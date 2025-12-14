import React, { useEffect, useState } from "react";
import {
  useCreate,
  useGetIdentity,
  useGo,
  useList,
  useOne,
} from "@refinedev/core";
import { Create, useSelect } from "@refinedev/antd";
import { Button, Select, Table, Typography, Skeleton } from "antd";
import { challanProductAddingType } from "@/utilities/constants";
import { Database } from "@/utilities";
import CreateProductInChallan from "./components/createProductInChallan";
import { IconX } from "@tabler/icons-react";

export const ChallanCreate = ({ sales }: { sales?: boolean }) => {
  const go = useGo();
  const [challan, setChallan] = React.useState<challanProductAddingType[]>([]);
  const [customer, setCustomer] = React.useState<any>();
  const [totalAmount, setTotalAmount] = React.useState<any>();
  const [billAmount, setBillAmount] = React.useState<any>();
  const { data: User } = useGetIdentity<any>();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  const { data: userData } = useOne<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    id: User?.id,
    queryOptions: {
      enabled: !!User,
    },
  });

  // Fetch customer full data when selected
  const { data: selectedCustomerData } = useOne<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    id: customer || undefined,
    queryOptions: {
      enabled: !!customer,
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
        value: sales ? userData?.data?.boss_id : User?.id,
      },
    ],
    pagination: {
      current: 1,
      pageSize: 1000,
    },
  });

  const { selectProps: productSelectProps, query: productResult } = useSelect({
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
    onSearch: (value) => [
      {
        field: "name",
        operator: "contains",
        value,
      },
    ],
    pagination: {
      current: 1,
      pageSize: 1000,
    },
  });

  const { data: productsData, isLoading: isLoadingProductsData } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: challan.map((item: any) => item.product_id),
      },
    ],
    pagination: {
      current: 1,
      pageSize: 1000,
    },
    meta: {
      select: "name,id",
    },
  });

  const { mutate, isError } = useCreate<
    Database["public"]["Tables"]["challan"]["Insert"]
  >();

  useEffect(() => {
    if (challan && challan.length > 0) {
      const newTotalAmount = challan.reduce((total: number, item: any) => {
        const actualQuantity = item.actual_q || 0;
        const sellingPrice = item.selling_price || 0;
        const discount = item.discount || 0;
        const subtotal = actualQuantity * sellingPrice;
        const discountAmount = subtotal * (discount / 100);
        return total + subtotal - discountAmount;
      }, 0);

      const newBillAmount = challan.reduce((total: number, item: any) => {
        const actualQuantity = item.actual_q || 0;
        const sellingPrice = item.selling_price || 0;
        return total + actualQuantity * sellingPrice;
      }, 0);

      setBillAmount(parseFloat(newBillAmount.toFixed(2)));
      setTotalAmount(parseFloat(newTotalAmount.toFixed(2)));
    } else {
      setBillAmount(0);
      setTotalAmount(0);
    }
  }, [challan]);

  // Build metadata conditionally
  const buildMetadata = () => {
    const baseMetadata = {
      distributor: sales ? null : userData?.data,
    };

    // Only add customer to metadata if customer is selected
    if (customer && selectedCustomerData?.data) {
      return {
        ...baseMetadata,
        customer: selectedCustomerData.data, // Full customer data
      };
    }

    // Only add sales to metadata if sales mode is active
    if (sales) {
      return {
        ...baseMetadata,
        sales: userData?.data,
      };
    }

    return baseMetadata;
  };

  const onChallanCreate = () => {
    mutate({
      resource: "challan",
      values: {
        distributor_id: sales ? userData?.data?.boss_id : User?.id,
        product_info: challan,
        total_amt: totalAmount,
        received_amt: 0,
        pending_amt: totalAmount,
        customer_id: customer || null, // Still send customer_id for DB relation
        bill_amt: billAmount,
        sales_id: sales ? User?.id : null,
        metadata: buildMetadata(), // Conditional metadata
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

  return (
    <>
      <Create
        saveButtonProps={{ style: { display: "none" } }}
        footerButtons={
          <Button
            type="primary"
            onClick={onChallanCreate}
            disabled={!customer || challan.length === 0}
          >
            Create Challan
          </Button>
        }
        headerButtons={
          <>
            <Button style={{ margin: "10px 0" }} onClick={() => setOpenDrawer(true)}>
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
          style={{ overflow: "auto" }}
          footer={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "20px",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              <div>Total Amount: {totalAmount}</div>
            </div>
          )}
          columns={[
            {
              title: "Product",
              dataIndex: "product_id",
              render: (value) => {
                if (isLoadingProductsData) return <Skeleton.Button />;
                return (
                  <Typography.Text>
                    {productsData?.data?.find((product) => product.id === value)?.name}
                  </Typography.Text>
                );
              },
            },
            { title: "Quantity", dataIndex: "actual_q" },
            { title: "Free", dataIndex: "free_q" },
            { title: "Price", dataIndex: "selling_price" },
            { title: "Total", dataIndex: "quantity" },
            {
              title: "total Amount",
              render: (value) => {
                const actualQuantity = value.actual_q || 0;
                const sellingPrice = value.selling_price || 0;
                const discount = value.discount || 0;
                const subtotal = actualQuantity * sellingPrice;
                const discountAmount = subtotal * (discount / 100);
                const totalAmount = subtotal - discountAmount;
                return <Typography.Text>{totalAmount.toFixed(2)}</Typography.Text>;
              },
            },
            {
              title: "Action",
              render: (value) => (
                <Button
                  variant="filled"
                  color="danger"
                  size="small"
                  onClick={() =>
                    setChallan((prev: challanProductAddingType[]) =>
                      prev.filter((item) => item.product_id !== value.product_id)
                    )
                  }
                >
                  <IconX />
                </Button>
              ),
            },
          ]}
        />
      </Create>
      <CreateProductInChallan
        openDrawer={openDrawer}
        productSelectProps={productSelectProps}
        challan={challan}
        setChallan={setChallan}
        setOpenDrawer={setOpenDrawer}
      />
    </>
  );
};
