import { Database } from "@/utilities";
import { List, useSelect, useTable } from "@refinedev/antd";
import { useGetIdentity, useList } from "@refinedev/core";
import { Form, Grid, Select, Space, Table } from "antd";
import dayjs from "dayjs";
import { debounce } from "lodash";
import React, { useState } from "react";

interface ProductInfo {
  discount: number;
  quantity: number;
  product_id: number;
}

interface Challan {
  id: number;
  product_info: ProductInfo[];
  created_at: string;
}

export const ReportProducts: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const { data: User } = useGetIdentity<any>();

  const [year, setYear] = useState(dayjs().year());
  const [salesId, setSalesId] = useState<string | null>(null);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const { tableProps } = useTable<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    meta: {
      select: "id, name, minimum_q",
    },
    sorters: {
      initial: [
        {
          field: "id",
          order: "asc",
        },
      ],
    },
    pagination: {
      pageSize: 1000,
      mode: "off",
    },
  });

  const {
    data: challanProducts,
    isLoading: isLoadingChallanProducts,
    refetch: refetchChallanProducts,
    isRefetching: isRefetchingChallanProducts,
  } = useList<Challan>({
    resource: "challan",
    pagination: {
      current: 1,
      pageSize: 1000,
    },
    filters: salesId
      ? [
          {
            field: "created_at",
            operator: "gte",
            value: `${year}-01-01 00:00:00`,
          },
          {
            field: "created_at",
            operator: "lt",
            value: `${year + 1}-01-01 00:00:00`,
          },
          {
            field: "distributor_id",
            operator: "eq",
            value: User?.id,
          },
          {
            field: "sales_id",
            operator: "in",
            value: salesId,
          },
          
        ]
      : [
          {
            field: "created_at",
            operator: "gte",
            value: `${year}-01-01 00:00:00`,
          },
          {
            field: "created_at",
            operator: "lt",
            value: `${year + 1}-01-01 00:00:00`,
          },
          {
            field: "distributor_id",
            operator: "eq",
            value: User?.id,
          },
          {
            field: "sales_id",
            operator: "nnull",
            value: null,
          },
        ],
    meta: {
      select: "id, product_info, created_at",
    },
  });

  const { selectProps: salesSelectProps } = useSelect({
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
        value: User?.id,
      },
    ],
    debounce: 500,
  });

  const setYearFn = (newYear: number) => {
    setYear(newYear);
    refetchChallanProducts();
  };

  const debouncedOnChange = debounce(setYearFn, 500);

  const yearOptions = Array.from({ length: 5 }, (_, index) => 2023 + index).map(
    (year) => ({
      value: year,
      label: year,
    })
  );
  const handlesalesChange = (value: any) => {
    if (value.length === 0) {
      setSalesId(null);
    } else {
      setSalesId(value);
      refetchChallanProducts();
    }
  };

  return (
    <List
      headerButtons={() => {
        return (
          <Space
            style={{
              marginTop: screens.xs ? "1.6rem" : undefined,
            }}
          >
            <Form layout="inline">
              <Form.Item name="sales" noStyle>
                <Select
                  {...salesSelectProps}
                  style={{ minWidth: 200 }}
                  mode="multiple"
                  placeholder="Filter sales"
                  onChange={handlesalesChange}
                />
              </Form.Item>
            </Form>
            <Form layout="inline">
              <Form.Item
                name="year"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please select a year!",
                  },
                ]}
              >
                <Select
                  defaultValue={year}
                  style={{ width: 120 }}
                  onChange={debouncedOnChange}
                  options={yearOptions}
                  loading={
                    isLoadingChallanProducts || isRefetchingChallanProducts
                  }
                />
              </Form.Item>
            </Form>
          </Space>
        );
      }}
    >
      <Table {...tableProps}>
        <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
          dataIndex="id"
          title="ID"
          render={(value) => <div>{value}</div>}
        />
        <Table.Column
          dataIndex="name"
          title="Name"
          render={(value) => <div>{value}</div>}
        />
        {months.map((month, index) => (
          <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
            key={index}
            title={month}
            render={(_, record) => {
              let totalQuantity = 0;
              challanProducts?.data.forEach((challan) => {
                if (dayjs(challan.created_at).month() === index) {
                  const productInfo = challan.product_info || [];
                  productInfo.forEach((item) => {
                    if (item.product_id === record.id) {
                      totalQuantity += item.quantity;
                    }
                  });
                }
              });

              return <div>{totalQuantity}</div>;
            }}
          />
        ))}
      </Table>
    </List>
  );
};
