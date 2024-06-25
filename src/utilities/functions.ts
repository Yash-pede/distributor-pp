import { TagProps } from "antd";
import { supabaseClient } from "./supabaseClient";
import { validate } from "uuid";

export const transactionStatusColor = (status: string) => {
  switch (status) {
    case "Credit":
      return "green";
    case "Debit":
      return "red";
    case "Requested":
      return "#002244";
    case "Approved":
      return "green";
    default:
      return "grey";
  }
};

export const getActionColor = (action: string): TagProps["color"] => {
  switch (action) {
    case "create":
      return "green";
    case "update":
      return "cyan";
    case "delete":
      return "red";
    default:
      return "default";
  }
};

export const banUser = async (userId: string, banDuration: string) => {
  const result = await supabaseClient.auth.admin.updateUserById(
    userId,
    { ban_duration: banDuration }
  );
  return result;
};

export function isValidUUID(uuid: string) {
  return validate(uuid);
}
