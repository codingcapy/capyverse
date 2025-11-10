import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getPostsQueryOptions } from "../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import {
  getVotesQueryOptions,
  useCreateVoteMutation,
  useUpdateVoteMutation,
} from "../lib/api/votes";
import { PiArrowFatUp } from "react-icons/pi";
import { PiArrowFatDown } from "react-icons/pi";
import { PiArrowFatUpFill } from "react-icons/pi";
import { PiArrowFatDownFill } from "react-icons/pi";
import { FaEllipsis } from "react-icons/fa6";
import { displayDate } from "../lib/utils";
import useAuthStore from "../store/AuthStore";
import { Post } from "../../../schemas/posts";
import { Vote } from "../../../schemas/votes";

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
  const { mutate: createVote } = useCreateVoteMutation();
  const { mutate: updateVote } = useUpdateVoteMutation();
  const { user } = useAuthStore();
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
    <div className="flex-1 p-2">
      <div className="text-center text-cyan-500 text-2xl font-bold pt-20 pb-5">
        Index
      </div>
      <div className="flex flex-col">
        {postsError ? (
          <div className="mx-auto w-full lg:w-[50%]">Error fetching posts</div>
        ) : postsPending ? (
          <div className="mx-auto w-full lg:w-[50%]">Loading...</div>
        ) : (
          posts?.map((post) => (
            <Link
              to="/posts/$postId"
              params={{
                postId: post.postId.toString(),
              }}
              key={post.postId}
              className="mx-auto w-full lg:w-[50%] 2xl:w-[750px] border-t border-[#636363]"
            >
              <div className="relative my-1 rounded p-5 hover:bg-[#3e3e3e] transition-all ease-in-out duration-300">
                <div className="flex justify-between">
                  <div className="flex text-[#bdbdbd] text-sm">
                    <div className="font-bold">placeholder_username</div>
                    <div className="px-1">•</div>
                    <div>{displayDate(post.createdAt)}</div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log("clicked");
                    }}
                    className="absolute top-1 right-1 p-3 rounded-full hover:bg-[#575757] transition-all ease-in-out duration-300"
                  >
                    <FaEllipsis />
                  </div>
                </div>
                <div className="text-2xl font-bold">{post.title}</div>
                <div className="my-2">{post.content}</div>
                {votesError ? (
                  <div>Error fetching votes</div>
                ) : votesPending ? (
                  <div>Loading...</div>
                ) : (
                  <div className="flex bg-[#3e3e3e] w-fit rounded-full py-1 justify-center">
                    {votes.filter(
                      (vote) =>
                        vote.postId === post.postId &&
                        user &&
                        vote.userId === user.userId &&
                        vote.value === 1
                    ).length > 0 ? (
                      <div
                        onClick={() =>
                          updateVote({
                            voteId: votes.find(
                              (vote) =>
                                vote.postId === post.postId &&
                                user &&
                                vote.userId === user.userId &&
                                vote.value === 1
                            )!.voteId,
                            value: 0,
                          })
                        }
                        className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                      >
                        <PiArrowFatUpFill size={20} />
                      </div>
                    ) : (
                      <div
                        onClick={(e) => {
                          handleSubmitVote(e, post, 1);
                        }}
                        className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                      >
                        <PiArrowFatUp size={20} />
                      </div>
                    )}
                    <div className="">
                      {votes
                        .filter((vote) => vote.postId === post.postId)
                        .reduce((acc, vote) => acc + vote.value!, 0)}
                    </div>
                    {votes.filter(
                      (vote) =>
                        vote.postId === post.postId &&
                        user &&
                        vote.userId === user.userId &&
                        vote.value === -1
                    ).length > 0 ? (
                      <div
                        onClick={() =>
                          updateVote({
                            voteId: votes.find(
                              (vote) =>
                                vote.postId === post.postId &&
                                user &&
                                vote.userId === user.userId &&
                                vote.value === -1
                            )!.voteId,
                            value: 0,
                          })
                        }
                        className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                      >
                        <PiArrowFatDownFill size={20} />
                      </div>
                    ) : (
                      <div
                        onClick={(e) => {
                          handleSubmitVote(e, post, -1);
                        }}
                        className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                      >
                        <PiArrowFatDown size={20} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
