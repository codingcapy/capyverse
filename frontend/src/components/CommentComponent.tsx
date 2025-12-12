import { IoChatbubbleOutline } from "react-icons/io5";
import { Post } from "../../../schemas/posts";
import { displayDate } from "../lib/utils";
import { CommentVotesComponent } from "./CommentVotesComponent";
import { useState } from "react";
import useAuthStore from "../store/AuthStore";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from "../lib/api/comments";
import { useNavigate } from "@tanstack/react-router";
import { CommentNode, SerializedComment } from "../routes/posts/$postId";
import { FaEllipsis } from "react-icons/fa6";
import { CommentMenu } from "./CommentMenu";

export function CommentComponent(props: { comment: CommentNode; post: Post }) {
  const [replyMode, setReplyMode] = useState(false);
  const { user } = useAuthStore();
  const [commentContent, setCommentContent] = useState("");
  const { mutate: createComment } = useCreateCommentMutation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const { mutate: deleteComment, isPending: deleteCommentPending } =
    useDeleteCommentMutation();

  function handleCreateComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return navigate({ to: "/login" });
    const userId = user.userId;
    createComment(
      {
        userId,
        postId: props.post.postId,
        parentCommentId: props.comment.commentId,
        level: props.comment.level + 1,
        content: commentContent,
      },
      {
        onSuccess: () => {
          setCommentContent("");
          setReplyMode(false);
        },
      }
    );
  }

  return (
    <div
      key={props.comment.commentId}
      className={`my-3`}
      style={{
        paddingLeft:
          window.innerWidth > 760
            ? props.comment.level * 25
            : props.comment.level * 10,
      }}
    >
      <div className="flex text-[#bdbdbd] text-sm">
        <div className="font-bold">{props.comment.username}</div>
        <div className="px-1">•</div>
        <div>{displayDate(props.post.createdAt)}</div>
      </div>
      <div>{props.comment.content}</div>
      <div className="flex">
        <div className="mr-3">
          <CommentVotesComponent post={props.post} comment={props.comment} />
        </div>
        <div
          onClick={() => {
            if (!user) navigate({ to: "/login" });
            setReplyMode(true);
          }}
          className="flex ml-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
        >
          <IoChatbubbleOutline size={22} />
          <div className="ml-2">Reply</div>
        </div>
        {user && props.comment.userId === user.userId && (
          <div className="relative">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="ml-3 px-2 pt-1.5 rounded-full hover:text-cyan-700 transition-all ease-in-out duration-300 cursor-pointer"
            >
              <FaEllipsis />
            </div>
            {showMenu && (
              <CommentMenu
                comment={props.comment}
                setDeleteMode={setDeleteMode}
                setShowMenu={setShowMenu}
              />
            )}
          </div>
        )}
      </div>
      {replyMode && (
        <form
          onSubmit={handleCreateComment}
          className={`pl-5 py-2 my-5 ${replyMode ? "rounded-2xl" : "rounded-full"} border border-[#5c5c5c] w-full hover:bg-[#383838] hover:border-[#818181] transition-all ease-in-out duration-300`}
        >
          <input
            type="text"
            placeholder="Add your reply"
            className="outline-none"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setReplyMode(false);
              }}
              className="cursor-pointer px-2 py-1 rounded-full bg-[#383838]"
            >
              Cancel
            </div>
            <button className="mx-2 px-2 py-1 rounded-full bg-red-500">
              Comment
            </button>
          </div>
        </form>
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
                deleteComment({ commentId: props.comment.commentId });
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
      {deleteMode && (
        <div className="fixed inset-0 bg-black opacity-50 z-60"></div>
      )}
      {props.comment.children?.map((child) => (
        <CommentComponent
          key={child.commentId}
          comment={child}
          post={props.post}
        />
      ))}
    </div>
  );
}
