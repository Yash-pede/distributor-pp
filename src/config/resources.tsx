import type { IResourceItem } from "@refinedev/core";

import { CrownOutlined, ProjectOutlined } from "@ant-design/icons";
import {
  IconCurrencyRupeeNepalese,
  IconDashboard,
  IconMoneybag,
  IconPackage,
  IconPackageExport,
  IconPackageImport,
  IconTargetArrow,
  IconUser,
} from "@tabler/icons-react";

export const resources: IResourceItem[] = [
  {
    name: "dashboard",
    list: "/dashboard",
    meta: {
      label: "Dashboard",
      icon: <IconDashboard />,
    },
  },
  {
    name: "products",
    list: "/products",
    meta: {
      label: "Products",
      icon: <IconPackage />,
    },
  },

  {
    name: "orders",
    list: "/orders",
    meta: {
      label: "Orders",
      icon: <IconPackageExport />,
    },
    show: "/orders/:id",
    edit: "/orders/edit/:id",
    create: "/orders/create",
  },

  {
    name: "funds",
    list: "/funds",
    meta: {
      label: "Funds",
      icon: <IconMoneybag />,
    },
    show: "/funds/:id",
    create: "/funds/create",
  },
  {
    name: "challan",
    list: "/challan",
    meta: {
      label: "Challan",
      icon: <IconCurrencyRupeeNepalese />,
    },
    show: "/challan/:id",
    create: "/challan/create",
  },
  {
    name: "customers",
    list: "/clients/customers",
    create: "/clients/customers/create",
    edit: "/clients/customers/edit/:id",
    meta: {
      label: "Customers",
      parent: "clients",
      icon: <IconUser />,
    },
  },
  {
    name: "sales",
    list: "/clients/sales",
    create: "/clients/sales/create",
    edit: "/clients/sales/edit/:id",
    meta: {
      label: "Sales",
      parent: "clients",
      icon: <IconTargetArrow />,
    },
  },
  {
    name: "administration",
    meta: {
      label: "Administration",
      icon: <CrownOutlined />,
    },
  },
  {
    name: "settings",
    list: "/administration/settings",
    meta: {
      label: "Settings",
      parent: "administration",
    },
  },
  {
    name: "audit-log",
    list: "/administration/audit-log",
    meta: {
      label: "Audit Log",
      parent: "administration",
    },
  },
];
