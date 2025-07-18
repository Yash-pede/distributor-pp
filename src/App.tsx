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
import { supabaseClient } from "./utilities";
import { resources } from "./config";
import { Layout } from "./components/layout";
import { ProductsList, ProductsEdit } from "./routes/products";
import { auditLogProvider } from "./utilities/providers/auditlogProvider";

import { SalesCreate, SalesEdit, SalesList, SalesShow } from "./routes/clients/sales";
import { AuditLogList } from "./routes/audit-log";
import { AuthorizeUserRole } from "./components/layout/authorize";
import { ShoppingCartProvider } from "./contexts/color-mode/cart/ShoppingCartContext";
import { OrdersList, OrdersShow } from "./routes/orders";
import { InventoryDetails, InventoryList } from "./routes/inventory";
import { ChallanCreate, ChallanList, ChallanShow, ReqDeletionChallan } from "./routes/challan";
import { CustomersCreate, CustomersList, CustomersShow } from "./routes/clients/customers";
import { ChallanPdf } from "./routes/challan/components/challanPdf";
import { FundsCreate, FundsList } from "./routes/funds";
import { TargetCreate } from "./components/targets/create";
import DashboardHome from "./routes/dashboard/show";
import { MoneyList, ReportProducts, ReportsList, Targets, UserSelect } from "./routes/reports";

function App() {
  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <AntdApp>
          <DevtoolsProvider>
            <Refine
              auditLogProvider={auditLogProvider}
              dataProvider={dataProvider(supabaseClient)}
              liveProvider={liveProvider(supabaseClient)}
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
             <DocumentTitleHandler
                handler={(title) =>
                  `${
                    title.resource?.name ? title.resource?.name + "| " : ""
                  } Distributor Purepride`
                }
              />
              <ShoppingCartProvider>
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
                        <Route index element={<ProductsList />    } />
                        <Route path=":id" element={<ProductsEdit />} />
                      </Route>
                      <Route path="/orders">
                        <Route index element={<OrdersList />} />
                        <Route path=":id" element={<OrdersShow />} />
                      </Route>
                      <Route path="funds">
                      <Route index element={<FundsList />} />
                      <Route path="create" element={<FundsCreate />} />
                    </Route>
                      <Route path="/inventory">
                        <Route index element={<InventoryList />} /> 
                        <Route path="details" element={<InventoryDetails />} />
                      </Route>
                      <Route path="/challan">
                        <Route index element={<ChallanList />} />
                        <Route path="create" element={<ChallanCreate />} />
                        <Route path="req-deletion" element={<ReqDeletionChallan />} />
                        <Route path=":id" element={<ChallanShow />} />
                        <Route path="pdf/:id" element={<ChallanPdf />} />
                      </Route>

                      <Route path="/clients">
                        <Route path="sales">
                          <Route index element={<SalesList />} />
                          <Route path="create" element={<SalesCreate />} />
                          <Route path="edit/:id" element={<SalesEdit />} />
                          <Route path=":id" element={<SalesShow />} />
                        </Route>
                        <Route path="customers">
                          <Route index element={<CustomersList />} />
                          <Route path="create" element={<CustomersCreate />} />
                          <Route path=":id" element={<CustomersShow />} />
                        </Route>
                      </Route>

                      <Route path="/administration">
                      <Route path="settings">
                        <Route index element={<>Settings</>} />
                        <Route
                          path="user-credentials/:id"
                          element={
                            <>
                              Editing the users details is temporaryly disabled
                            </>
                          }
                        />
                      </Route>
                      <Route path="targets">
                          <Route path="create/:id" element={<TargetCreate />} />
                        </Route>
                        <Route path="audit-log">
                          <Route index element={<AuditLogList />} />
                        </Route>
                        <Route path="reports">
                        <Route index element={<ReportsList />} />
                        <Route path="targets">
                          <Route index element={<UserSelect />} />
                          <Route path=":id" element={<Targets />} />
                          <Route path="create/:id" element={<TargetCreate />} />
                        </Route>
                        <Route path="money">
                          <Route index element={<MoneyList />} />
                        </Route>
                        <Route path="products">
                          <Route index element={<ReportProducts />} />
                        </Route>
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
              </ShoppingCartProvider>

              <UnsavedChangesNotifier />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </AntdApp>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;
