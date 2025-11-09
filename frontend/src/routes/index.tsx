import { createFileRoute, Link } from "@tanstack/react-router";
import { getPostsQueryOptions } from "../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import { getVotesQueryOptions } from "../lib/api/votes";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const {
    data: posts,
    isPending: postsPending,
    isError: postsError,
  } = useQuery(getPostsQueryOptions());
  const {
    data: votes,
    isPending: votesPending,
    isError: votesError,
  } = useQuery(getVotesQueryOptions());

  return (
    <div className="flex-1 p-2">
      <div className="text-center text-cyan-500 text-2xl font-bold pt-20">
        Index
      </div>
      <div className="flex flex-col">
        {postsError ? (
          <div>Error fetching posts</div>
        ) : postsPending ? (
          <div>Loading...</div>
        ) : (
          posts?.map((post) => (
            <Link
              to="/posts/$postId"
              params={{
                postId: post.postId.toString(),
              }}
              key={post.postId}
              className="mx-auto my-10 border rounded p-5"
            >
              <div className="text-2xl font-bold">{post.title}</div>
              <div>{post.content}</div>
              {votesError ? (
                <div>Error fetching votes</div>
              ) : votesPending ? (
                <div>Loading...</div>
              ) : (
                <div>
                  {votes.filter((vote) => vote.postId === post.postId).length}
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
