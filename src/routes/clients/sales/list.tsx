import { type FC, type PropsWithChildren } from "react";

import { List, useTable } from "@refinedev/antd";
import { useGetIdentity, type HttpError } from "@refinedev/core";

import {
  SearchOutlined,
} from "@ant-design/icons";
import { Form, Grid, Input, Space, Spin } from "antd";
import debounce from "lodash/debounce";

import { ListTitleButton } from "@/components";
import { Database } from "@/utilities";
import { SalesTableView } from "./components/table-view/table-view";


export const SalesList: FC<PropsWithChildren> = ({ children }) => {
  const screens = Grid.useBreakpoint();
  const {data:user} = useGetIdentity<any>();

  const {
    tableProps,
    tableQueryResult,
    searchFormProps,
    filters,
    sorters,
  } = useTable<
    Database["public"]["Tables"]["profiles"]["Row"],
    HttpError,
    { name: string }
  >({
    resource: "profiles",
    filters: {
      mode:"server",
      permanent:[
        {
          field: "role",
          operator: "eq",
          value: "sales",
        },{
          field: "boss_id",
          operator: "eq",
          value: user?.id
        }
      ]
    },
    onSearch: (values) => {
      return [
        {
          field: "username",
          operator: "contains",
          value: values.name,
        },
        {
          field: "full_name",
          operator: "contains",
          value: values.name,
        }
      ];
    },
    pagination: {
      pageSize: 12,
    },
    queryOptions:{
      enabled:!!user.id,
    }
  });

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchFormProps?.onFinish?.({
      name: e.target.value ?? "",
    });
  };
  const debouncedOnChange = debounce(onSearch, 500);

  return (
    <div className="page-container">
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
                      <Spin
                        size="small"
                        spinning={tableQueryResult.isFetching}
                      />
                    }
                    placeholder="Search by user name"
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
        title={
          <ListTitleButton toPath="sales" buttonText="Add new Sales" />
        }
      >
        <SalesTableView
            tableProps={tableProps}
            filters={filters}
            sorters={sorters}
            tableQueryResult={tableQueryResult.data}
          />
      </List>
      {children}
    </div>
  );
};
