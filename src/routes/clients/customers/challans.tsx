import React, { useEffect } from "react";
import {
  Button,
  Flex,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  Table,
  Typography,
} from "antd";
import {
  CreateButton,
  DateField,
  FilterDropdown,
  List,
  ShowButton,
  getDefaultSortOrder,
  useModal,
  useSelect,
  useTable,
} from "@refinedev/antd";
import {
  useGetIdentity,
  useList,
  useOne,
  useParsed,
  useUpdate,
} from "@refinedev/core";
import {
  FilePdfFilled,
  PullRequestOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Database } from "@/utilities";
import { PaginationTotal, Text } from "@/components";
import { useGo } from "@refinedev/core";
import FormItem from "antd/lib/form/FormItem";

export const CustomersChallans = () => {
  const breakpoint = Grid.useBreakpoint();

  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const [IdToUpdateReceived, setIdToUpdateReceived] = React.useState<any>(null);
  const { data: User } = useGetIdentity<any>();
  const go = useGo();
  const { id } = useParsed();
  const [userFilters, setUserFilters] = React.useState<{
    userType?: string;
    userId?: string;
  } | null>(null);
  const { tableProps, tableQueryResult, sorter, filters } = useTable<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    filters: {
      permanent: [
        {
          field: "distributor_id",
          operator: "eq",
          value: User?.id,
        },
        {
          field: "status",
          operator: "eq",
          value: "BILLED",
        },
        {
          field: "customer_id",
          operator: "eq",
          value: id,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    queryOptions: {
      enabled: !!User?.id,
    },
  });
  useEffect(() => {
    if (tableQueryResult.data?.data) {
      filters.map((item: any) => {
        if (item.field === "customer_id" || item.field === "sales_id") {
          setUserFilters({
            userType: item.field,
            userId: item.value,
          });
        }
      });
    }
  }, [tableQueryResult.data?.data]);

  const { data: ChallansAmt, isLoading: isLoadingChallansAmt } = useOne({
    resource: userFilters?.userType === "customer_id" ? "customers" : "funds",
    id: userFilters ? userFilters.userId : User.id,
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });
  const { selectProps: salesSelectProps } = useSelect<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    optionLabel: "full_name",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "sales",
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  const { data: profiles, isLoading: isProfileLoading } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    pagination: {
      current: 1,
      pageSize: 100000,
    },
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data
          .filter((item) => item.sales_id)
          .map((item) => item.sales_id),
      },
    ],
    meta: {
      fields: ["id", "username"],
    },
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  const [form] = Form.useForm();
  const { close, modalProps, show } = useModal();
  const { mutate, isLoading } = useUpdate<any>();
  form.submit = async () => {
    mutate({
      resource: "challan",
      id: IdToUpdateReceived,
      values: {
        received_amt:
          tableQueryResult.data?.data.find(
            (item) => item.id === IdToUpdateReceived
          )?.received_amt + form.getFieldValue("received_amt"),
      },
    });
    close();
    form.resetFields();
    setIdToUpdateReceived(null);
  };
  const { selectProps: customerSelectProps, queryResult: Customers } =
    useSelect<Database["public"]["Tables"]["customers"]["Row"]>({
      resource: "customers",
      optionLabel: "full_name",
      optionValue: "id",
      filters: [
        {
          field: "id",
          operator: "in",
          value: tableQueryResult.data?.data
            .filter((item) => item.customer_id)
            .map((item) => item.customer_id),
        },
      ],
      queryOptions: {
        enabled: !!tableQueryResult.data,
      },
    });

  return (
    <List
      canCreate
      headerButtons={[
        <CreateButton />,
        <Button onClick={() => go({ to: "/challan/req-deletion" })}>
          <PullRequestOutlined /> Req Deletion
        </Button>,
      ]}
    >
      <Flex
        align="center"
        gap={2}
        justify="space-between"
        style={{
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
        }}
      >
        {isLoadingChallansAmt ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 0 }} />
            ))}
          </>
        ) : (
          <>
            <Text size="xl" style={{ marginBottom: 10 }}>
              Total: {ChallansAmt?.data.total_amt}
            </Text>
            <Text size="xl" style={{ marginBottom: 10 }}>
              Pending: {ChallansAmt?.data.pending_amt}
            </Text>
            <Text size="xl" style={{ marginBottom: 10 }}>
              Received: {ChallansAmt?.data.received_amt}
            </Text>{" "}
          </>
        )}
      </Flex>
      <Table
        {...tableProps}
        rowKey="id"
        bordered
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ["12", "24", "48", "96"],
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="challans" />
          ),
        }}
      >
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorter)}
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Input />
            </FilterDropdown>
          )}
          dataIndex="id"
          title="ID"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("total_amt", sorter)}
          dataIndex="total_amt"
          title="Total"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("pending_amt", sorter)}
          dataIndex="pending_amt"
          title="Pending"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("received_amt", sorter)}
          dataIndex="received_amt"
          title="Received"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("customer_id", sorter)}
          dataIndex="customer_id"
          title="customer"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Select {...customerSelectProps} style={{ width: 200 }} />
            </FilterDropdown>
          )}
          render={(value) => {
            if (Customers.data?.data.length === 0) return <Skeleton.Button />;
            return (
              <Text>
                {
                  Customers?.data?.data.find(
                    (customer) => customer.id === value
                  )?.full_name
                }
              </Text>
            );
          }}
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("sales_id", sorter)}
          dataIndex="sales_id"
          title="sales"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Select {...salesSelectProps} style={{ width: 200 }} />
            </FilterDropdown>
          )}
          render={(value) => {
            if (isProfileLoading) return <Skeleton.Button />;
            return (
              <Text>
                {
                  profiles?.data?.find((profile) => profile.id === value)
                    ?.username
                }
              </Text>
            );
          }}
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("created_at", sorter)}
          dataIndex="created_at"
          title="Created At"
          render={(value) => <DateField value={value} />}
        />
        <Table.Column
          title="Action"
          render={(row, record) => (
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                onClick={() => {
                  setIdToUpdateReceived(row.id);
                  show();
                }}
              >
                Update
              </Button>
              <ShowButton recordItemId={row.id} hideText />
              <Button
                type="primary"
                onClick={() => go({ to: `/challan/pdf/${record.id}` })}
                variant="link"
                color="default"
                icon
              >
                <FilePdfFilled />{" "}
              </Button>
            </div>
          )}
        />
      </Table>
      <Modal
        open={IdToUpdateReceived !== null}
        okButtonProps={{ onClick: () => form.submit(), htmlType: "submit" }}
        onCancel={() => {
          setIdToUpdateReceived(null);
          close();
        }}
        {...modalProps}
        title="Update Recevied Amount"
      >
        <Typography.Paragraph>
          For Challan Id : {IdToUpdateReceived}
        </Typography.Paragraph>
        <Form layout="vertical" form={form} disabled={isLoading}>
          <FormItem
            initialValue={0}
            name="received_amt"
            rules={[
              {
                required: true,
                min: -(
                  tableQueryResult.data?.data.find(
                    (item) => item.id === IdToUpdateReceived
                  )?.received_amt ?? 0
                ),
                type: "number",
                message: "Please enter a valid received amount",
                max: tableQueryResult.data?.data.find(
                  (item) => item.id === IdToUpdateReceived
                )?.pending_amt,
              },
            ]}
          >
            <InputNumber defaultValue={0} />
          </FormItem>
        </Form>
      </Modal>
    </List>
  );
};
