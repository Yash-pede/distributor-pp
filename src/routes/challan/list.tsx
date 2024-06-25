import React from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Table,
  Typography,
} from "antd";
import {
  FilterDropdown,
  List,
  ShowButton,
  getDefaultSortOrder,
  useModal,
  useTable,
} from "@refinedev/antd";
import { useGetIdentity, useList, useUpdate } from "@refinedev/core";
import FormItem from "antd/lib/form/FormItem";
import { SearchOutlined } from "@ant-design/icons";
import { Database } from "@/utilities";

export const ChallanList = ({ sales }: { sales?: boolean }) => {
  const [IdToUpdateReceived, setIdToUpdateReceived] = React.useState<any>(null);
  const { data: User } = useGetIdentity<any>();

  const { data: Customers, isLoading: isLoadingCustomers } = useList<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    filters: [
      {
        field: sales ? "sales_id" : "distributor_id",
        operator: "eq",
        value: User?.id,
      },
    ],
  });

  const { tableProps, tableQueryResult, sorter } = useTable<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    filters: {
      permanent: [
        {
          field: "customer_id",
          operator: "in",
          value: Customers?.data?.map((item) => item.id),
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
  return (
    <List canCreate>
      <Flex justify="space-between" align="center" gap={2}>
        <Typography.Paragraph>
          Total:{" "}
          {tableQueryResult.data?.data.reduce((a, b) => a + b.total_amt, 0)}
        </Typography.Paragraph>
        <Typography.Paragraph>
          Pending:{" "}
          {tableQueryResult.data?.data.reduce((a, b) => a + b.pending_amt, 0)}
        </Typography.Paragraph>
        <Typography.Paragraph>
          Received:{" "}
          {tableQueryResult.data?.data.reduce((a, b) => a + b.received_amt, 0)}
        </Typography.Paragraph>
      </Flex>
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
          title="Action"
          render={(row) => (
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                onClick={() => {
                  setIdToUpdateReceived(row.id);
                  show();
                }}
              >
                Update
              </Button>
              <ShowButton recordItemId={row.id} />
            </div>
          )}
        />
      </Table>
      <Modal
        visible={IdToUpdateReceived !== null}
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
                min: 1,
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
