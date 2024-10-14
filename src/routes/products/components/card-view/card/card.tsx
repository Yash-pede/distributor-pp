import type { FC } from "react";

import { useDelete, useGo } from "@refinedev/core";

import { DeleteOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Flex, Image, InputNumber } from "antd";
import { Database } from "@/utilities";
import { ProductCardSkeleton } from "./skeleton";
import { Text } from "@/components";
import { supabaseBucket_Product_images } from "@/utilities/constants";
import { useShoppingCart } from "@/contexts/color-mode/cart/ShoppingCartContext";
import { IconShoppingCart } from "@tabler/icons-react";

type Props = {
  product: Database["public"]["Tables"]["products"]["Row"];
};

export const ProductCard: FC<Props> = ({ product }) => {
  const go = useGo();
  const { mutate } = useDelete();

  const {
    getItemsQuantity,
    decreaseCartQuantity,
    increaseCartQuantity,
    removeFromCart,
  } = useShoppingCart();

  if (!product) return <ProductCardSkeleton />;

  return (
    <Card size="small">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Dropdown
          menu={{
            items: [
              {
                label: "Edit Product",
                key: "1",
                icon: <EyeOutlined />,
                onClick: () => {
                  go({
                    to: {
                      resource: "products",
                      action: "edit",
                      id: product.id,
                    },
                  });
                },
              },
            ],
          }}
          placement="bottom"
          arrow
        >
          <Button
            type="text"
            shape="circle"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            icon={
              <MoreOutlined
                style={{
                  transform: "rotate(90deg)",
                }}
              />
            }
          />
        </Dropdown>

        <Flex vertical gap="middle">
          <Text size="xl" strong>
            {product.name}
          </Text>
          <Image
            width={"100%"}
            height={"230px"}
            src={supabaseBucket_Product_images + product.imageURL}
            loading="lazy"
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text> ₹ {product.selling_price}</Text>
            <Text> MRP: {product.mrp}</Text>
          </div>
        </Flex>
        {getItemsQuantity(product.id) === 0 ? (
          <Button
            type="primary"
            size="large"
            style={{
              gap: "15px",
              marginTop: "15px",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              increaseCartQuantity(product.id, product.minimum_q || 1);
            }}
          >
            <IconShoppingCart /> Add to Cart
          </Button>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.8rem",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.8rem",
                width: "100%",
              }}
            >
              <InputNumber
                size="large"
                addonBefore={
                  <Button
                    type="text"
                    disabled={getItemsQuantity(product.id) <= product.minimum_q}
                    onClick={() => decreaseCartQuantity(product.id, 1)}
                  >
                    -
                  </Button>
                }
                value={getItemsQuantity(product.id)}
                defaultValue={getItemsQuantity(product.id)}
                addonAfter={
                  <Button
                    type="text"
                    onClick={() =>
                      increaseCartQuantity(product.id, product.minimum_q || 1)
                    }
                  >
                    +
                  </Button>
                }
              />
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                type="primary"
                danger
                style={{ width: "100%" }}
                onClick={() => removeFromCart(product.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
