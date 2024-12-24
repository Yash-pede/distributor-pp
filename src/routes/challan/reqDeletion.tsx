import {
  Button,
  Input,
  Select,
  Skeleton,
  Table,
} from "antd";
import {
  DateField,
  FilterDropdown,
  List,
  ShowButton,
  getDefaultSortOrder,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useGetIdentity, useGo, useList } from "@refinedev/core";
import {
  FilePdfFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { Database } from "@/utilities";
import { Text } from "@/components";

export const ReqDeletionChallan = ({ sales }: { sales?: boolean }) => {
  const { data: User } = useGetIdentity<any>();
  const go = useGo();

  const { tableProps, tableQueryResult, sorter } = useTable<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    filters: {
      permanent: [
        {
          field: sales ? "sales_id" : "distributor_id",
          operator: "eq",
          value: User?.id,
        },
        {
          field: "status",
          operator: "eq",
          value: "REQ_DELETION",
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

  const { data: profiles, isLoading: isProfileLoading } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
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
    <List canCreate={false} breadcrumb={false} title="Request for Deletion">
      <Table {...tableProps} rowKey="id" bordered>
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
    </List>
  );
};
