import React from "react";
import { SalesList } from "./list";
import { Drawer, Form, Input, Select, Space } from "antd";
import { Database, supabaseServiceRoleClient } from "@/utilities";
import {
  useGetIdentity,
  useGo,
  useNavigation,
  useNotification,
  useSelect,
  useUpdate,
} from "@refinedev/core";
import { Create } from "@refinedev/antd";

export const SalesCreate = () => {
  const { open, close } = useNotification();
  const [form] = Form.useForm();
  const { listUrl } = useNavigation();
  const go = useGo();
  const { status, mutate, isSuccess } = useUpdate();
  const { data: User } = useGetIdentity<any>();
  const setUserRole = async (
    userId: string,
    userRole: Database["public"]["Enums"]["ROLES"]
  ) => {
    mutate({
      resource: "profiles",
      id: userId,
      values: {
        role: userRole as Database["public"]["Enums"]["ROLES"],
      },
    });
    // else {
    //   close && close("assign-user");
    //   open &&
    //     open({
    //       key: "assign-user",
    //       type: "error",
    //       message: "Failed to set user role",
    //       description: "Failed to set user role",
    //     });
    //   console.error("Failed to set user role");
    // }
  };

  const createUser = async (
    email: string,
    name: string,
    phNo: string,
    password: string,
    full_name: string,
    role: Database["public"]["Enums"]["ROLES"],
    boss_id: string
  ) => {
    open &&
      open({
        key: "create-user",
        type: "progress",
        message: "Creating User...",
        description: "Please wait while we create your User.",
        undoableTimeout: 2000,
      });
    const { data, error } =
      await supabaseServiceRoleClient.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          username: name,
          phone: phNo,
          full_name: full_name,
          role: role,
          boss_id: boss_id,
        },
      });

    if (data.user) {
      close && close("create-user");
      await setUserRole(data.user.id, role);
      open &&
        open({
          key: "create-user",
          type: "success",
          message: "User Created",
          description: "User Created Successfully",
        });
      go({
        to: listUrl("sales"),
      });
    }
  };
  form.submit = async () => {
    const values = form.getFieldsValue();
    createUser(
      values.email,
      values.name,
      values.phone,
      values.password,
      values.full_name,
      "sales",
      values.boss_id
    );
  };
  const { options } = useSelect<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    filters: [
      {
        field: "id",
        operator: "eq",
        value: User?.id,
      },
    ],
    optionLabel: "username",
    optionValue: "id",
  });
  return (
    <SalesList>
      <Drawer
        onClose={() => {
          go({
            to: listUrl("sales"),
          });
        }}
        open
      >
        <Create
          title="Create Sales"
          saveButtonProps={{ onClick: () => form.submit(), htmlType: "submit" }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="User Name"
              name={"name"}
              rules={[
                { required: true, message: "Name is required", type: "string" },
              ]}
            >
              <Input placeholder="Name" type="text" />
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
            <Form.Item label="Full Name" name={"full_name"}>
              <Input placeholder="Enter Full Name" />
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
                  style={{
                    width: "20%",
                    pointerEvents: "none",
                    userSelect: "none",
                    cursor: "default",
                    textAlign: "center",
                  }}
                  defaultValue="+91"
                  contentEditable={false}
                />
                <Input style={{ width: "80%" }} placeholder="123456789" />
              </Space.Compact>
            </Form.Item>
            <Form.Item label="User Role" name={"role"} required>
              <Select
                disabled
                placeholder="Select a status"
                defaultValue={"sales"}
                options={[{ value: "sales", label: "Sales" }]}
              />
            </Form.Item>
            <Form.Item label="Distributor" name={"boss_id"} required initialValue={User?.id}>
              <Select options={options} placeholder="Select Distributor" disabled defaultValue={User?.id}/>
            </Form.Item>
            <Form.Item
              label="Password"
              name={"password"}
              rules={[
                {
                  required: true,
                  max: 8,
                  min: 4,
                  type: "string",
                  message: "Password is required",
                  validator(rule, value) {
                    if (value.trim().length < 4 || value.trim().length > 8) {
                      rule.message =
                        "Password length should be between 4 and 8 Characters";
                    }
                  },
                  transform(value: any) {
                    return value.trim().replace(/\s/g, "");
                  },
                },
              ]}
            >
              <Input.Password placeholder="Password" type="password" />
            </Form.Item>
          </Form>
        </Create>
      </Drawer>
    </SalesList>
  );
};
