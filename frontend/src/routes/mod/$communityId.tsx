import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../../store/AuthStore";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getModeratorsQueryOptions } from "../../lib/api/communities";

export const Route = createFileRoute("/mod/$communityId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { communityId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    data: moderators,
    isLoading: moderatorsLoading,
    error: moderatorsError,
  } = useQuery(getModeratorsQueryOptions(communityId));

  useEffect(() => {
    if (moderatorsLoading) return;
    if (moderatorsError) navigate({ to: "/" });
    if (!user) navigate({ to: "/" });
    if (moderators && user && !moderators.some((m) => m.userId === user.userId))
      navigate({ to: "/" });
  }, [user, moderators]);

  return (
    <div className="pt-[70px] mx-auto">
      <div className="md:flex pt-[5px] px-5 lg:px-0 lg:pl-[170px] max-w-[1300px]">
        <div className="text-3xl font-bold">Settings</div>
        <div className="w-[1300px]"></div>
      </div>
    </div>
  );
}
