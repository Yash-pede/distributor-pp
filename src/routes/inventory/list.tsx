import { Database } from "@/utilities";
import { SearchOutlined } from "@ant-design/icons";
import {
  FilterDropdown,
  Show,
  getDefaultSortOrder,
  useSelect,
  useTable,
} from "@refinedev/antd";
import {
  getDefaultFilter,
  useGetIdentity,
  useGo,
  useList,
} from "@refinedev/core";
import { Button, Select, Skeleton, Table } from "antd";
import React from "react";

export const InventoryList = () => {
  const { data: user } = useGetIdentity<any>();
  const [productWiseArrange, setProductWiseArrange] = React.useState<any>([]);
  const go = useGo();

  const { tableProps, tableQueryResult, filters, sorters } = useTable<
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

  React.useEffect(() => {
    const productWiseData: { [productId: string]: any } = {};

    tableQueryResult?.data?.data.forEach((item) => {
      const productId = item.product_id;
      const quantity = item.quantity;

      if (productId in productWiseData) {
        productWiseData[productId].quantity += quantity;
      } else {
        productWiseData[productId] = {
          productId,
          quantity,
        };
      }
    });

    const arrangedProducts = Object.values(productWiseData);

    setProductWiseArrange(arrangedProducts);
  }, [isLoadingProducts, tableQueryResult]);

  const { selectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
    defaultValue: getDefaultFilter("products.name", filters, "in"),
  });

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
      <Table {...tableProps} dataSource={productWiseArrange} rowKey={"id"}>
        <Table.Column dataIndex="id" title="ID" hidden />
        <Table.Column
          dataIndex="productId"
          title="Product ID"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Select
                style={{ minWidth: 200 }}
                mode="multiple"
                {...selectProps}
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
          defaultSortOrder={getDefaultSortOrder("quantity", sorters)}
        />
        <Table.Column
          title="Details"
          render={() => (
            <Button
              type="link"
              onClick={() =>
                go({
                  to: { action: "show", resource: "inventory", id: "details" },
                })
              }
            >
              Details
            </Button>
          )}
        />
      </Table>
    </Show>
  );
};
