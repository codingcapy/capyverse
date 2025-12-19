import { useQuery } from "@tanstack/react-query";
import {
  getVotesByPostIdQueryOptions,
  getVotesQueryOptions,
  useCreateVoteMutation,
  useUpdateVoteMutation,
} from "../lib/api/votes";
import useAuthStore from "../store/AuthStore";
import { useNavigate } from "@tanstack/react-router";
import { Post } from "../../../schemas/posts";
import { PiArrowFatUp } from "react-icons/pi";
import { PiArrowFatDown } from "react-icons/pi";
import { PiArrowFatUpFill } from "react-icons/pi";
import { PiArrowFatDownFill } from "react-icons/pi";

export function VotesComponent(props: { post: Post }) {
  const {
    data: votes,
    isLoading: votesLoading,
    isError: votesError,
  } = useQuery(getVotesByPostIdQueryOptions(props.post.postId));
  const { mutate: createVote, isPending: createVotePending } =
    useCreateVoteMutation();
  const { mutate: updateVote, isPending: updateVotePending } =
    useUpdateVoteMutation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  function handleSubmitVote(
    e: React.MouseEvent<HTMLDivElement>,
    post: Post,
    value: number
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (createVotePending || updateVotePending) return;
    const vote =
      votes &&
      votes.find(
        (vote) => vote.commentId === null && user && vote.userId === user.userId
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
    <div>
      {votesError ? (
        <div>Error fetching votes</div>
      ) : votesLoading ? (
        <div>Loading...</div>
      ) : votes ? (
        <div className="flex bg-[#3e3e3e] w-fit rounded-full py-1 justify-center">
          {votes.filter(
            (vote) =>
              vote.commentId === null &&
              user &&
              vote.userId === user.userId &&
              vote.value === 1
          ).length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateVote({
                  voteId: votes.find(
                    (vote) =>
                      vote.commentId === null &&
                      user &&
                      vote.userId === user.userId &&
                      vote.value === 1
                  )!.voteId,
                  value: 0,
                });
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatUpFill size={20} />
            </div>
          ) : (
            <div
              onClick={(e) => {
                handleSubmitVote(e, props.post, 1);
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatUp size={20} />
            </div>
          )}
          <div className="font-semibold">
            {votes
              .filter((vote) => vote.commentId === null)
              .reduce((acc, vote) => acc + vote.value!, 0)}
          </div>
          {votes.filter(
            (vote) =>
              vote.commentId === null &&
              user &&
              vote.userId === user.userId &&
              vote.value === -1
          ).length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateVote({
                  voteId: votes.find(
                    (vote) =>
                      vote.commentId === null &&
                      vote.postId === props.post.postId &&
                      user &&
                      vote.userId === user.userId &&
                      vote.value === -1
                  )!.voteId,
                  value: 0,
                });
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatDownFill size={20} />
            </div>
          ) : (
            <div
              onClick={(e) => {
                handleSubmitVote(e, props.post, -1);
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatDown size={20} />
            </div>
          )}
        </div>
      ) : (
        <div>An unexpected error has occured</div>
      )}
    </div>
  );
}
