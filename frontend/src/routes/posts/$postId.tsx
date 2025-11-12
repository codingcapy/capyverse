import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { getPostByIdQueryOptions } from "../../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/AuthStore";
import { VotesComponent } from "../../components/VotesComponent";
import { useState } from "react";
import {
  getCommentsQueryOptions,
  useCreateCommentMutation,
} from "../../lib/api/comments";
import { getUserByIdQueryOptions } from "../../lib/api/users";
import { displayDate } from "../../lib/utils";

export const Route = createFileRoute("/posts/$postId")({
  beforeLoad: async ({ context, params }) => {
    const { postId: postIdParam } = params;
    try {
      const postId = z.coerce.number().int().parse(postIdParam);
      const postQuery = await context.queryClient.fetchQuery({
        ...getPostByIdQueryOptions(postId),
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes("404")) {
            return false;
          }
          if (error instanceof Error && error.message.includes("403")) {
            return false;
          }
          return failureCount < 1;
        },
      });
      return postQuery;
    } catch (e) {
      console.error(e, "redirect to dash on error");
      throw redirect({ to: "/" });
    }
  },
  component: PostComponent,
});

function PostComponent() {
  const post = Route.useRouteContext();
  const { user } = useAuthStore();
  const {
    data: comments,
    isPending: commentsPending,
    error: commentsError,
  } = useQuery(getCommentsQueryOptions());
  const {
    data: author,
    isPending: authorPending,
    error: authorError,
  } = useQuery(getUserByIdQueryOptions(post.userId));
  const [commentContent, setCommentContent] = useState("");
  const { mutate: createComment } = useCreateCommentMutation();
  const navigate = useNavigate();

  function handleCreateComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return navigate({ to: "/login" });
    const userId = user.userId;
    createComment({ userId, postId: post.postId, content: commentContent });
  }

  return (
    <div className="p-20 mx-auto w-full lg:w-[50%]">
      <div className="flex text-[#bdbdbd] text-sm">
        {authorPending ? (
          <div>Loading...</div>
        ) : authorError ? (
          <div>Error loading author</div>
        ) : (
          <div className="font-bold">{author.username}</div>
        )}
        <div className="px-1">•</div>
        <div>{displayDate(post.createdAt)}</div>
      </div>
      <div className="text-4xl font-bold"> {post.title}</div>
      <div className="my-10">
        <div>{post.content}</div>
      </div>
      <VotesComponent post={post} />
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
      {commentsError ? (
        <div></div>
      ) : commentsPending ? (
        <div></div>
      ) : (
        comments.map((comment) => (
          <div key={comment.commentId}>{comment.content}</div>
        ))
      )}
    </div>
  );
}
