import { useQuery } from "@tanstack/react-query";
import {
  getVotesByCommentIdQueryOptions,
  useCreateVoteMutation,
  useUpdateVoteMutation,
} from "../lib/api/votes";
import useAuthStore from "../store/AuthStore";
import { useNavigate } from "@tanstack/react-router";
import { PiArrowFatUp } from "react-icons/pi";
import { PiArrowFatDown } from "react-icons/pi";
import { PiArrowFatUpFill } from "react-icons/pi";
import { PiArrowFatDownFill } from "react-icons/pi";
import { Comment } from "../../../schemas/comments";

export function CommentVotesComponent(props: { comment: Comment }) {
  const {
    data: votes,
    isLoading: votesLoading,
    isError: votesError,
  } = useQuery(getVotesByCommentIdQueryOptions(props.comment.commentId));
  const { mutate: createVote, isPending: createVotePending } =
    useCreateVoteMutation();
  const { mutate: updateVote, isPending: updateVotePending } =
    useUpdateVoteMutation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  function handleSubmitVote(
    e: React.MouseEvent<HTMLDivElement>,
    comment: Comment,
    value: number,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (createVotePending || updateVotePending) return;
    const vote =
      votes &&
      votes.find(
        (vote) =>
          vote.commentId === props.comment.commentId &&
          user &&
          vote.userId === user.userId,
      );
    if (user && vote) {
      updateVote({ voteId: vote.voteId, value });
    } else if (user) {
      createVote({
        postId: comment.postId,
        commentId: comment.commentId,
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
        <div className="flex w-fit rounded-full py-1 justify-center">
          {votes.filter(
            (vote) =>
              vote.commentId === props.comment.commentId &&
              user &&
              vote.userId === user.userId &&
              vote.value === 1,
          ).length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateVote({
                  voteId: votes.find(
                    (vote) =>
                      vote.commentId === props.comment.commentId &&
                      user &&
                      vote.userId === user.userId &&
                      vote.value === 1,
                  )!.voteId,
                  value: 0,
                });
              }}
              className="pr-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatUpFill size={20} />
            </div>
          ) : (
            <div
              onClick={(e) => {
                handleSubmitVote(e, props.comment, 1);
              }}
              className="pr-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatUp size={20} />
            </div>
          )}
          <div className="">
            {votes
              .filter((vote) => vote.commentId === props.comment.commentId)
              .reduce((acc, vote) => acc + vote.value!, 0)}
          </div>
          {votes.filter(
            (vote) =>
              vote.commentId === props.comment.commentId &&
              user &&
              vote.userId === user.userId &&
              vote.value === -1,
          ).length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateVote({
                  voteId: votes.find(
                    (vote) =>
                      vote.commentId === props.comment.commentId &&
                      user &&
                      vote.userId === user.userId &&
                      vote.value === -1,
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
                handleSubmitVote(e, props.comment, -1);
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
