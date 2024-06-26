import type { FC } from "react";

import {
  DateField,
  EditButton,
  FilterDropdown,
  TextField,
  getDefaultSortOrder,
} from "@refinedev/antd";
import {
  type CrudFilters,
  type CrudSorting,
  getDefaultFilter,
} from "@refinedev/core";

import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Table, type TableProps } from "antd";
import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";

type Props = {
  tableProps: TableProps<Database["public"]["Tables"]["products"]["Row"]>;
  filters: CrudFilters;
  sorters: CrudSorting;
};

export const ProductsTableView: FC<Props> = ({ tableProps, filters, sorters }) => {
  return (
    <Table
      {...tableProps}
      pagination={{
        ...tableProps.pagination,
        pageSizeOptions: ["12", "24", "48", "96"],
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="products" />
        ),
      }}
      rowKey="id"
    >
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="id"
        title="ID"
        hidden
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="name"
        title="Name"
        defaultFilteredValue={getDefaultFilter("name", filters)}
        filterIcon={<SearchOutlined />}
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Input placeholder="Search Product" />
          </FilterDropdown>
        )}
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="mrp"
        title="MRP"
        sorter={{ multiple: 2 }}
        defaultSortOrder={getDefaultSortOrder("mrp", sorters)}
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="selling_price"
        title="Selling Price"
        sorter={{ multiple: 2 }}
        defaultSortOrder={getDefaultSortOrder("selling_price", sorters)}
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="description"
        title="Description"
        render={(value) => <TextField value={value} />}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="base_q"
        hidden
        title="Base Quantity"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="free_q"
        hidden
        title="Free Quantity"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        dataIndex="created_at"
        title="Created At"
        sorter={{ multiple: 2 }}
        defaultSortOrder={getDefaultSortOrder("created_at", sorters)}
        render={(value) => <DateField value={value} />}
      />
      <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
        fixed="right"
        dataIndex="id"
        title="Actions"
        render={(value) => (
          <EditButton
            icon={<EyeOutlined />}
            hideText
            size="small"
            recordItemId={value}
          />
        )}
      />
    </Table>
  );
};
