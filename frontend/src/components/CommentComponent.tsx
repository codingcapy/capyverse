import { IoChatbubbleOutline } from "react-icons/io5";
import { Post } from "../../../schemas/posts";
import { displayDate } from "../lib/utils";
import { CommentVotesComponent } from "./CommentVotesComponent";
import { useState } from "react";
import useAuthStore from "../store/AuthStore";
import { useCreateCommentMutation } from "../lib/api/comments";
import { useNavigate } from "@tanstack/react-router";
import { CommentNode, SerializedComment } from "../routes/posts/$postId";

export function CommentComponent(props: { comment: CommentNode; post: Post }) {
  const [replyMode, setReplyMode] = useState(false);
  const { user } = useAuthStore();
  const [commentContent, setCommentContent] = useState("");
  const { mutate: createComment } = useCreateCommentMutation();
  const navigate = useNavigate();

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
      { onSuccess: () => setCommentContent("") }
    );
  }

  return (
    <div
      key={props.comment.commentId}
      className={`my-3`}
      style={{
        paddingLeft: props.comment.level * 25,
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
          onClick={() => setReplyMode(true)}
          className="flex ml-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
        >
          <IoChatbubbleOutline size={22} />
          <div className="ml-2">Reply</div>
        </div>
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
