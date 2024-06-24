import { Database } from "@/utilities";
import { DateField, useTable } from "@refinedev/antd";
import { useGetIdentity, useList } from "@refinedev/core";
import { List, Skeleton, Table } from "antd";
import React from "react";

export const InventoryDetails = () => {
  const { data: user } = useGetIdentity<any>();

  const { tableProps, tableQueryResult } = useTable<
    Database["public"]["Tables"]["inventory"]["Row"]
  >({
    resource: "inventory",
    filters: {
      mode: "server",
      permanent: [
        {
          field: "distributor_id",
          operator: "eq",
          value: user?.id,
        },
      ],
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data.map((item) => item.product_id),
      },
    ],
    queryOptions: {
      enabled: !!user && !tableProps.loading,
    },
  });

  return (
    <List header={<h1>Inventory Details</h1>}>
      <Table {...tableProps} rowKey={"id"}>
        <Table.Column dataIndex="id" title="ID" hidden />
        <Table.Column
          dataIndex="product_id"
          title="Product ID"
          render={(value) => {
            if (isLoadingProducts) {
              return <Skeleton.Input style={{ width: 100 }} />;
            }
            const product = products?.data?.find(
              (item) => item.id === value
            ) as Database["public"]["Tables"]["products"]["Row"];
            return product?.name;
          }}
        />
        <Table.Column dataIndex="quantity" title="Quantity" />
        <Table.Column dataIndex="batch_id" title="Batch ID" />
        <Table.Column
          dataIndex="created_at"
          title="Created"
          render={(value) => <DateField value={value} />}
        />
      </Table>
    </List>
  );
};
