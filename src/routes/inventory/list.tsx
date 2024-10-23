import { Database } from "@/utilities";
import { DateField, FilterDropdown, getDefaultSortOrder, Show, useSelect, useTable } from "@refinedev/antd";
import { useGetIdentity, useGo, useList } from "@refinedev/core";
import { Button, Select, Skeleton, Table } from "antd";
import React, { useEffect } from "react";

export const InventoryList = () => {
  const { data: user } = useGetIdentity<any>();
  const [productWiseArrange, setProductWiseArrange] = React.useState<any>([]);
  const go = useGo();
  const { tableProps, tableQueryResult,sorters } = useTable<
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
    pagination: {
      mode:"off"
    }
  });
  const { data: BatchDetails, isLoading: isLoadingBatch } = useList<
    Database["public"]["Tables"]["stocks"]["Row"]
  >({
    resource: "stocks",
    pagination: {
      current: 1,
      pageSize: 1000,
    },
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data.map((item) => item.batch_id),
      },
    ],
    queryOptions: {
      meta: {
        select: "id, expiry_date",
      },
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    pagination: {
      current: 1,
      pageSize: 1000,
    },
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

  const { selectProps: productSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
  });

  useEffect(() => {
    const productWiseData: {
      [id: string]: {
        id: number;
        batches: { batchId: string; quantity: number }[];
        quantity: number;
      };
    } = {};

    tableQueryResult?.data?.data.forEach((item) => {
      const id = item.product_id;
      const batchId = item.batch_id;
      const quantity = item.quantity;

      if (id in productWiseData) {
        productWiseData[id].batches.push({
          batchId,
          quantity,
        });
        productWiseData[id].quantity += quantity;
      } else {
        productWiseData[id] = {
          id,
          batches: [
            {
              batchId,
              quantity,
            },
          ],
          quantity,
        };
      }
    });

    const arrangedProducts = Object.values(productWiseData);

    setProductWiseArrange(arrangedProducts);
  }, [isLoadingProducts, tableQueryResult]);
  const expandedRowRender = (record: any) => {
    const columns = [
      {
        title: "Batch ID",
        dataIndex: "batchId",
        key: "batchId",
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Expiry date",
        dataIndex: "batchId",
        key: "batchId",
        render: (value: any) => {
          return (
            <DateField
              value={
                BatchDetails?.data?.find((item) => item.id === value)
                  ?.expiry_date
              }
            />
          );
        },
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={record.batches}
        pagination={false}
        bordered
        showHeader
      />
    );
  };
  return (
    <Show
      headerButtons={
        <Button
          onClick={() =>
            go({
              to: { action: "show", resource: "inventory", id: "details" },
            })
          }
        >
          Details
        </Button>
      }
    >
      <Table
        {...tableProps}
        rowKey={"id"}
        dataSource={productWiseArrange} 
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
      >
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column
          dataIndex="id"
          title="Product ID"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                mode="multiple"
                style={{ minWidth: 200 }}
                placeholder="Select Products"
                {...productSelectProps}
              />
            </FilterDropdown>
          )}
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
        <Table.Column
          dataIndex="quantity"
          title="Quantity"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorters)}
        />
      </Table>
    </Show>
  );
};
