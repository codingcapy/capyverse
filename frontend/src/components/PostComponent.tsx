import { useQuery } from "@tanstack/react-query";
import { Post } from "../../../schemas/posts";
import { getCommentsQueryOptions } from "../lib/api/comments";

export function PostComponent(props: { post: Post }) {
  const {
    data: comments,
    isPending: commentsPending,
    isError: commentsError,
  } = useQuery(getCommentsQueryOptions());

  return (
    <div>
      <div>{props.post.title}</div>
      <div>{props.post.content}</div>
      {commentsError ? (
        <div>Error fetching comments</div>
      ) : commentsPending ? (
        <div>Loading...</div>
      ) : (
        comments.map((comment) => <div>{comment.content}</div>)
      )}
    </div>
  );
}
