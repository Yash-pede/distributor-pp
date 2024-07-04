import React from "react";
import { CreateButton, List } from "@refinedev/antd";
import { useGetIdentity, useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { TransactionList } from "./components/transaction-list";
import { Button } from "antd";

export const FundsList = ({ children }: { children?: React.ReactNode }) => {
  const { data: user } = useGetIdentity<any>();
  const { data: funds, isLoading: isFundsLoading } = useOne<
    Database["public"]["Tables"]["funds"]["Row"]
  >({
    resource: "funds",
    id: user.id,
    queryOptions: {
      enabled: !!user.id,
    },
  });
  return (
    <List
      headerProps={{
        title: `Total : ${funds?.data?.total ? funds?.data?.total : "-"}`,
      }}
      headerButtons={[
        <CreateButton>Transfer Funds</CreateButton>,
      ]}
    >
      <TransactionList userId={user.id} />
      {children}
    </List>
  );
};
