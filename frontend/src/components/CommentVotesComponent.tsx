import { useQuery } from "@tanstack/react-query";
import {
  getVotesByCommentIdQueryOptions,
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
import { Comment } from "../../../schemas/comments";

export function CommentVotesComponent(props: { post: Post; comment: Comment }) {
  const {
    data: votes,
    isPending: votesPending,
    isError: votesError,
  } = useQuery(getVotesByCommentIdQueryOptions(props.comment.commentId));
  const { mutate: createVote } = useCreateVoteMutation();
  const { mutate: updateVote } = useUpdateVoteMutation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  function handleSubmitVote(
    e: React.MouseEvent<HTMLDivElement>,
    post: Post,
    comment: Comment,
    value: number
  ) {
    e.preventDefault();
    e.stopPropagation();
    const vote =
      votes && votes.find((vote) => user && vote.userId === user.userId);
    if (user && vote) {
      updateVote({ voteId: vote.voteId, value });
    } else if (user) {
      createVote({
        userId: (user && user.userId) || "",
        postId: post.postId,
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
      ) : votesPending ? (
        <div>Loading...</div>
      ) : (
        <div className="flex w-fit rounded-full py-1 justify-center">
          {votes.filter(
            (vote) => user && vote.userId === user.userId && vote.value === 1
          ).length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateVote({
                  voteId: votes.find(
                    (vote) =>
                      vote.postId === props.post.postId &&
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
                handleSubmitVote(e, props.post, props.comment, 1);
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatUp size={20} />
            </div>
          )}
          <div className="">
            {votes
              .filter((vote) => vote.postId === props.post.postId)
              .reduce((acc, vote) => acc + vote.value!, 0)}
          </div>
          {votes.filter(
            (vote) => user && vote.userId === user.userId && vote.value === -1
          ).length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateVote({
                  voteId: votes.find(
                    (vote) =>
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
                handleSubmitVote(e, props.post, props.comment, -1);
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <PiArrowFatDown size={20} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
