import { useRef, useState, type FC } from "react";

import {
  FilterDropdown,
  ShowButton,
  TextField,
  useSelect,
} from "@refinedev/antd";
import {
  type CrudFilters,
  type CrudSorting,
  getDefaultFilter,
  useGetIdentity,
} from "@refinedev/core";

import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Input,
  InputRef,
  Select,
  Space,
  Table,
  type TableProps,
} from "antd";
import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";

type Props = {
  tableProps: TableProps<Database["public"]["Tables"]["profiles"]["Row"]>;
  filters: CrudFilters;
  sorters: CrudSorting;
  tableQueryResult: any;
};
let index = 0;

export const SalesTableView: FC<Props> = ({
  tableProps,
  sorters,
  filters,
  tableQueryResult,
}) => {
  const [items, setItems] = useState(["30m", "1h", "24h", "7d", "30d"]);
  const [name, setName] = useState("");
  const inputRef = useRef<InputRef>(null);
  const { data: User } = useGetIdentity<any>();


  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setItems([...items, name || `New item ${index++}`]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const { selectProps } = useSelect({
    resource: "profiles",
    filters: [
      {
        field: " role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "boss_id",
        operator: "eq",
        value: User?.id,
      }],
    optionLabel: "username",
    optionValue: "username",
    defaultValue: getDefaultFilter("profiles.username", filters, "in"),
  });

  const { selectProps:selectEmailProps } = useSelect({
    resource: "profiles",
    filters: [
      {
        field: " role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "boss_id",
        operator: "eq",
        value: User?.id,
      }],
    optionLabel: "email",
    optionValue: "email",
    defaultValue: getDefaultFilter("profiles.email", filters, "in"),
  });

  const { selectProps:selectFullNameProps } = useSelect({
    resource: "profiles",
    filters: [
      {
        field: " role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "boss_id",
        operator: "eq",
        value: User?.id,
      }],
    optionLabel: "full_name",
    optionValue: "full_name",
    defaultValue: getDefaultFilter("profiles.full_name", filters, "in"),
  });

  const { selectProps:selectPhnProps } = useSelect({
    resource: "profiles",
    filters: [
      {
        field: " role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "boss_id",
        operator: "eq",
        value: User?.id,
      }],
    optionLabel: "phone",
    optionValue: "phone",
    defaultValue: getDefaultFilter("profiles.phone", filters, "in"),
  });

  return (
    <Table
      {...tableProps}
      pagination={{
        ...tableProps.pagination,
        pageSizeOptions: ["12", "24", "48", "96"],
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="profiles" />
        ),
      }}
      rowKey="id"
    >
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="id"
        title="ID"
        hidden
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="username"
        title="Name"
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
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="email"
        title="email"
        filterIcon={<SearchOutlined />}
        filterDropdown={(props) => (
          <FilterDropdown {...props} mapValue={(value) => value}>
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              {...selectEmailProps}
            />
          </FilterDropdown>
        )}
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="full_name"
        title="Full Name"
        filterIcon={<SearchOutlined />}
        filterDropdown={(props) => (
          <FilterDropdown {...props} mapValue={(value) => value}>
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              {...selectFullNameProps}
            />
          </FilterDropdown>
        )}
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="phone"
        title="phone"
        filterIcon={<SearchOutlined />}
        filterDropdown={(props) => (
          <FilterDropdown {...props} mapValue={(value) => value}>
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              {...selectPhnProps}
            />
          </FilterDropdown>
        )}
        render={(value) => <TextField value={"+91 " + value} />}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="boss_id" hidden
        title="Distributor"
        render={(value) => value}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        fixed="right"
        dataIndex="id"
        title="Actions"
        render={(value, row) => (
          <Space>
            <ShowButton
              icon={<EyeOutlined />}
              hideText
              size="small"
              recordItemId={value}
            />

            <Select
              style={{ width: 100 }}
              placeholder="BAN"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Space style={{ padding: "0 8px 4px" }}>
                    <Input
                      placeholder="xh"
                      ref={inputRef}
                      value={name}
                      onChange={onNameChange}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={addItem}
                    >
                      Add item
                    </Button>
                  </Space>
                </>
              )}
              size="small"
              options={items.map((item) => ({ label: item, value: item }))}
            />
            {/* <DeleteButton hideText size="small" recordItemId={value} /> */}
          </Space>
        )}
      />
    </Table>
  );
};
