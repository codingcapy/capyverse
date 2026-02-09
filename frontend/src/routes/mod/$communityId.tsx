import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../../store/AuthStore";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCommunityByIdQueryOptions,
  getModeratorsQueryOptions,
} from "../../lib/api/communities";

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
  const {
    data: community,
    isLoading: communityLoading,
    error: communityError,
  } = useQuery(getCommunityByIdQueryOptions(communityId));

  useEffect(() => {
    if (moderatorsLoading) return;
    if (moderatorsError) navigate({ to: "/" });
    if (!user) navigate({ to: "/" });
    if (
      moderators &&
      user &&
      !moderators.some((m) => m.username === user.username)
    )
      navigate({ to: "/" });
  }, [user, moderators]);

  return (
    <div className="pt-[70px] mx-auto">
      {communityLoading ? (
        <div className="p-5 lg:pl-[170px]">Loading community...</div>
      ) : communityError ? (
        <div className="p-5 lg:pl-[170px]">Error loading community</div>
      ) : community ? (
        <div className="p-5 lg:px-0 lg:pl-[170px]">
          <div className="text-3xl font-bold">Settings</div>
          <div className="my-5">
            <div className="flex justify-between max-w-[700px] w-[70vw] 2xl:max-w-[1000px] my-2">
              <div className="">Display name</div>
              <div>{community.communityId}</div>
            </div>
            <div className="flex justify-between max-w-[700px] 2xl:max-w-[1000px] my-2">
              <div className="mr-10">Description</div>
              <div className="line-clamp-1">{community.description}</div>
            </div>
            <div className="flex justify-between max-w-[700px] 2xl:max-w-[1000px] my-2">
              <div className="">Community Type</div>
              <div className="capitalize">{community.visibility}</div>
            </div>
            <div className="flex justify-between max-w-[700px] 2xl:max-w-[1000px] my-2">
              <div className="">Mature (18+)</div>
              <div>
                {community.mature ? community.mature.toString() : "Off"}
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold">Mods & Members</div>
          <div className="my-5 flex">
            <div className="px-2">Moderators</div>
            <div className="px-2">Members</div>
          </div>
          <div className="flex justify-between font-bold border-y border-[#555555] py-2 mb-5">
            <div>USERNAME</div>
            <div>JOINED</div>
          </div>
          {moderatorsLoading ? (
            <div>Loading moderators...</div>
          ) : moderatorsError ? (
            <div>Error loading moderators</div>
          ) : moderators ? (
            moderators.map((m) => (
              <div className="flex justify-between">
                <div>{m.username}</div>
                <div>{m.createdAt}</div>
              </div>
            ))
          ) : (
            <div></div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
