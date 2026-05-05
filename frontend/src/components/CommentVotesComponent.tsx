import { useQuery } from "@tanstack/react-query";
import {
  getUserVoteByCommentIdQueryOptions,
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
  const { mutate: createVote, isPending: createVotePending } =
    useCreateVoteMutation();
  const { mutate: updateVote, isPending: updateVotePending } =
    useUpdateVoteMutation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const {
    data: userVote,
    isLoading: userVoteLoading,
    error: userVoteError,
  } = useQuery(
    getUserVoteByCommentIdQueryOptions(
      props.comment.commentId,
      (user && user.userId) || "",
    ),
  );

  function handleSubmitVote(
    e: React.MouseEvent<HTMLDivElement>,
    comment: Comment,
    value: number,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (createVotePending || updateVotePending) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (userVote && userVote.voted) {
      updateVote({ voteId: userVote.voteId!, value });
    } else {
      createVote({
        postId: comment.postId,
        commentId: comment.commentId,
        value,
      });
    }
  }

  return (
    <div>
      <div className="flex w-fit rounded-full py-1 justify-center">
        {user ? (
          userVoteLoading ? (
            <>Loading...</>
          ) : userVoteError ? (
            <>Error</>
          ) : userVote ? (
            userVote.value === 1 ? (
              <div
                onClick={(e) => handleSubmitVote(e, props.comment, 0)}
                className="pr-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {updateVotePending ? "..." : <PiArrowFatUpFill size={20} />}
              </div>
            ) : (
              <div
                onClick={(e) => handleSubmitVote(e, props.comment, 1)}
                className="pr-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {createVotePending ? "..." : <PiArrowFatUp size={20} />}
              </div>
            )
          ) : (
            <div
              onClick={(e) => handleSubmitVote(e, props.comment, 1)}
              className="pr-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              {createVotePending ? "..." : <PiArrowFatUp size={20} />}
            </div>
          )
        ) : (
          <div
            onClick={(e) => handleSubmitVote(e, props.comment, 1)}
            className="pr-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
          >
            <PiArrowFatUp size={20} />
          </div>
        )}

        <div className="">
          {props.comment.score ?? 0}
        </div>

        {user ? (
          userVoteLoading ? (
            <>Loading...</>
          ) : userVoteError ? (
            <>Error</>
          ) : userVote ? (
            userVote.value === -1 ? (
              <div
                onClick={(e) => handleSubmitVote(e, props.comment, 0)}
                className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {updateVotePending ? "..." : <PiArrowFatDownFill size={20} />}
              </div>
            ) : (
              <div
                onClick={(e) => handleSubmitVote(e, props.comment, -1)}
                className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {updateVotePending ? "..." : <PiArrowFatDown size={20} />}
              </div>
            )
          ) : (
            <div
              onClick={(e) => handleSubmitVote(e, props.comment, -1)}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              {createVotePending ? "..." : <PiArrowFatDown size={20} />}
            </div>
          )
        ) : (
          <div
            onClick={(e) => handleSubmitVote(e, props.comment, -1)}
            className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
          >
            <PiArrowFatDown size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
