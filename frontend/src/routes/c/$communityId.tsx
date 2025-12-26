import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCommunityByIdQueryOptions } from "../../lib/api/communities";

export const Route = createFileRoute("/c/$communityId")({
  beforeLoad: async ({ context, params }) => {
    const { communityId } = params;
    try {
      const communityQuery = await context.queryClient.fetchQuery({
        ...getCommunityByIdQueryOptions(communityId),
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes("404")) {
            return false;
          }
          if (error instanceof Error && error.message.includes("403")) {
            return false;
          }
          return failureCount < 1;
        },
      });
      return communityQuery;
    } catch (e) {
      console.error(e, "redirect to dash on error");
      throw redirect({ to: "/" });
    }
  },
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <div className="flex-1">
      <div className="flex flex-col">
        <div className="mx-auto w-full md:w-[50%] pt-[70px] pb-5 ">
          Hello "/communities/$communityId"!
        </div>
      </div>
    </div>
  );
}
