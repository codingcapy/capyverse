import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import defaultProfile from "/capypaul01.jpg";
import useAuthStore from "../../store/AuthStore";
import {
  getCommunitiesByUserIdQueryOptions,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../../lib/api/communities";

export const Route = createFileRoute("/u/communities")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useQuery(getCommunitiesByUserIdQueryOptions((user && user.userId) || ""));
  const { mutate: joinCommunity, isPending: joinCommunityPending } =
    useJoinCommunityMutation();
  const { mutate: leaveCommunity, isPending: leaveCommunityPending } =
    useLeaveCommunityMutation();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user]);

  return (
    <div className="pt-[88px] px-2 md:px-0 mx-auto w-full md:w-[50%] 2xl:w-[40%]">
      <div className="text-xl md:text-3xl font-bold">Manage Communities</div>
      {communitiesLoading ? (
        <div></div>
      ) : communitiesError ? (
        <div></div>
      ) : communities ? (
        communities.length > 0 ? (
          communities.map((community) => (
            <div className="flex justify-between my-5">
              <Link
                to="/c/$communityId"
                params={{
                  communityId: community.communityId,
                }}
                key={community.communityId}
              >
                <div className="flex hover:text-cyan-500 transition-all ease-in-out duration-300">
                  <img
                    src={defaultProfile}
                    alt=""
                    className="rounded-full w-[30px] h-[30px]"
                  />
                  <div className="ml-1 pt-1">c/{community.communityId}</div>
                </div>
              </Link>
              {communities.some(
                (c) => c.communityId === community.communityId,
              ) ? (
                <div
                  onClick={() => {
                    if (leaveCommunityPending) return;
                    leaveCommunity({
                      communityId: (community && community.communityId) || "",
                      userId: (user && user.userId) || "",
                    });
                  }}
                  className="px-3 py-1 rounded-full border cursor-pointer hover:bg-[#333333] transition-all ease-in-out duration-300"
                >
                  {leaveCommunityPending ? "Leaving..." : "Joined"}
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (joinCommunityPending) return;
                    joinCommunity({
                      communityId: (community && community.communityId) || "",
                      userId: (user && user.userId) || "",
                    });
                  }}
                  className="px-5 py-3 rounded-full bg-cyan-700 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300"
                >
                  {joinCommunityPending ? "Joining..." : "Join"}
                </div>
              )}
            </div>
          ))
        ) : (
          <div>
            <div className="text-lg md:text-xl font-bold text-center mt-10">
              No communities yet!
            </div>
            <div className="text-center my-2">
              Join a community to see popular posts about topics that interest
              you.
            </div>
          </div>
        )
      ) : (
        <div></div>
      )}
    </div>
  );
}
