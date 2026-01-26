import { useQuery } from "@tanstack/react-query";
import {
  getUserVoteByPostIdQueryOptions,
  getVotesSummaryByPostIdQueryOptions,
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
  const { mutate: createVote, isPending: createVotePending } =
    useCreateVoteMutation();
  const { mutate: updateVote, isPending: updateVotePending } =
    useUpdateVoteMutation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    data: votesSummary,
    isLoading: votesSummaryLoading,
    error: votesSummaryError,
  } = useQuery(getVotesSummaryByPostIdQueryOptions(props.post.postId));
  const {
    data: userVote,
    isLoading: userVoteLoading,
    error: userVoteError,
  } = useQuery(
    getUserVoteByPostIdQueryOptions(
      props.post.postId,
      (user && user.userId) || "",
    ),
  );

  function handleSubmitVote(
    e: React.MouseEvent<HTMLDivElement>,
    post: Post,
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
      updateVote({ voteId: userVote.voteId, value });
    } else if (user) {
      createVote({
        postId: post.postId,
        value,
      });
    } else {
      navigate({ to: "/login" });
    }
  }

  return (
    <div>
      <div className="flex bg-[#3e3e3e] w-fit rounded-full py-1 justify-center">
        {user ? (
          userVoteLoading ? (
            <>Loading...</>
          ) : userVoteError ? (
            <>Error loading user vote</>
          ) : userVote ? (
            userVote.value === 1 ? (
              <div
                onClick={(e) => {
                  handleSubmitVote(e, props.post, 0);
                }}
                className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {updateVotePending ? (
                  "Updating..."
                ) : (
                  <PiArrowFatUpFill size={20} />
                )}
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
            )
          ) : (
            <div
              onClick={(e) => {
                handleSubmitVote(e, props.post, 1);
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              {createVotePending ? "Voting..." : <PiArrowFatUp size={20} />}
            </div>
          )
        ) : (
          <div
            onClick={(e) => {
              handleSubmitVote(e, props.post, 1);
            }}
            className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
          >
            {createVotePending ? "Voting..." : <PiArrowFatUp size={20} />}
          </div>
        )}
        <div className="font-semibold">
          {votesSummaryLoading ? (
            <div>Loading...</div>
          ) : votesSummaryError ? (
            <div>Error loading votes</div>
          ) : votesSummary ? (
            votesSummary.score
          ) : (
            0
          )}
        </div>
        {user ? (
          userVoteLoading ? (
            <>Loading...</>
          ) : userVoteError ? (
            <>Error loading user vote</>
          ) : userVote ? (
            userVote.value === -1 ? (
              <div
                onClick={(e) => {
                  handleSubmitVote(e, props.post, 0);
                }}
                className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {updateVotePending ? (
                  "Updating..."
                ) : (
                  <PiArrowFatDownFill size={20} />
                )}
              </div>
            ) : userVote.value === 0 ? (
              <div
                onClick={(e) => {
                  handleSubmitVote(e, props.post, -1);
                }}
                className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {updateVotePending ? (
                  "Updating..."
                ) : (
                  <PiArrowFatDown size={20} />
                )}
              </div>
            ) : (
              <div
                onClick={(e) => {
                  handleSubmitVote(e, props.post, -1);
                }}
                className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                {updateVotePending ? (
                  "Updating..."
                ) : (
                  <PiArrowFatDown size={20} />
                )}
              </div>
            )
          ) : (
            <div
              onClick={(e) => {
                handleSubmitVote(e, props.post, -1);
              }}
              className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              {createVotePending ? "Voting..." : <PiArrowFatDown size={20} />}
            </div>
          )
        ) : (
          <div
            onClick={(e) => {
              handleSubmitVote(e, props.post, -1);
            }}
            className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
          >
            {createVotePending ? "Voting..." : <PiArrowFatDown size={20} />}
          </div>
        )}
      </div>
    </div>
  );
}
