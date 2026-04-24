import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getUserByUsernameQueryOptions } from "../../lib/api/users";
import defaultProfile from "/capypaul01.jpg";
import { useState } from "react";
import { getPostsByUsernameInfiniteQueryOptions } from "../../lib/api/posts";
import { PostThumbnail } from "../../components/PostThumbnail";
import { getCommentsByUsernameInfiniteQueryOptions } from "../../lib/api/comments";
import { CommentThumbnail } from "../../components/CommentThumbnail";

type ProfileMode = "Overview" | "Posts" | "Comments";

export const Route = createFileRoute("/u/$username")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { username } = Route.useParams();
  const {
    data: profileUser,
    isLoading: profileUserLoading,
    error: profileUserError,
  } = useQuery(getUserByUsernameQueryOptions(username));
  const [profileMode, setProfileMode] = useState<ProfileMode>("Overview");
  const {
    data: userPostsData,
    isLoading: userPostsLoading,
    error: userPostsError,
    hasNextPage: hasNextPostsPage,
    fetchNextPage: fetchNextPostsPage,
    isFetchingNextPage: isFetchingNextPostsPage,
  } = useInfiniteQuery(getPostsByUsernameInfiniteQueryOptions(username));
  const {
    data: userCommentsData,
    isLoading: userCommentsLoading,
    error: userCommentsError,
    hasNextPage: hasNextCommentsPage,
    fetchNextPage: fetchNextCommentsPage,
    isFetchingNextPage: isFetchingNextCommentsPage,
  } = useInfiniteQuery(getCommentsByUsernameInfiniteQueryOptions(username));

  const userPosts = userPostsData?.pages.flatMap((page) => page.posts) ?? [];
  const userComments =
    userCommentsData?.pages.flatMap((page) => page.comments) ?? [];

  return (
    <div className="pt-[70px] mx-auto">
      {profileUserLoading ? (
        <div>Loading...</div>
      ) : profileUserError ? (
        <div>Error loading user</div>
      ) : profileUser ? (
        <div className="flex text-2xl font-bold">
          <div className="">
            <img
              src={
                profileUser.profilePic ? profileUser.profilePic : defaultProfile
              }
              alt=""
              className="w-[65px] h-[65px] rounded-full cursor-pointer object-cover object-center"
            />
          </div>
          <div className="ml-5">{profileUser.username}</div>
        </div>
      ) : (
        <div></div>
      )}
      <div className="flex my-10 font-bold">
        <div
          className={`px-3 py-2 cursor-pointer rounded-full ${profileMode === "Overview" && "bg-[#4b4b4b]"} hover:text-cyan-500 transition-all ease-in-out duration-300`}
          onClick={() => setProfileMode("Overview")}
        >
          Overview
        </div>
        <div
          className={`px-3 py-2 cursor-pointer rounded-full ${profileMode === "Posts" && "bg-[#4b4b4b]"} hover:text-cyan-500 transition-all ease-in-out duration-300`}
          onClick={() => setProfileMode("Posts")}
        >
          Posts
        </div>
        <div
          className={`px-3 py-2 cursor-pointer rounded-full ${profileMode === "Comments" && "bg-[#4b4b4b]"} hover:text-cyan-500 transition-all ease-in-out duration-300`}
          onClick={() => setProfileMode("Comments")}
        >
          Comments
        </div>
      </div>
      <div className="my-10 w-full 2xl:min-w-[750px]">
        {(profileMode === "Overview" || profileMode === "Posts") &&
        userPostsError ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Error loading posts
          </div>
        ) : (profileMode === "Overview" || profileMode === "Posts") &&
          userPostsLoading ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Loading...
          </div>
        ) : (profileMode === "Overview" || profileMode === "Posts") &&
          userPosts ? (
          userPosts.map((post) => (
            <PostThumbnail post={post} key={post.postId} />
          ))
        ) : (
          <div></div>
        )}
        {profileMode === "Posts" && hasNextPostsPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchNextPostsPage()}
              disabled={isFetchingNextPostsPage}
              className="bg-cyan-600 px-5 py-2 rounded-full font-bold cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300 disabled:opacity-50"
            >
              {isFetchingNextPostsPage ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
        {(profileMode === "Overview" || profileMode === "Comments") &&
        userCommentsError ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Error loading comments
          </div>
        ) : (profileMode === "Overview" || profileMode === "Comments") &&
          userCommentsLoading ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Loading...
          </div>
        ) : (profileMode === "Overview" || profileMode === "Comments") &&
          userComments ? (
          userComments.map((comment) => (
            <CommentThumbnail comment={comment} key={comment.commentId} />
          ))
        ) : (
          (profileMode === "Overview" || profileMode === "Comments") && (
            <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
              <div className="relative my-1 rounded py-2 px-4"></div>
            </div>
          )
        )}
        {profileMode === "Comments" && hasNextCommentsPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchNextCommentsPage()}
              disabled={isFetchingNextCommentsPage}
              className="bg-cyan-600 px-5 py-2 rounded-full font-bold cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300 disabled:opacity-50"
            >
              {isFetchingNextCommentsPage ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
