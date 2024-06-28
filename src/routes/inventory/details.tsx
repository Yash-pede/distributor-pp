import { Database } from "@/utilities";
import { SearchOutlined } from "@ant-design/icons";
import {
  DateField,
  FilterDropdown,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { getDefaultFilter, getDefaultSortOrder, useGetIdentity, useList } from "@refinedev/core";
import { List, Select, Skeleton, Table } from "antd";
import React from "react";

export const InventoryDetails = () => {
  const { data: user } = useGetIdentity<any>();

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

  const { selectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
    defaultValue: getDefaultFilter("products.name", filters, "in"),
  });

  const { selectProps: selectBatchProps } = useSelect({
    resource: "inventory",
    optionLabel: "batch_id",
    optionValue: "batch_id",
    defaultValue: getDefaultFilter("inventory.batch_id", filters, "in"),
  });

  return (
    <List header={<h1>Inventory Details</h1>}>
      <Table {...tableProps} rowKey={"id"}>
        <Table.Column dataIndex="id" title="ID" hidden />
        <Table.Column
          dataIndex="product_id"
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
          dataIndex="batch_id"
          title="Batch ID"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Select
                style={{ minWidth: 200 }}
                mode="multiple"
                {...selectBatchProps}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="created_at"
          title="Created"
          render={(value) => <DateField value={value} />}
        />
      </Table>
    </List>
  );
};
