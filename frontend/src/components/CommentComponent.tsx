import { IoChatbubbleOutline } from "react-icons/io5";
import { Post } from "../../../schemas/posts";
import { displayDate } from "../lib/utils";
import { CommentVotesComponent } from "./CommentVotesComponent";
import { useState } from "react";
import useAuthStore from "../store/AuthStore";
import { useCreateCommentMutation } from "../lib/api/comments";
import { useNavigate } from "@tanstack/react-router";

export function CommentComponent(props: {
  comment: {
    createdAt: Date;
    commentId: number;
    userId: string;
    postId: number;
    parentCommentId: number | null;
    level: number;
    content: string | null;
    status: string;
    username: string | null;
  };
  post: Post;
}) {
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
        <form onSubmit={handleCreateComment}>
          <input
            type="text"
            placeholder="Add your reply"
            className="px-5 py-2 my-5 rounded-full border border-[#5c5c5c] w-full hover:bg-[#383838] hover:border-[#818181] transition-all ease-in-out duration-300"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            required
          />
        </form>
      )}
    </div>
  );
}
