import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../store/AuthStore";
import defaultProfile from "/capypaul01.jpg";
import { useEffect, useState } from "react";
import { useUpdateProfilePicMutation } from "../lib/api/users";
import { useQuery } from "@tanstack/react-query";
import { getPostsByUserIdQueryOptions } from "../lib/api/posts";
import { getCommentsByUserIdQueryOptions } from "../lib/api/comments";
import { PostThumbnail } from "../components/PostThumbnail";
import { CommentThumbnail } from "../components/CommentThumbnail";

type ProfileMode = "Overview" | "Posts" | "Comments" | "Saved";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuthStore();
  const [logoHovered, setLogoHovered] = useState(false);
  const { mutate: updateProfilePic, isPending: updateProfilePicPending } =
    useUpdateProfilePicMutation();
  const [profileMode, setProfileMode] = useState<ProfileMode>("Overview");
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery(getPostsByUserIdQueryOptions((user && user.userId) || ""));
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery(getCommentsByUserIdQueryOptions((user && user.userId) || ""));
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (updateProfilePicPending) return;
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size exceeds 1MB. Please upload a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePic(
          {
            profilePic: (reader.result as string) || "",
            userId: (user && user.userId) || "",
          },
          {
            onSuccess: () =>
              useAuthStore.getState().setUser({
                ...user!,
                profilePic: reader.result as string,
              }),
          }
        );
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, []);

  return (
    <div className="pt-[70px] max-w-[1000px] mx-auto">
      <div className="flex text-2xl font-bold">
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <img
            src={user && user.profilePic ? user.profilePic : defaultProfile}
            alt=""
            className="w-[65px] h-[65px] rounded-full cursor-pointer"
          />
          {logoHovered && (
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-[15px] left-5 z-1 cursor-pointer"
            >
              <path
                d="M15.1113 9.89062C16.3766 11.9078 18.0945 13.614 20.1357 14.8662L10.5352 24.4688C10.2695 24.7344 10.1358 24.8668 9.97266 24.9541C9.8095 25.0414 9.62514 25.0787 9.25684 25.1523L4.20898 26.1621C4.00121 26.2037 3.89701 26.2242 3.83789 26.165C3.77902 26.1059 3.80027 26.0016 3.8418 25.7939L4.85059 20.7461C4.92427 20.3777 4.96149 20.1935 5.04883 20.0303C5.13616 19.8671 5.26951 19.7344 5.53516 19.4688L15.1113 9.89062ZM21.249 4.27148C21.7668 4.27148 22.1842 4.68815 23.0176 5.52148L24.4814 6.98633C25.3148 7.81966 25.7314 8.23614 25.7314 8.75391C25.7314 9.27166 25.3148 9.68816 24.4814 10.5215L21.0479 13.9541C18.9748 12.7418 17.2473 11.0284 16.0205 8.98145L19.4814 5.52148C20.3145 4.68839 20.7315 4.27172 21.249 4.27148Z"
                fill="white"
              />
            </svg>
          )}
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="absolute top-0 left-0 z-10 h-[50px] w-[50px] opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
          {logoHovered && (
            <div className="absolute rounded-full inset-0 bg-black opacity-50 z-0 cursor-pointer"></div>
          )}
        </div>
        <div className="ml-5">{user ? user.username : "Unknown User"}</div>
      </div>
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
        <div
          className={`px-3 py-2 cursor-pointer rounded-full ${profileMode === "Saved" && "bg-[#4b4b4b]"} hover:text-cyan-500 transition-all ease-in-out duration-300`}
          onClick={() => setProfileMode("Saved")}
        >
          Saved
        </div>
      </div>
      <div className="">
        <Link
          to="/createpost"
          className="border p-2 rounded-full font-bold text-xs hover:text-cyan-500 transition-all ease-in-out duration-300"
        >
          + Create Post
        </Link>
      </div>
      <div className="my-10">
        {(profileMode === "Overview" || profileMode === "Posts") &&
        postsError ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Error loading posts
          </div>
        ) : (profileMode === "Overview" || profileMode === "Posts") &&
          postsLoading ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Loading...
          </div>
        ) : (profileMode === "Overview" || profileMode === "Posts") && posts ? (
          posts.map((post) => <PostThumbnail post={post} key={post.postId} />)
        ) : (
          (profileMode === "Overview" ||
            profileMode === "Posts" ||
            profileMode === "Saved") && (
            <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
              <div className="relative my-1 rounded py-2 px-4">
                No posts yet!
              </div>
            </div>
          )
        )}
        {(profileMode === "Overview" || profileMode === "Comments") &&
        commentsError ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Error loading comments
          </div>
        ) : (profileMode === "Overview" || profileMode === "Comments") &&
          commentsLoading ? (
          <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
            Loading...
          </div>
        ) : (profileMode === "Overview" || profileMode === "Comments") &&
          comments ? (
          comments.map((comment) => <CommentThumbnail comment={comment} />)
        ) : (
          (profileMode === "Overview" ||
            profileMode === "Comments" ||
            profileMode === "Saved") && (
            <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
              <div className="relative my-1 rounded py-2 px-4">
                No comments yet!
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
