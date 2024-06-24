import React from "react";
import { Create, ThemedTitleV2, useSelect } from "@refinedev/antd";
import { Drawer, Form, Input, Select, Space } from "antd";
import { useCreate, useGetIdentity, useGo } from "@refinedev/core";
import { UserSwitchOutlined } from "@ant-design/icons";
import { CustomersList } from "./list";

export const CustomersCreate = () => {
  const [form] = Form.useForm();
  const go = useGo();
  const { mutate } = useCreate();
  const { data: User } = useGetIdentity<any>();

  const { selectProps: salesSelectProps } = useSelect({
    resource: "profiles",
    optionLabel: "full_name",
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
  });

  const CreateCustomer = async (
    email: string,
    phone: string,
    full_name: string,
    userId: string,
    sales_id: string,
    specialization: string,
    address: string
  ) => {
    // console.log("CreateCustomer", email, phone, full_name, userId, sales_id);
    mutate({
      resource: "customers",
      values: {
        full_name,
        distributor_id: userId,
        sales_id,
        phone,
        email,
        specialization,
        address,
      },
    });
  };
  form.submit = async () => {
    const values = form.getFieldsValue();
    CreateCustomer(
      values.email,
      values.phone,
      values.full_name,
      User?.id,
      values.sales_id,
      values.specialization,
      values.address
    );

    go({
      to: { action: "list", resource: "customers" },
      type: "push",
    });
  };
  return (
    <CustomersList>
      <Drawer
        open
        onClose={() => {
          go({
            to: { action: "list", resource: "customers" },
            type: "push",
          });
        }}
      >
        <Create
          title="Create Customer"
          saveButtonProps={{ onClick: () => form.submit(), htmlType: "submit" }}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Full Name" name={"full_name"}>
              <Input placeholder="Enter Full Name" />
            </Form.Item>
            <Form.Item label="specialization" name={"specialization"}>
              <Input placeholder="Enter specialization" />
            </Form.Item>
            <Form.Item label="address" name={"address"}>
              <Input placeholder="Enter address" />
            </Form.Item>
            <Form.Item
              label="Email"
              name={"email"}
              rules={[
                { required: true, message: "Invalid Email", type: "email" },
              ]}
            >
              <Input placeholder="Email" type="email" />
            </Form.Item>
            <Form.Item
              label="Phone"
              name={"phone"}
              rules={[
                {
                  required: true,
                  message: "Invalid Phone Number",
                  len: 10,
                  transform(value: any) {
                    return value.trim().replace(/\s/g, "");
                  },
                },
              ]}
            >
              <Space.Compact>
                <Input
                  style={{ width: "20%" }}
                  defaultValue="+91"
                  readOnly
                  contentEditable={false}
                />
                <Input style={{ width: "80%" }} placeholder="123456789" />
              </Space.Compact>
            </Form.Item>
            <Form.Item
              name="sales_id"
              label={
                <ThemedTitleV2
                  text="Assign Sales Person"
                  collapsed={false}
                  icon={<UserSwitchOutlined />}
                />
              }
            >
              <Select {...salesSelectProps} />
            </Form.Item>
          </Form>
        </Create>
      </Drawer>
    </CustomersList>
  );
};
