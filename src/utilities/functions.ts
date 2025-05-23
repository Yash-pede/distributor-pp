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

export const getTransferColor = (action: string): TagProps["color"] => {
  switch (action) {
    case "Requested":
      return "orange";
    case "Credit":
      return "green";
    case "Debit":
      return "red";
    case "Approved":
      return "pink";
    default:
      return "default";
  }
};

export function isValidUUID(uuid: string) {
  return validate(uuid);
}


export enum OrderStatus {
  Pending = "Pending",
  Fulfilled = "Fulfilled",
  Cancelled = "Cancelled",
  InProcess = "InProcess",
  Defected = "Defected",
}
