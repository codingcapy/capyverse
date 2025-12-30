import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  getCommunitiesByUserIdQueryOptions,
  getCommunitiesQueryOptions,
  getCommunityByIdQueryOptions,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../../lib/api/communities";
import defaultProfile from "/capypaul01.jpg";
import { PiCaretDownBold } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { SortMode } from "..";
import { useQuery } from "@tanstack/react-query";
import { getPostsByCommunityIdQueryOptions } from "../../lib/api/posts";
import { PostThumbnail } from "../../components/PostThumbnail";
import usePostStore from "../../store/PostStore";
import DOMPurify from "dompurify";
import useAuthStore from "../../store/AuthStore";

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
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery(getPostsByCommunityIdQueryOptions(community.communityId));
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
              <img
                src={defaultProfile}
                alt=""
                className="rounded-full w-[100px] h-[100px]"
              />
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
          // todo: implement get posts by community id sorted by popular and infinite scroll
          <div className="mx-auto flex 2xl:pl-80">
            <div>
              {postsLoading ? (
                <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
                  Loading...
                </div>
              ) : postsError ? (
                <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
                  Error fetching posts
                </div>
              ) : posts ? (
                posts.length > 0 ? (
                  posts
                    .filter(
                      (post) =>
                        searchContent === "" ||
                        post.title
                          .toLowerCase()
                          .includes(searchContent.toLowerCase()) ||
                        post.content
                          .toLowerCase()
                          .includes(searchContent.toLowerCase())
                    )
                    .map((post) => (
                      <PostThumbnail key={post.postId} post={post} />
                    ))
                ) : (
                  <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]"></div>
                )
              ) : (
                <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]"></div>
              )}
            </div>
            <aside className="hidden 2xl:block sticky top-[110px] h-[calc(100vh-150px)] w-[300px] ml-5 custom-scrollbar bg-[#111111] rounded-xl py-2 overflow-y-auto">
              <div className="my-3 px-5 font-bold">{community.communityId}</div>
              <div
                className="px-5 line-clamp-4"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(community.description, {
                    ALLOWED_TAGS: [
                      "b",
                      "i",
                      "u",
                      "s",
                      "strong",
                      "em",
                      "ul",
                      "ol",
                      "li",
                      "p",
                      "a",
                    ],
                    ALLOWED_ATTR: ["href", "target", "rel"],
                    FORBID_ATTR: ["style"],
                  }),
                }}
              ></div>
            </aside>
          </div>
        ) : (
          // todo: implement get posts by community id sorted by recent and infinite scroll
          <div>
            {postsLoading ? (
              <div>Loading...</div>
            ) : postsError ? (
              <div>Error fetching posts</div>
            ) : posts ? (
              posts
                .filter(
                  (post) =>
                    searchContent === "" ||
                    post.title
                      .toLowerCase()
                      .includes(searchContent.toLowerCase()) ||
                    post.content
                      .toLowerCase()
                      .includes(searchContent.toLowerCase())
                )
                .map((post) => <PostThumbnail key={post.postId} post={post} />)
            ) : (
              <div></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
