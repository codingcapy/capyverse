import { Link } from "@tanstack/react-router";
import useAuthStore from "../store/AuthStore";
import defaultProfile from "/capypaul01.jpg";
import { displayDate } from "../lib/utils";
import { FaEllipsis } from "react-icons/fa6";
import { CommentVotesComponent } from "./CommentVotesComponent";
import { useState } from "react";
import { CommentMenu } from "./CommentMenu";
import { useDeleteCommentMutation } from "../lib/api/comments";
import { Comment } from "../../../schemas/comments";
import { getUserByIdQueryOptions } from "../lib/api/users";
import { useQuery } from "@tanstack/react-query";

export function CommentThumbnail(props: { comment: Comment }) {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const { mutate: deleteComment, isPending: deleteCommentPending } =
    useDeleteCommentMutation();
  const {
    data: poster,
    isLoading: posterLoading,
    error: posterError,
  } = useQuery(getUserByIdQueryOptions(props.comment.userId));

  return (
    <div
      key={props.comment.commentId}
      className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]"
    >
      {posterLoading ? (
        <div>Loading...</div>
      ) : posterError ? (
        <div>Error loading poster</div>
      ) : poster ? (
        <Link
          to="/posts/$postId"
          params={{
            postId: props.comment.postId.toString(),
          }}
          key={props.comment.postId}
        >
          <div className="relative my-1 rounded py-2 px-4 hover:bg-[#333333] transition-all ease-in-out duration-300">
            <div className="flex justify-between">
              <div className="flex text-[#bdbdbd] text-sm">
                <img
                  src={poster.profilePic ? poster.profilePic : defaultProfile}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover object-center "
                />
                <div className="font-bold ml-2">{poster.username}</div>
                <div className="px-1">•</div>
                <div>{displayDate(props.comment.createdAt)}</div>
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
            <div>{props.comment.content}</div>
            <CommentVotesComponent comment={props.comment} />
            {showMenu && (
              <CommentMenu
                comment={props.comment}
                setDeleteMode={setDeleteMode}
                setShowMenu={setShowMenu}
                setCommentContent={setCommentContent}
              />
            )}
          </div>
        </Link>
      ) : (
        <div></div>
      )}
      {deleteMode && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#222222] p-6 rounded shadow-lg w-[90%] max-w-md text-center z-100`}
        >
          <div className="text-2xl font-bold">Delete Comment?</div>
          <div className="my-5">
            Once you delete this comment, it can’t be restored.
          </div>
          <div className="my-5 flex justify-end">
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (deleteCommentPending) return;
                deleteComment({ commentId: props.comment.commentId });
                setDeleteMode(false);
              }}
              className="p-2 mr-1 bg-red-500 rounded text-white bold secondary-font font-bold cursor-pointer"
            >
              {deleteCommentPending ? "Deleting..." : "DELETE"}
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
      {deleteMode && (
        <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
      )}
    </div>
  );
}
