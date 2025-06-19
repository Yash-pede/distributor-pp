import {
  Button,
  Col,
  Drawer,
  Empty,
  Flex,
  Statistic,
  notification,
} from "antd";
import { ShoppingCartItem } from "./ShoppingCartItem";
import { useList, useCreate } from "@refinedev/core";
import { IconShoppingBagCheck } from "@tabler/icons-react";
import { useShoppingCart } from "@/contexts/color-mode/cart/ShoppingCartContext";
import { Database } from "@/utilities";
import authProvider from "@/utilities/providers/authProvider";

export const ShoppingCart = ({ isOpen }: { isOpen: boolean }) => {
  const { cartItems, closeCart, clearCart } = useShoppingCart();
  const { data } = useList<Database["public"]["Tables"]["products"]["Row"]>({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: cartItems.map((item) => item.id),
      },
    ],
    queryOptions: {
      enabled: cartItems.length > 0,
    },
  });
  const { mutate, error } = useCreate();
  const HandleCheckout = async () => {
    console.log(cartItems);
    try {
      if (!authProvider.getIdentity) {
        return;
      }
      const hasInvalidQuantity = cartItems.some(
        (item) =>
          item.quantity === null ||
          item.quantity === undefined ||
          typeof item.quantity !== "number" ||
          item.quantity <= 0
      );

      if (hasInvalidQuantity) {
        throw new Error("Invalid quantity detected. Please check your cart.");
      }
      const user = await authProvider.getIdentity();
      const userId = user as any;

      mutate({
        resource: "orders",
        values: {
          order: cartItems.map((item, index) => {
            return {
              key: index + 1,
              quantity: item.quantity,
              product_id: item.id,
            };
          }),
          status: "Pending",
          distributor_id: userId.id,
        },
      });

      if (!error) {
        clearCart();
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      notification.error({
        message: "Error",
        description: "Failed to checkout. Please try again.",
      });
    }
  };

  return (
    <Drawer title="Your Cart" open={isOpen} onClose={closeCart} size="large">
      <Button
        type="primary"
        size="large"
        disabled={cartItems.length === 0}
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "10px 0",
          gap: "10px",
        }}
        onClick={HandleCheckout}
      >
        <IconShoppingBagCheck /> Checkout
      </Button>
      {cartItems.length > 0 ? (
        <>
          loda
          <Col span={24}>
            {cartItems.map((item) => (
              <ShoppingCartItem key={item.id} products={data?.data} {...item} />
            ))}
          </Col>
          <Flex justify="end">
            <Statistic
              title="Total"
              precision={2}
              style={{ marginRight: "16px", fontWeight: "bold" }}
              value={
                "₹" +
                cartItems.reduce((total, item) => {
                  const product = data?.data?.find(
                    (p: any) => p.id === item.id
                  );
                  return total + (product?.selling_price || 0) * item.quantity;
                }, 0)
              }
            />
          </Flex>
        </>
      ) : (
        <Empty description="Your cart is empty" />
      )}
    </Drawer>
  );
};
