import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getPostsQueryOptions } from "../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import { PostThumbnail } from "../components/PostThumbnail";
import { PiCaretDownBold } from "react-icons/pi";

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
      <div className="flex flex-col">
        <div className="mx-auto w-full lg:w-[50%] pt-[70px] pb-5 ">
          <div className="mx-auto w-full 2xl:w-[750px] flex">
            <div className="flex cursor-pointer">
              <div className="text-xs">Popular</div>
              <div className="ml-2">
                <PiCaretDownBold />
              </div>
            </div>
          </div>
        </div>
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
