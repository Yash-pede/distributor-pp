import { Database } from "@/utilities";
import { useList, useNavigation } from "@refinedev/core";
import { Button, Card, Skeleton } from "antd";
import dayjs from "dayjs";
import React, { Suspense } from "react";
import IconWrapper from "./icon-wrapper";
import { IconCurrencyRupee } from "@tabler/icons-react";
import { Text } from "@/components";
import { RightCircleOutlined } from "@ant-design/icons";
import PieChartTiny from "@/components/charts/pie-chart";

const ProductsChart = () => {
  const { list } = useNavigation();
  const [productsData, setProductsData] = React.useState<any>([]);
  const { data: products, isLoading } = useList<
    Database["public"]["Tables"]["challan_batch_info"]["Row"]
  >({
    resource: "challan_batch_info",
    filters: [
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().startOf("year").toISOString(),
      },
    ],
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
    },
    meta: {
      select: "product_id",
    },
  });
  const { data: productsName, isLoading: isLoadingName } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: products?.data.map((item) => item.product_id),
      },
    ],
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
      enabled: !!products?.data,
    },
    meta: {
      select: "id , name",
    },
  });
  React.useEffect(() => {
    if (products && products.data) {
      const frequencyMap = products.data.reduce((acc: any, product) => {
        const productId = product.product_id.toString();
        acc[productId] = (acc[productId] || 0) + 1;
        return acc;
      }, {});

      const result = Object.entries(frequencyMap).map(([name, value]) => ({
        name:
          productsName?.data.find((d) => d.id.toString() === name)?.name ??
          name,
        value: value,
      }));

      setProductsData(result);
    }
  }, [products, productsName?.data]);

  return (
    <Skeleton active >
      Products Graph data in progress
    </Skeleton>
  );
};

export default ProductsChart;
