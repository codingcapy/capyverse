import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getNewCommunityPostsPage, getNewPostsPage } from "../lib/api/posts";
import usePostStore from "../store/PostStore";
import { PostThumbnail } from "./PostThumbnail";
import { Community } from "../../../schemas/communities";
import { CommunitySidebar } from "./CommunitySidebar";

export function CommunityPostsByNew(props: { community: Community }) {
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
    queryKey: ["community-posts", props.community.communityId],
    queryFn: getNewCommunityPostsPage,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, posts.length]);

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
      <div className="2xl:min-w-[750px]">
        {posts
          .filter(
            (post) =>
              searchContent === "" ||
              post.title.toLowerCase().includes(searchContent.toLowerCase()) ||
              post.content.toLowerCase().includes(searchContent.toLowerCase()),
          )
          .map((post) => (
            <PostThumbnail key={post.postId} post={post} />
          ))}
        <div
          ref={loadMoreRef}
          style={{
            height: "40px",
            background: "#444444",
          }}
        />
        {isFetchingNextPage && <div>Loading more…</div>}
        {!hasNextPage && (
          <div className="text-4xl text-center py-10">No more posts!</div>
        )}
      </div>
      <CommunitySidebar community={props.community} />
    </div>
  );
}
