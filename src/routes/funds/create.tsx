import React from "react";
import { FundsList } from "./list";
import { Drawer, Form, Input, InputNumber } from "antd";
import { useGetIdentity, useGo } from "@refinedev/core";
import { SaveButton, useDrawerForm } from "@refinedev/antd";
import { Database } from "@/utilities";

export const FundsCreate = () => {
  const go = useGo();
  const { data: user } = useGetIdentity<any>();
  const { drawerProps, saveButtonProps, formProps } = useDrawerForm<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
    action: "create",
    resource: "transfers",
    redirect: "list",
    defaultVisible: true,
    onMutationSuccess: () => go({ to: { resource: "funds", action: "list" } }),
  });
  return (
    <FundsList>
      <Drawer
        {...drawerProps}
        open
        title="Transfer to Admin"
        onClose={() => go({ to: { resource: "funds", action: "list" } })}
      >
        <Form {...formProps}>
          <Form.Item hidden name="to_user_id" initialValue={import.meta.env.VITE_ADMIN_ID} />
          <Form.Item hidden name="from_user_id" initialValue={user?.id} />
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <SaveButton {...saveButtonProps} />
        </Form>
      </Drawer>
    </FundsList>
  );
};
