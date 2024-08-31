import { Database } from "@/utilities";
import { SearchOutlined } from "@ant-design/icons";
import {
    DateField,
  FilterDropdown,
  List,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import { HttpError, useGetIdentity, useGo, useUpdate } from "@refinedev/core";
import { Button, Form, Grid, Input, Modal, Select, Space, Spin, Table } from "antd";
import { debounce } from "lodash";
import React from "react";

export const OrdersList = () => {
  const { data: user } = useGetIdentity<any>();
  const screens = Grid.useBreakpoint();
  const {
    tableProps,
    tableQueryResult,
    searchFormProps,
    filters,
    sorters,
    setCurrent,
    setPageSize,
    setFilters,
  } = useTable<
    Database["public"]["Tables"]["orders"]["Row"],
    HttpError,
    { id: string }
  >({
    resource: "orders",
    onSearch: (values) => {
      return [
        {
          field: "id",
          operator: "contains",
          value: Number(values.id),
        },
      ];
    },
    sorters: {
      initial: [
        {
          field: "id",
          order: "desc",
        }
      ]
    },
    pagination: {
      pageSize: 12,
    },
  });
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchFormProps?.onFinish?.({
      id: e.target.value ?? "",
    });
  };
  const go = useGo();
  const debouncedOnChange = debounce(onSearch, 500);
  const { mutate, isLoading: updateLoading } = useUpdate();

  const handleStatusChange = (value: string, orderId: string) => {
    console.log(value, orderId);
    mutate({
      resource: "orders",
      id: orderId,
      values: {
        status: value,
      },
    });
  };
  return (
    <List
      breadcrumb={false}
      headerButtons={() => {
        return (
          <Space
            style={{
              marginTop: screens.xs ? "1.6rem" : undefined,
            }}
          >
            <Form {...searchFormProps} layout="inline">
              <Form.Item name="name" noStyle>
                <Input
                  size="large"
                  prefix={<SearchOutlined className="anticon tertiary" />}
                  suffix={
                    <Spin size="small" spinning={tableQueryResult.isFetching} />
                  }
                  placeholder="Search by id"
                  onChange={debouncedOnChange}
                />
              </Form.Item>
            </Form>
          </Space>
        );
      }}
      contentProps={{
        style: {
          marginTop: "28px",
        },
      }}
    >
      <Table {...tableProps} rowKey={"id"}>
        <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
          dataIndex="id"
          title="ID"
          sorter={{ multiple: 2 }}
          filterDropdown={(props) => (
            <FilterDropdown
              {...props}
              filters={tableQueryResult?.data?.filters}
            >
              <Input placeholder="Enter ID" />
            </FilterDropdown>
          )}
          filterIcon={<SearchOutlined />}
        />
        <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
          dataIndex={"status"}
          title="Status"
          filterDropdown={(props) => (
            <FilterDropdown
              {...props}
              filters={tableQueryResult?.data?.filters}
            >
              <Select
                style={{ width: "10rem" }}
                placeholder="Select a role"
                options={[
                  {
                    label: "Pending",
                    value: "Pending",
                  },
                  {
                    label: "Fulfilled",
                    value: "Fulfilled",
                  },
                  {
                    label: "Cancelled",
                    value: "Cancelled",
                  },
                  {
                    label: "InProcess",
                    value: "InProcess",
                  },
                  {
                    label: "Defected",
                    value: "Defected",
                  },
                ]}
              />
            </FilterDropdown>
          )}
          render={(_, record) => {
            if (record.status === "InProcess") {
              return (
                <Select
                  value={record.status}
                  style={{ width: "10rem" }}
                  status="warning"
                  onChange={(value) => {
                    Modal.confirm({
                      title: "Are you sure you want to change status?",
                      onOk: () => {
                        handleStatusChange(value, record.id.toString());
                      },
                      type: "confirm",
                    });
                  }}
                >
                  <Select.Option value={"Fulfilled"}>
                    Fulfilled
                  </Select.Option>
                  <Select.Option value={"Defected"}>
                    Defected
                  </Select.Option>
                </Select>
              );
            }
            return (
              <Select
                value={record.status}
                style={{ width: "10rem" }}
                dropdownStyle={{ display: "none" }}
              >
                <Select.Option value={"Fulfilled"}>
                  Fulfilled
                </Select.Option>
              </Select>
            );
          }}
        />
        <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
          dataIndex="created_at"
          title="Created At"
          sorter={{ multiple: 2 }}
          render={(_, record) => (
            <DateField value={record.created_at} format="DD/MM/YYYY" />
          )}
        />
        <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
          title="Action"
          render={(_, record) => (
            <Button
              onClick={() =>
                go({
                  to: { action: "show", resource: "orders", id: record.id },
                })
              }
              type="dashed"
              size="small"
            >
              View Detail
            </Button>
          )}
        />
      </Table>
    </List>
  );
};
