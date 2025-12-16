import { useQuery } from "@tanstack/react-query";
import { getPostsQueryOptions } from "../lib/api/posts";
import usePostStore from "../store/PostStore";
import { PostThumbnail } from "./PostThumbnail";
import { useState } from "react";

export function PostsByNew() {
  const {
    data: posts,
    isPending: postsLoading,
    error: postsError,
  } = useQuery(getPostsQueryOptions());
  const { searchContent } = usePostStore();

  return (
    <div>
      {postsError ? (
        <div className="mx-auto w-full lg:w-[50%]">Error fetching posts</div>
      ) : postsLoading ? (
        <div className="mx-auto w-full lg:w-[50%]">Loading...</div>
      ) : posts ? (
        posts.map((post) =>
          searchContent === "" ? (
            <PostThumbnail post={post} key={post.postId} />
          ) : post.title.toLowerCase().includes(searchContent.toLowerCase()) ||
            post.content.toLowerCase().includes(searchContent.toLowerCase()) ? (
            <PostThumbnail post={post} key={post.postId} />
          ) : (
            ""
          )
        )
      ) : (
        <div>No posts! Be the first to create one.</div>
      )}
    </div>
  );
}
