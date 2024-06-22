import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import {
  AuthPage,
  ErrorComponent,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import authProvider from "./utilities/providers/authProvider";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { supabaseServiceRoleClient } from "./utilities";
import { resources } from "./config";
import { Layout } from "./components/layout";
import DashboardHome from "./routes/dashboard/show";
import { ProductsList, ProductsEdit } from "./routes/products";
import { auditLogProvider } from "./utilities/providers/auditlogProvider";

import { SalesCreate, SalesList } from "./routes/clients/sales";
import { AuditLogList } from "./routes/audit-log";
import { AuthorizeUserRole } from "./components/layout/authorize";

function App() {
  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <AntdApp>
          <DevtoolsProvider>
            <Refine
              auditLogProvider={auditLogProvider}
              dataProvider={dataProvider(supabaseServiceRoleClient)}
              liveProvider={liveProvider(supabaseServiceRoleClient)}
              authProvider={authProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                liveMode: "auto",
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route element={<AuthorizeUserRole />}>
                    <Route
                      index
                      element={<NavigateToResource resource="dashboard" />}
                    />

                    <Route path="/dashboard">
                      <Route index element={<DashboardHome />} />
                    </Route>

                    <Route path="/products">
                      <Route index element={<ProductsList />} />
                      <Route path=":id" element={<ProductsEdit />} />
                    </Route>

                    <Route path="/clients">
                      <Route path="sales">
                        <Route index element={<SalesList />} />
                        <Route path="create" element={<SalesCreate />} />
                      </Route>
                    </Route>

                    <Route path="/administration">
                      <Route path="audit-log">
                        <Route index element={<AuditLogList />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Route>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-outer"
                      fallback={<Outlet />}
                    >
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<AuthPage type="login" />} />
                  <Route
                    path="/register"
                    element={<AuthPage type="register" />}
                  />
                  <Route
                    path="/forgot-password"
                    element={<AuthPage type="forgotPassword" />}
                  />
                </Route>
              </Routes>

              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </AntdApp>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;
