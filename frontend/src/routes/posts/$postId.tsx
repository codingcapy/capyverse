import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { getPostByIdQueryOptions } from "../../lib/api/posts";

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

  return (
    <div className="p-20">
      <div>Hello "/posts/$post"!</div>
      <div> {post.title}</div>
      <div></div>
      <div> {post.content}</div>
      <div>Upvote</div>
      <div>Downvote</div>
    </div>
  );
}
