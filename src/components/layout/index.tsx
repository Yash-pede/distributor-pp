import React from "react";

import { ThemedLayoutContextProvider } from "@refinedev/antd";

import { Grid, Layout as AntdLayout } from "antd";

import { Header } from "./header";
import { Sider } from "./sider";

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const breakpoint = Grid.useBreakpoint();
  const isSmall = typeof breakpoint.sm === "undefined" ? true : breakpoint.sm;

  return (
    <ThemedLayoutContextProvider>
      <AntdLayout hasSider style={{ minHeight: "100vh", paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <Sider />
        <AntdLayout>
          <Header />
          <AntdLayout.Content
            style={{
              padding: isSmall ? 32 : 16,
            }}
          >
            {children}
          </AntdLayout.Content>
        </AntdLayout>
      </AntdLayout>
    </ThemedLayoutContextProvider>
  );
};
