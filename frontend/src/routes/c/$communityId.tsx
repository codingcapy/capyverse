import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  getCommunitiesByUserIdQueryOptions,
  getCommunityByIdQueryOptions,
  getModeratorsQueryOptions,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../../lib/api/communities";
import defaultProfile from "/capypaul01.jpg";
import { PiCaretDownBold } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { SortMode } from "..";
import { useQuery } from "@tanstack/react-query";
import usePostStore from "../../store/PostStore";
import useAuthStore from "../../store/AuthStore";
import { CommunityPostsByNew } from "../../components/CommunityPostsByNew";
import { CommunityPostsByPopular } from "../../components/CommunityPostsByPopular";

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
  const community = Route.useRouteContext();
  const { user } = useAuthStore();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("Popular");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { searchContent } = usePostStore();
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useQuery(getCommunitiesByUserIdQueryOptions((user && user.userId) || ""));
  const { mutate: joinCommunity, isPending: joinCommunityPending } =
    useJoinCommunityMutation();
  const { mutate: leaveCommunity, isPending: leaveCommunityPending } =
    useLeaveCommunityMutation();
  const navigate = useNavigate();
  const [iconHovered, setIconHovered] = useState(false);
  const {
    data: moderators,
    isLoading: moderatorsLoading,
    error: moderatorsError,
  } = useQuery(getModeratorsQueryOptions(community.communityId));

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowSortMenu(false);
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex-1">
      <div className="flex flex-col">
        <div className="mx-auto w-full md:w-[50%] pt-[70px] pb-2">
          <div className="flex pt-10">
            <div className="pt-5">
              {user ? (
                moderatorsLoading ? (
                  <div>Loading...</div>
                ) : moderatorsError ? (
                  <div>Error loading moderators</div>
                ) : moderators ? (
                  moderators.some((m) => m.userId === user.userId) ? (
                    <div
                      className="relative cursor-pointer"
                      onMouseEnter={() => setIconHovered(true)}
                      onMouseLeave={() => setIconHovered(false)}
                    >
                      <img
                        src={community.icon ? community.icon : defaultProfile}
                        alt=""
                        className="rounded-full w-[100px] h-[100px]"
                      />
                      {iconHovered && (
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute top-[35px] left-9 z-1 cursor-pointer"
                        >
                          <path
                            d="M15.1113 9.89062C16.3766 11.9078 18.0945 13.614 20.1357 14.8662L10.5352 24.4688C10.2695 24.7344 10.1358 24.8668 9.97266 24.9541C9.8095 25.0414 9.62514 25.0787 9.25684 25.1523L4.20898 26.1621C4.00121 26.2037 3.89701 26.2242 3.83789 26.165C3.77902 26.1059 3.80027 26.0016 3.8418 25.7939L4.85059 20.7461C4.92427 20.3777 4.96149 20.1935 5.04883 20.0303C5.13616 19.8671 5.26951 19.7344 5.53516 19.4688L15.1113 9.89062ZM21.249 4.27148C21.7668 4.27148 22.1842 4.68815 23.0176 5.52148L24.4814 6.98633C25.3148 7.81966 25.7314 8.23614 25.7314 8.75391C25.7314 9.27166 25.3148 9.68816 24.4814 10.5215L21.0479 13.9541C18.9748 12.7418 17.2473 11.0284 16.0205 8.98145L19.4814 5.52148C20.3145 4.68839 20.7315 4.27172 21.249 4.27148Z"
                            fill="white"
                          />
                        </svg>
                      )}
                      {iconHovered && (
                        <div className="absolute rounded-full inset-0 bg-black opacity-50 z-0 cursor-pointer"></div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={community.icon ? community.icon : defaultProfile}
                      alt=""
                      className="rounded-full w-[100px] h-[100px]"
                    />
                  )
                ) : (
                  <img
                    src={community.icon ? community.icon : defaultProfile}
                    alt=""
                    className="rounded-full w-[100px] h-[100px]"
                  />
                )
              ) : (
                <img
                  src={community.icon ? community.icon : defaultProfile}
                  alt=""
                  className="rounded-full w-[100px] h-[100px]"
                />
              )}
            </div>
            <div className="text-4xl font-bold pt-20 ml-2">
              c/{community.communityId}
            </div>
          </div>
          <div className="flex">
            <div
              ref={menuRef}
              className="relative mx-auto w-full 2xl:w-[750px] flex pt-5"
            >
              <div
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex cursor-pointer pl-4 md:pl-0 md:pt-1 hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                <div className="text-xs">{sortMode}</div>
                <div className="ml-2">
                  <PiCaretDownBold />
                </div>
              </div>
              {showSortMenu && (
                <div
                  onClick={() => {}}
                  className="absolute top-12 left-0 bg-[#444444] px-5 py-2 z-50 shadow-[0_0_15px_rgba(0,0,0,0.7)]"
                >
                  <div
                    onClick={() => {
                      setSortMode("Popular");
                      setShowSortMenu(false);
                    }}
                    className=" py-1 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                  >
                    Popular
                  </div>
                  <div
                    onClick={() => {
                      setSortMode("New");
                      setShowSortMenu(false);
                    }}
                    className="py-1 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                  >
                    New
                  </div>
                </div>
              )}
            </div>
            {user ? (
              communitiesLoading ? (
                <div>Loading...</div>
              ) : communitiesError ? (
                <div>Error loading communities</div>
              ) : communities ? (
                communities.some(
                  (c) => c.communityId === community.communityId
                ) ? (
                  <div
                    onClick={() => {
                      if (leaveCommunityPending) return;
                      leaveCommunity({
                        communityId: (community && community.communityId) || "",
                        userId: (user && user.userId) || "",
                      });
                    }}
                    className="px-5 py-3 rounded-full border cursor-pointer hover:bg-[#333333] transition-all ease-in-out duration-300"
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
                )
              ) : (
                <div className="px-5 py-3 rounded-full bg-cyan-700 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300">
                  Join
                </div>
              )
            ) : (
              <div
                onClick={() => navigate({ to: "/login" })}
                className="px-5 py-3 rounded-full bg-cyan-700 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300"
              >
                Join
              </div>
            )}
          </div>
        </div>
        {sortMode === "Popular" ? (
          <CommunityPostsByNew community={community} />
        ) : (
          <CommunityPostsByPopular community={community} />
        )}
      </div>
    </div>
  );
}
