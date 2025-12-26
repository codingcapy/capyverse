import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getPopularPostsPage } from "../lib/api/posts";
import usePostStore from "../store/PostStore";
import { PostThumbnail } from "./PostThumbnail";
import Sidebar from "./Sidebar";

export function PostsByPopular() {
  const { searchContent } = usePostStore();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    error,
  } = useInfiniteQuery({
    queryKey: ["popular-posts"],
    queryFn: getPopularPostsPage,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(([entry]) => {
      console.log({
        isIntersecting: entry.isIntersecting,
        boundingClientRect: entry.boundingClientRect,
        rootBounds: entry.rootBounds,
      });
      if (entry.isIntersecting) {
        fetchNextPage();
      }
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  if (error) {
    return (
      <div className="mx-auto w-full lg:w-[50%]">Error fetching posts</div>
    );
  }

  if (isPending) {
    return <div className="mx-auto w-full lg:w-[50%]">Loading...</div>;
  }

  return (
    <div className="mx-auto flex 2xl:pl-80">
      <div>
        {posts
          .filter(
            (post) =>
              searchContent === "" ||
              post.title.toLowerCase().includes(searchContent.toLowerCase()) ||
              post.content.toLowerCase().includes(searchContent.toLowerCase())
          )
          .map((post) => (
            <PostThumbnail key={post.postId} post={post} />
          ))}
        <div ref={loadMoreRef} className="h-10 bg-[#444444]" />
        {isFetchingNextPage && <div>Loading more…</div>}
        {!hasNextPage && (
          <div className="text-4xl text-center py-10">No more posts!</div>
        )}
      </div>
      <Sidebar />
    </div>
  );
}
