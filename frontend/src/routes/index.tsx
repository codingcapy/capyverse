import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getPostsQueryOptions } from "../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import { PostThumbnail } from "../components/PostThumbnail";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const {
    data: posts,
    isPending: postsPending,
    isError: postsError,
  } = useQuery(getPostsQueryOptions());

  return (
    <div className="flex-1 p-2">
      <div className="text-center text-cyan-500 text-2xl font-bold pt-20 pb-5">
        Index
      </div>
      <div className="flex flex-col">
        {postsError ? (
          <div className="mx-auto w-full lg:w-[50%]">Error fetching posts</div>
        ) : postsPending ? (
          <div className="mx-auto w-full lg:w-[50%]">Loading...</div>
        ) : (
          posts?.map((post) => <PostThumbnail post={post} key={post.postId} />)
        )}
      </div>
    </div>
  );
}
