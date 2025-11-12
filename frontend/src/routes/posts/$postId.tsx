import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { getPostByIdQueryOptions } from "../../lib/api/posts";
import { PiArrowFatUp } from "react-icons/pi";
import { PiArrowFatDown } from "react-icons/pi";
import { PiArrowFatUpFill } from "react-icons/pi";
import { PiArrowFatDownFill } from "react-icons/pi";
import { Post } from "../../../../schemas/posts";
import {
  getVotesQueryOptions,
  useCreateVoteMutation,
  useUpdateVoteMutation,
} from "../../lib/api/votes";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/AuthStore";
import { VotesComponent } from "../../components/VotesComponent";

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
    data: votes,
    isPending: votesPending,
    isError: votesError,
  } = useQuery(getVotesQueryOptions());
  const { mutate: createVote } = useCreateVoteMutation();
  const { mutate: updateVote } = useUpdateVoteMutation();
  const navigate = useNavigate();

  function handleSubmitVote(
    e: React.MouseEvent<HTMLDivElement>,
    post: Post,
    value: number
  ) {
    e.preventDefault();
    e.stopPropagation();
    const vote =
      votes &&
      votes.find(
        (vote) =>
          vote.postId === post.postId && user && vote.userId === user.userId
      );
    if (user && vote) {
      updateVote({ voteId: vote.voteId, value });
    } else if (user) {
      createVote({
        userId: (user && user.userId) || "",
        postId: post.postId,
        value,
      });
    } else {
      navigate({ to: "/login" });
    }
  }

  return (
    <div className="p-20 mx-auto w-full lg:w-[50%]">
      <div className="text-4xl font-bold"> {post.title}</div>
      <div className="my-10">
        <div> {post.content}</div>
      </div>
      <VotesComponent post={post} />
      <form action="">
        <input
          type="text"
          placeholder="Add your reply"
          className="px-5 py-2 my-5 rounded-full border border-[#5c5c5c] w-full"
        />
      </form>
    </div>
  );
}
