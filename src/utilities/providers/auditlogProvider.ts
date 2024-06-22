import { AuditLogProvider } from "@refinedev/core";
import { supabaseClient } from "../supabaseClient";

export const auditLogProvider: AuditLogProvider = {
  create: async (params) => {
    const { resource, meta, action, author, data, previousData } = params;

    const { data: logs, error } = await supabaseClient
      .from("logs")
      .insert([
        {
          action: action,
          resource: resource,
          data: data,
          meta: meta,
          author: author?.id,
          previousData: previousData,
        },
      ])
      .select();

    return { success: true, data: logs, error };
  },
  update: async (params) => {
    const { resource, meta, action, author, data, previousData } = params;

    const { data: logs, error } = await supabaseClient
      .from("logs")
      .insert([
        {
          action: action,
          resource: resource,
          data: data,
          meta: meta,
          author: author?.id,
          previousData: previousData,
        },
      ])
      .select();

    return { success: true, data: logs, error };
  },

  get: async () => {
    const { data, error } = await supabaseClient
      .from("logs")
      .select("*");
    return data;
  },
};
