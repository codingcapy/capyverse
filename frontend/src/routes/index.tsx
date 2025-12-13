import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getPostsQueryOptions } from "../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import { PostThumbnail } from "../components/PostThumbnail";
import { PiCaretDownBold } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { getVotesQueryOptions } from "../lib/api/votes";
import usePostStore from "../store/PostStore";

type SortMode = "Popular" | "New";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery(getPostsQueryOptions());
  const {
    data: votes,
    isLoading: votesLoading,
    isError: votesError,
  } = useQuery(getVotesQueryOptions());
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("Popular");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { searchContent } = usePostStore();

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
        <div className="mx-auto w-full md:w-[50%] pt-[70px] pb-5 ">
          <div
            ref={menuRef}
            className="relative mx-auto w-full 2xl:w-[750px] flex"
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
                className="absolute top-6 left-0 bg-[#444444] px-5 py-2 z-50 shadow-[0_0_15px_rgba(0,0,0,0.7)]"
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
        </div>
        {postsError ? (
          <div className="mx-auto w-full lg:w-[50%]">Error fetching posts</div>
        ) : postsLoading ? (
          <div className="mx-auto w-full lg:w-[50%]">Loading...</div>
        ) : posts ? (
          sortMode === "Popular" ? (
            votesError ? (
              <div className="mx-auto w-full lg:w-[50%]">
                Error fetching votes
              </div>
            ) : votesLoading ? (
              <div className="mx-auto w-full lg:w-[50%]">Loading...</div>
            ) : votes ? (
              posts
                .sort((a, b) => {
                  const aVotes =
                    votes.filter((v) => v.postId === a.postId).length || 0;
                  const bVotes =
                    votes.filter((v) => v.postId === b.postId).length || 0;
                  return bVotes - aVotes;
                })
                .map((post) =>
                  searchContent === "" ? (
                    <PostThumbnail post={post} key={post.postId} />
                  ) : post.title
                      .toLowerCase()
                      .includes(searchContent.toLowerCase()) ||
                    post.content
                      .toLowerCase()
                      .includes(searchContent.toLowerCase()) ? (
                    <PostThumbnail post={post} key={post.postId} />
                  ) : (
                    ""
                  )
                )
            ) : (
              <div>An unexpected error has occured</div>
            )
          ) : (
            posts
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((post) =>
                searchContent === "" ? (
                  <PostThumbnail post={post} key={post.postId} />
                ) : post.title
                    .toLowerCase()
                    .includes(searchContent.toLowerCase()) ||
                  post.content
                    .toLowerCase()
                    .includes(searchContent.toLowerCase()) ? (
                  <PostThumbnail post={post} key={post.postId} />
                ) : (
                  ""
                )
              )
          )
        ) : (
          <div>No posts! Be the first to create one.</div>
        )}
      </div>
    </div>
  );
}
