import { Database } from "@/utilities";
import { OrderStatus } from "@/utilities/functions";
import { NumberField, Show, TextField, useTable } from "@refinedev/antd";
import { HttpError, useGo, useList } from "@refinedev/core";
import { Button, Flex, Select, Skeleton, Table } from "antd";
import { useLocation } from "react-router-dom";

export const OrdersShow = () => {
  const orderId = useLocation().pathname.split("/").pop();
  const { tableProps, tableQueryResult: order } = useTable<any, HttpError>({
    resource: "orders",
    filters: {
      permanent: [
        {
          field: "id",
          operator: "eq",
          value: orderId ?? "",
        },
      ],
    },
  });

  const go = useGo();

  const expandedRowRender = (record: any) => {
    if (order.data?.data[0].status === OrderStatus.Fulfilled) {
      const columns = [
        {
          title: "Batch ID",
          dataIndex: "batch_id",
          key: "batch_id",
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          key: "quantity",
        },
      ];

      return (
        <Table
          columns={columns}
          dataSource={record.batch_info}
          pagination={false}
          bordered
          showHeader
        />
      );
    }

    return null;
  };

  const { data: products, isLoading: productsLoading } = useList<
    Database["public"]["Tables"]["products"]["Row"],
    HttpError
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: order?.data?.data[0]?.order?.map((item: any) => item.product_id),
      },
    ],
    pagination: {
      current: 1,
      pageSize: 1000,
    },
  });

  return (
    <Show canDelete={false} canEdit={false}>
      <Flex justify="space-between">
        <h2>Order Id: {orderId}</h2>
      </Flex>
      <Table
        {...tableProps}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
        dataSource={order.data?.data[0].order}
        pagination={false}
        rowKey="key"
        title={() => <h2>Products</h2>}
        bordered
        showHeader
      >
        <Table.Column
          title="No"
          dataIndex="key"
          render={(value) => {
            return <NumberField value={value} />;
          }}
        />
        <Table.Column
          title="Product"
          dataIndex="product_id"
          render={(value, record: any) => {
            return productsLoading ? (
              <Skeleton.Input active />
            ) : (
              <Button
                type="dashed"
                onClick={() =>
                  go({
                    to: {
                      action: "show",
                      resource: "products",
                      id: value,
                    },
                  })
                }
              >
                {products?.data.find((product) => product.id === value)?.name}
              </Button>
            );
          }}
        />
        <Table.Column
          title="Quantity"
          dataIndex={"quantity"}
          render={(value, record: any) => {
            return <NumberField value={value} />;
          }}
        />
      </Table>
    </Show>
  );
};
