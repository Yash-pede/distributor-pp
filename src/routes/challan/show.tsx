import { Text } from "@/components";
import { Database } from "@/utilities";
import { Loading3QuartersOutlined, StarOutlined } from "@ant-design/icons";
import { Show, useModal, useTable } from "@refinedev/antd";
import { useGo, useList, useOne, useUpdate } from "@refinedev/core";
import { IconTrash } from "@tabler/icons-react";
import { Button, Card, Flex, Grid, Modal, Skeleton, Space, Table } from "antd";
import React from "react";
import { useLocation } from "react-router-dom";

export const ChallanShow = () => {
  const breakpoint = Grid.useBreakpoint();

  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const challanId = useLocation().pathname.split("/").pop();
  const go = useGo();
  const { data: challan, isLoading: isLoading } = useOne<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    id: challanId,
  });

  const { data: customer, isLoading: isLoadingCustomer } = useOne<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    meta: {
      select: "full_name",
    },
    id: challan?.data.customer_id,
  });

  const { data: sales, isLoading: isLoadingSales } = useOne<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    meta: {
      select: "full_name",
    },
    id: challan?.data.sales_id || "",
    queryOptions: {
      enabled: !!challan?.data.sales_id,
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
        value: Array.isArray(challan?.data?.product_info)
          ? challan?.data?.product_info.map((item: any) => item.product_id)
          : [],
      },
    ],
    meta: {
      select: "name,id",
    },
    queryOptions: {
      enabled: !!challan?.data.product_info,
    },
  });

  const { tableProps } = useTable<
    Database["public"]["Tables"]["challan_batch_info"]["Row"]
  >({
    resource: "challan_batch_info",
    filters: {
      mode: "server",
      permanent: [
        {
          field: "challan_id",
          operator: "eq",
          value: challanId,
        },
      ],
    },
    queryOptions: {
      enabled: !!challanId,
    },
  });

  const { mutate, isLoading: updateingChallanStatus } = useUpdate({
    id: challanId,
    resource: "challan",
  });

  const gridStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
  };
  const { show, modalProps } = useModal();
  const { show: ShowBatch, modalProps: BatchModalProps } = useModal();

  return (
    <Show>
      {isLoading || isLoadingCustomer || isLoadingProducts ? (
        <Skeleton active />
      ) : (
        <Card
          title={
            <Flex
              gap={10}
              style={{
                flexDirection: isMobile ? "column" : "row",
                alignItems: "flex-start",
              }}
            >
              <Flex gap={10} align="center">
                <StarOutlined className="sm" />
                <Text size="xl">Challan: {challanId}</Text>
              </Flex>
              <Button
                type="primary"
                onClick={() => go({ to: `/challan/pdf/${challanId}` })}
              >
                View Pdf
              </Button>
              <Button
                type="default"
                onClick={() =>
                  mutate({
                    id: challanId,
                    values: { gst_bill_status: "REQUESTED" },
                  })
                }
                disabled={challan?.data.gst_bill_status !== "PENDING" && challan?.data.status === "BILLED"}
              >
                Request GST Bill
              </Button>
              <Button
                type="default"
                variant="outlined"
                danger
                hidden={challan?.data.status !== "BILLED"}
                onClick={() =>
                  mutate({ id: challanId, values: { status: "REQ_DELETION" } })
                }
              >
                {updateingChallanStatus ? (
                  <Loading3QuartersOutlined />
                ) : (
                  <IconTrash />
                )}
                Delete
              </Button>
            </Flex>
          }
          headStyle={{
            padding: "1rem",
          }}
          bodyStyle={{
            padding: "0",
          }}
          style={{
            marginTop: "1rem",
          }}
        >
          <Card.Grid style={gridStyle}>
            <Space size="middle">
              <Text size="lg" strong>
                Customer Name:
              </Text>
              <Text size="lg">{customer?.data.full_name}</Text>
            </Space>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Space size="middle">
              <Text size="lg" strong>
                Total Amount:
              </Text>
              <Text size="lg">{challan?.data.total_amt}</Text>
            </Space>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Space size="middle">
              <Text size="lg" strong>
                Pending Amount:
              </Text>
              <Text size="lg">{challan?.data.pending_amt}</Text>
            </Space>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Space size="middle">
              <Text size="lg" strong>
                Received Amount:
              </Text>
              <Text size="lg">{challan?.data.received_amt}</Text>
            </Space>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Space size="middle">
              <Text size="lg" strong>
                Product Info:
              </Text>
              <Button onClick={show}>View</Button>
              <Modal
                okButtonProps={{ style: { display: "none" } }}
                {...modalProps}
              >
                <Table
                  dataSource={
                    challan?.data.product_info as Array<{
                      discount: number;
                      quantity: number;
                      product_id: number;
                    }>
                  }
                  columns={[
                    {
                      title: "Product Id",
                      dataIndex: "product_id",
                      render: (value) => {
                        if (isLoadingProducts) return <Skeleton.Button />;
                        return products?.data.find(
                          (product) => product.id === value
                        )?.name;
                      },
                    },
                    {
                      title: "Quantity",
                      dataIndex: "quantity",
                    },
                    {
                      title: "Discount",
                      dataIndex: "discount",
                    },
                  ]}
                />
              </Modal>
            </Space>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Space size="middle">
              <Text size="lg" strong>
                Batch Info:
              </Text>
              <Button onClick={ShowBatch}>View</Button>
              <Modal
                okButtonProps={{ style: { display: "none" } }}
                {...BatchModalProps}
              >
                <Table
                  {...tableProps}
                  columns={[
                    {
                      title: "Product Id",
                      dataIndex: "product_id",
                      render: (value) => {
                        if (isLoadingProducts) return <Skeleton.Button />;
                        return products?.data.find(
                          (product) => product.id === value
                        )?.name;
                      },
                    },
                    {
                      title: "Batch Info",
                      dataIndex: "batch_info",
                      render: (value) => (
                        <Table
                          size="small"
                          showHeader={false}
                          bordered
                          pagination={false}
                          dataSource={
                            value as Array<{
                              batch_id: string;
                              quantity: number;
                            }>
                          }
                          columns={[
                            { title: "Batch Id", dataIndex: "batch_id" },
                            { title: "Quantity", dataIndex: "quantity" },
                          ]}
                        />
                      ),
                    },
                  ]}
                />
              </Modal>
            </Space>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Space size="middle">
              <Text size="lg" strong>
                Sales Person Name:
              </Text>
              <Text size="lg">{sales?.data.full_name}</Text>
            </Space>
          </Card.Grid>
        </Card>
      )}
    </Show>
  );
};
