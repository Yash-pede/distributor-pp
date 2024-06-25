import { Database } from "@/utilities";
import { SearchOutlined } from "@ant-design/icons";
import { CreateButton, EditButton, ExportButton, FilterDropdown, List, SaveButton, ShowButton, TextField, getDefaultFilter, useEditableTable, useSelect } from "@refinedev/antd";
import { useExport, useGetIdentity, useList } from "@refinedev/core";
import { Button, Flex, Form, Input, Select, Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";

export const CustomersList = ({ children }: { children?: React.ReactNode }) => {
  const { data: User } = useGetIdentity<any>();

  const {
    tableProps,
    formProps,
    isEditing,
    setId: setEditId,
    saveButtonProps,
    cancelButtonProps,
    editButtonProps,
    filters,
  } = useEditableTable<Database["public"]["Tables"]["customers"]["Row"]>({
    resource: "customers",
    filters: {
      permanent: [
        {
          field: "distributor_id",
          operator: "eq",
          value: User?.id,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "id",
          order: "asc",
        },
      ],
    },
  });
  const { data: SalesUserList, isLoading: SalesUserListLoading } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "boss_id",
        operator: "eq",
        value: User?.id,
      },
    ],
    sorters: [
      {
        field: "id",
        order: "asc",
      },
    ],
  });

  const { isLoading, triggerExport } = useExport({
    resource: "customers",
    filters: [
      {
        field: "distributor_id",
        operator: "eq",
        value: User?.id,
      },
    ],
    sorters: [
      {
        field: "id",
        order: "asc",
      },
    ],
    download: true,
    onError(error) {
      console.error(error);
    },
    mapData: (record) => {
      return {
        id: record.id,
        full_name: record.full_name,
        phone: record.phone || "-",
        email: record.email || "-",
        created_at: dayjs(record.created_at).format("DD/MM/YYYY"),
        distributor_id: record.distributor_id,
        sales_id: record.sales_id,
      };
    },
    exportOptions: {
      filename: "Customer Details",
    },
  });

  const { selectProps } = useSelect({
    resource: "customers",
    optionLabel: "full_name",
    optionValue: "full_name",
    filters: [
      {
        field: "distributor_id",
        operator: "eq",
        value: User.id,
      },
    ],
    defaultValue: getDefaultFilter("customers.full_name", filters, "in"),
  });

  const { selectProps: selectEmailProps } = useSelect({
    resource: "customers",
    optionLabel: "email",
    optionValue: "email",
    filters: [
      {
        field: "distributor_id",
        operator: "eq",
        value: User?.id,
      },
    ],
    defaultValue: getDefaultFilter("customers.email", filters, "in"),
  });

  const { selectProps: selectPhoneProps } = useSelect({
    resource: "customers",
    optionLabel: "phone",
    optionValue: "phone",
    filters: [
      {
        field: "distributor_id",
        operator: "eq",
        value: User?.id,
      },
    ],
    defaultValue: getDefaultFilter("customers.phone", filters, "in"),
  });

  const { selectProps: selectPersonProps } = useSelect({
    resource: "profiles",
    optionLabel: "username",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "boss_id",
        operator: "eq",
        value: User.id,
      },
    ],
    defaultValue: getDefaultFilter("profiles.username", filters, "in"),
  });

  return (
    <>
      <div>
        <List
          headerButtons={
            <>
              <ExportButton onClick={triggerExport} loading={isLoading} />
              <CreateButton />
            </>
          }
        >
          <Form {...formProps}>
            <Table
              {...tableProps}
              rowKey="id"
              onRow={(record) => ({
                // eslint-disable-next-line
                onClick: (event: any) => {
                  if (event.target.nodeName === "TD") {
                    setEditId && setEditId(record.id);
                  }
                },
              })}
            >
              <Table.Column dataIndex="id" title="ID" hidden />

              <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
                dataIndex="full_name"
                title="Full Name"
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
                render={(value, record) => {
                  if (isEditing(record.id)) {
                    return (
                      <Form.Item name="full_name" style={{ margin: 0 }}>
                        <Input />
                      </Form.Item>
                    );
                  }
                  return <TextField value={value} />;
                }}
              />

              <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
                dataIndex="specialization"
                title="specialization"
                render={(value, record) => {
                  if (isEditing(record.id)) {
                    return (
                      <Form.Item name="specialization" style={{ margin: 0 }}>
                        <Input />
                      </Form.Item>
                    );
                  }
                  return <TextField value={value} />;
                }}
              />
              <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
                dataIndex="email"
                title="Email"
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
                render={(value, record) => {
                  if (isEditing(record.id)) {
                    return (
                      <Form.Item name="email" style={{ margin: 0 }}>
                        <Input />
                      </Form.Item>
                    );
                  }
                  return <TextField value={value} />;
                }}
              />

              <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
                dataIndex="phone"
                title="Phone"
                filterIcon={<SearchOutlined />}
                filterDropdown={(props) => (
                  <FilterDropdown {...props} mapValue={(value) => value}>
                    <Select
                      style={{ minWidth: 200 }}
                      mode="multiple"
                      {...selectPhoneProps}
                    />
                  </FilterDropdown>
                )}
                render={(value, record) => {
                  if (isEditing(record.id)) {
                    return (
                      <Form.Item name="phone" style={{ margin: 0 }}>
                        <Input />
                      </Form.Item>
                    );
                  }
                  return <TextField value={"+91  " + value} />;
                }}
              />

              <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
                dataIndex="sales_id"
                title="Sales Person"
                filterIcon={<SearchOutlined />}
                filterDropdown={(props) => (
                  <FilterDropdown {...props} mapValue={(value) => value}>
                    <Select
                      style={{ minWidth: 200 }}
                      mode="multiple"
                      {...selectPersonProps}
                    />
                  </FilterDropdown>
                )}
                render={(value, record) => {
                  if (isEditing(record.id)) {
                    return (
                      <Form.Item name="sales_id" style={{ margin: 0 }}>
                        <Select>
                          {SalesUserList?.data.map((user) => (
                            <Select.Option key={user.id} value={user.id}>
                              {user.username}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    );
                  }
                  return (
                    <TextField
                      value={
                        SalesUserList?.data.find((user) => user.id === value)
                          ?.username
                      }
                    />
                  );
                }}
              />

              <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
                title="Actions"
                dataIndex="actions"
                render={(_, record) => {
                  if (isEditing(record.id)) {
                    return (
                      <Space>
                        <SaveButton
                          {...saveButtonProps}
                          hideText
                          size="small"
                        />
                        <Button {...cancelButtonProps} size="small">
                          Cancel
                        </Button>
                      </Space>
                    );
                  }
                  return (
                    <Flex gap={15}>
                      <EditButton
                        {...editButtonProps(record.id)}
                        hideText
                        size="small"
                      />
                      <ShowButton size="small" recordItemId={record.id} />
                    </Flex>
                  );
                }}
              />
            </Table>
          </Form>
        </List>
      </div>
      {children}
    </>
  );
};
