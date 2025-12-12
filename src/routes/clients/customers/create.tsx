import React from "react";
import { Create, ThemedTitleV2, useSelect } from "@refinedev/antd";
import { Button, Drawer, Form, Input, Select, Space } from "antd";
import { useCreate, useGetIdentity, useGo } from "@refinedev/core";
import { PlusOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { CustomersList } from "./list";

export const CustomersCreate = () => {
  const [form] = Form.useForm();
  const go = useGo();
  const { mutate } = useCreate();
  const { data: User } = useGetIdentity<any>();
  const [metadata, setMetadata] = React.useState<{
    dl_no: string[];
    gst_no: string;
  }>({ dl_no: [], gst_no: "" });

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
    address: string,
    metadata: { dl_no: string[]; gst_no: string }
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
        metadata,
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
      values.address,
      metadata
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
                { required: false, message: "Invalid Email", type: "email" },
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
            <Form.Item label="GST Number">
              <Input
                placeholder="Enter GST Number"
                value={metadata.gst_no}
                onChange={(e) => {
                  setMetadata({ ...metadata, gst_no: e.target.value });
                  form.setFieldValue("gst_no", e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item label="DL Number">
              {metadata.dl_no.map((dl, index) => (
                <Input
                  key={index}
                  placeholder="Enter DL Number"
                  value={dl}
                  onChange={(e) => {
                    const updated = [...metadata.dl_no];
                    updated[index] = e.target.value;
                    setMetadata({ ...metadata, dl_no: updated });
                    form.setFieldValue("dl_no", updated);
                  }}
                  style={{ marginTop: index === 0 ? 0 : "1rem" }}
                />
              ))}

              <Button
                size="large"
                style={{ width: "100%", marginTop: "1rem" }}
                type="dashed"
                onClick={() => {
                  const updated = [...metadata.dl_no, ""];
                  setMetadata({ ...metadata, dl_no: updated });
                  form.setFieldValue("dl_no", updated);
                }}
              >
                <PlusOutlined /> Add another
              </Button>
            </Form.Item>
          </Form>
        </Create>
      </Drawer>
    </CustomersList>
  );
};
