import { Database } from "@/utilities";
import { useGetIdentity, useOne } from "@refinedev/core";
import { Outlet } from "react-router-dom";
import { Unauthorized } from "../unauthorized/unauthorized";
import { FullScreenLoading } from "../fullscreen-loading";

export const AuthorizeUserRole = () => {
  
  const {
    data: User,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetIdentity<any>();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useOne<Database["public"]["Tables"]["profiles"]["Row"]>({
    resource: "profiles",
    id: User?.id,
    queryOptions: {
      enabled: !!User?.id,
    },
  });

if (isUserLoading || isProfileLoading || isUserError || isProfileError)   
    return <FullScreenLoading />;

  return profile?.data.role === "distributor" && new Date(User.banned_until) < new Date() ? <Outlet /> : <Unauthorized />;
};
