import { Text } from "@/components";
import { Database } from "@/utilities";
import { useGo } from "@refinedev/core";
import { Button, Flex, Grid, Skeleton, Space } from "antd";
import React from "react";

export const SalesTitleForm = ({
  salesDetails,
}: {
  salesDetails: Database["public"]["Tables"]["profiles"]["Row"];
}) => {
  const go = useGo();
  const breakpoint = Grid.useBreakpoint();

  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  return (
    <Flex style={{ flexDirection: isMobile ? "column" : "row" }} gap={20} align={isMobile ? "start" : "center"} justify={isMobile ? "start" : "space-between"}>
      <Space direction="vertical" size={0}>
        <Text size="xl">{salesDetails?.username}</Text>
        <Text size="sm">{salesDetails?.email}</Text>
      </Space>
      <Flex >
        <Button
          type="primary"
          onClick={() =>
            go({
              to: {
                action: "edit",
                id: salesDetails?.id,
                resource: "sales",
              },
            })
          }
        >
          Edit Details
        </Button>
        <Button onClick={() => go({ to: `/administration/settings/user-credentials/${salesDetails ?.id}` })}> Edit Credentials</Button>
      </Flex>
    </Flex>
  );
};
  