import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { getPostByIdQueryOptions } from "../../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/AuthStore";
import { VotesComponent } from "../../components/VotesComponent";
import { useState } from "react";
import {
  getCommentsByPostIdQueryOptions,
  useCreateCommentMutation,
} from "../../lib/api/comments";
import { getUserByIdQueryOptions } from "../../lib/api/users";
import { displayDate } from "../../lib/utils";
import { CommentComponent } from "../../components/CommentComponent";

export type SerializedComment = {
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

export type CommentNode = SerializedComment & {
  children: CommentNode[];
};

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
  } = useQuery(getCommentsByPostIdQueryOptions(post.postId));
  const {
    data: author,
    isPending: authorPending,
    error: authorError,
  } = useQuery(getUserByIdQueryOptions(post.userId));
  const [commentContent, setCommentContent] = useState("");
  const { mutate: createComment } = useCreateCommentMutation();
  const navigate = useNavigate();
  const [commentMode, setCommentMode] = useState(false);
  const commentTree = buildCommentTree((comments && comments) || [], {
    sort: "asc",
  });

  function buildCommentTree(
    comments: SerializedComment[],
    opts?: { sort?: "asc" | "desc" }
  ): CommentNode[] {
    const sort = opts?.sort ?? "desc";
    const map = new Map<number, CommentNode>();
    for (const c of comments) {
      map.set(c.commentId, { ...c, children: [] });
    }
    const roots: CommentNode[] = [];
    for (const c of comments) {
      const node = map.get(c.commentId)!;
      if (c.parentCommentId == null) {
        roots.push(node);
        continue;
      }
      const parent = map.get(c.parentCommentId);
      if (!parent) {
        roots.push(node);
        continue;
      }
      parent.children.push(node);
    }
    const cmp = (a: CommentNode, b: CommentNode) =>
      sort === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    function sortRec(nodes: CommentNode[]) {
      nodes.sort(cmp);
      for (const n of nodes) {
        if (n.children.length) sortRec(n.children);
      }
    }
    sortRec(roots);
    return roots;
  }

  function handleCreateComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return navigate({ to: "/login" });
    const userId = user.userId;
    createComment(
      { userId, postId: post.postId, content: commentContent },
      { onSuccess: () => setCommentContent("") }
    );
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
      <form
        onClick={() => setCommentMode(true)}
        onSubmit={handleCreateComment}
        className="px-5 py-2 my-5 rounded-full border border-[#5c5c5c] w-full hover:bg-[#383838] hover:border-[#818181] transition-all ease-in-out duration-300"
      >
        <input
          type="text"
          placeholder="Add your reply"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          required
          className="outline-none"
        />
        {commentMode && (
          <div className="flex justify-end">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setCommentMode(false);
              }}
              className="cursor-pointer px-2 py-1 rounded-full bg-[#383838]"
            >
              Cancel
            </div>
            <button className="mx-2 px-2 py-1 rounded-full bg-red-500">
              Comment
            </button>
          </div>
        )}
      </form>
      {commentsError ? (
        <div></div>
      ) : commentsPending ? (
        <div></div>
      ) : (
        commentTree.map((comment) => (
          <CommentComponent
            comment={comment}
            post={post}
            key={comment.commentId}
          />
        ))
      )}
    </div>
  );
}
