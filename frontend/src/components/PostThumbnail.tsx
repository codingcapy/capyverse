import { Link } from "@tanstack/react-router";
import { FaEllipsis } from "react-icons/fa6";
import { VotesComponent } from "./VotesComponent";
import { displayDate } from "../lib/utils";
import { PostWithUser, useDeletePostMutation } from "../lib/api/posts";
import { useState } from "react";
import useAuthStore from "../store/AuthStore";
import { Menu } from "./Menu";
import defaultProfile from "/capypaul01.jpg";
import { useQuery } from "@tanstack/react-query";
import { getUserByIdQueryOptions } from "../lib/api/users";
import { getCommentsByPostIdQueryOptions } from "../lib/api/comments";
import { IoChatbubbleOutline } from "react-icons/io5";

export function PostThumbnail(props: { post: PostWithUser }) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const { mutate: deletePost, isPending: deletePostPending } =
    useDeletePostMutation();
  const { user } = useAuthStore();
  const { data: poster, isLoading: posterLoading } = useQuery(
    getUserByIdQueryOptions(props.post.userId)
  );
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery(getCommentsByPostIdQueryOptions(props.post.postId));

  return (
    <div className="mx-auto w-full lg:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
      <Link
        to="/posts/$postId"
        params={{
          postId: props.post.postId.toString(),
        }}
        key={props.post.postId}
      >
        <div className="relative my-1 rounded p-5 hover:bg-[#333333] transition-all ease-in-out duration-300">
          <div className="flex justify-between">
            <div className="flex text-[#bdbdbd] text-sm">
              <img
                src={
                  !posterLoading
                    ? poster
                      ? poster.profilePic
                        ? poster.profilePic
                        : defaultProfile
                      : defaultProfile
                    : defaultProfile
                }
                alt=""
                className="w-6 h-6 rounded-full"
              />
              <div className="font-bold ml-2">{props.post.username}</div>
              <div className="px-1">•</div>
              <div>{displayDate(props.post.createdAt)}</div>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="absolute top-1 right-1 p-3 rounded-full hover:bg-[#575757] transition-all ease-in-out duration-300"
            >
              <FaEllipsis />
            </div>
          </div>
          <div className="text-2xl font-bold">{props.post.title}</div>
          <div className="my-2">{props.post.content}</div>
          <div className="flex">
            <VotesComponent post={props.post} />
            <div className="flex bg-[#3e3e3e] w-fit rounded-full py-1 justify-center ml-2 hover:text-cyan-500 transition-all ease-in-out duration-300">
              <div className="pl-3 pr-1">
                <IoChatbubbleOutline size={20} />
              </div>
              {commentsLoading ? (
                <div className="pr-3">Loading...</div>
              ) : commentsError ? (
                <div className="pr-3">Error fetching comments</div>
              ) : comments ? (
                <div className="pr-3 font-semibold">{comments.length}</div>
              ) : (
                <div className="pr-3">An unexpected error has occured</div>
              )}
            </div>
          </div>
          {showMenu && (
            <Menu
              post={props.post}
              setDeleteMode={setDeleteMode}
              setShowMenu={setShowMenu}
            />
          )}
        </div>
        {user && props.post.userId === user.userId && deleteMode && (
          <div
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#222222] p-6 rounded shadow-lg w-[90%] max-w-md text-center z-100`}
          >
            <div className="text-2xl font-bold">Delete Post?</div>
            <div className="my-5">
              Once you delete this post, it can’t be restored.
            </div>
            <div className="my-5 flex justify-end">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  deletePost({ postId: props.post.postId });
                  setDeleteMode(false);
                }}
                className="p-2 mr-1 bg-red-500 rounded text-white bold secondary-font font-bold cursor-pointer"
              >
                DELETE
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDeleteMode(false);
                }}
                className="p-2 ml-1 bg-[#5c5c5c] rounded bold secondary-font font-bold cursor-pointer"
              >
                CANCEL
              </div>
            </div>
          </div>
        )}
      </Link>
      {user && props.post.userId === user.userId && deleteMode && (
        <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
      )}
    </div>
  );
}
