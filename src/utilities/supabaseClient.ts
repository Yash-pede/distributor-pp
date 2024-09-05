import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://dznfhiyfjniapdbzdjpt.supabase.co";
export const SUPABASE_PROJECT_ID = "dznfhiyfjniapdbzdjpt";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmZoaXlmam5pYXBkYnpkanB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2OTQxOTIsImV4cCI6MjAzNDI3MDE5Mn0.z-MMOhn4eM1Len0kN3Uva20Cerhi6dJzQ9BZjg3gzUA";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmZoaXlmam5pYXBkYnpkanB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY5NDE5MiwiZXhwIjoyMDM0MjcwMTkyfQ.H1LQieqWyYbOj_KjqQVkJLdDNk1e6YH5iqspe-X8REY";

export const supabaseServiceRoleClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: true,
    },
  },
);
export const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: true,
    },
  },
);
