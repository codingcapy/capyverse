import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getPostsQueryOptions } from "../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import { PostThumbnail } from "../components/PostThumbnail";
import { PiCaretDownBold } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";

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
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("Popular");
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    <div className="flex-1 p-2">
      <div className="flex flex-col">
        <div className="mx-auto w-full lg:w-[50%] pt-[70px] pb-5 ">
          <div
            ref={menuRef}
            className="relative mx-auto w-full 2xl:w-[750px] flex"
          >
            <div
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex cursor-pointer"
            >
              <div className="text-xs">{sortMode}</div>
              <div className="ml-2">
                <PiCaretDownBold />
              </div>
            </div>
            {showSortMenu && (
              <div
                onClick={() => {}}
                className="absolute top-5 left-0 bg-[#444444] px-5 py-2 z-50"
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
          posts.map((post) => <PostThumbnail post={post} key={post.postId} />)
        ) : (
          <div>An unexpected error has occured</div>
        )}
      </div>
    </div>
  );
}
