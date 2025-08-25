import { reportTypes } from "@/utilities/constants";
import { Show } from "@refinedev/antd";
import { Card, Flex, Grid, Space } from "antd";
import React from "react";
import { Link } from "react-router-dom";

export const ReportsList = () => {
  const breakpoint = Grid.useBreakpoint();

  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  return (
    <Show>
      <Flex style={{
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
        }} gap={20}>
        {reportTypes.map((reportType, i) => (
          <Link key={i} to={reportType.link}>
            <Card
              hoverable
              style={{
                width: "200px",
                height: "200px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {reportType.icon}
              <h2 style={{ textTransform: "uppercase" }}>{reportType.title}</h2>
            </Card>
          </Link>
        ))}
      </Flex>
    </Show>
  );
};
