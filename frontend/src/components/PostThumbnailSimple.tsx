import { useQuery } from "@tanstack/react-query";
import { Post } from "../../../schemas/posts";
import { getUserByIdQueryOptions } from "../lib/api/users";
import defaultProfile from "/capypaul01.jpg";
import { displayDate } from "../lib/utils";
import { Link } from "@tanstack/react-router";
import { getCommentsLengthByPostIdQueryOptions } from "../lib/api/comments";
import { getVotesByPostIdQueryOptions } from "../lib/api/votes";
import { getCommunityByIdQueryOptions } from "../lib/api/communities";

export function PostThumbnailSimple(props: { post: Post }) {
  const {
    data: poster,
    isLoading: posterLoading,
    error: posterError,
  } = useQuery(getUserByIdQueryOptions(props.post.userId));
  const {
    data: commentsLength,
    isLoading: commentsLengthLoading,
    error: commentsLengthError,
  } = useQuery(getCommentsLengthByPostIdQueryOptions(props.post.postId));
  const {
    data: votes,
    isLoading: votesLoading,
    isError: votesError,
  } = useQuery(getVotesByPostIdQueryOptions(props.post.postId));
  const {
    data: community,
    isLoading: communityLoading,
    error: communityError,
  } = useQuery({
    ...getCommunityByIdQueryOptions(props.post.communityId!),
    enabled: !!props.post.communityId,
  });
  const isCommunity = !!props.post.communityId;

  return (
    <div className="px-5 border-b border-[#222222] py-3">
      {isCommunity ? (
        communityLoading ? (
          <div>Loading...</div>
        ) : communityError ? (
          <div>Error loading community</div>
        ) : community ? (
          <div className="flex text-[#bdbdbd] text-sm">
            <img
              src={
                !communityLoading || communityError
                  ? community
                    ? community.icon
                      ? community.icon
                      : defaultProfile
                    : defaultProfile
                  : defaultProfile
              }
              alt=""
              className="w-6 h-6 rounded-full"
            />
            <div className="font-bold ml-2">c/{community.communityId}</div>
            <div className="px-1">•</div>
            <div>{displayDate(props.post.createdAt)}</div>
          </div>
        ) : (
          <div className="flex text-[#bdbdbd] text-sm">
            <img
              src={
                !posterLoading || posterError
                  ? poster
                    ? poster.profilePic
                      ? poster.profilePic
                      : defaultProfile
                    : defaultProfile
                  : defaultProfile
              }
              alt=""
              className="w-6 h-6 rounded-full"
            />
            {posterLoading ? (
              <div>Loading...</div>
            ) : posterError ? (
              <div>Unknown author</div>
            ) : poster ? (
              <div className="font-bold ml-2">{poster.username}</div>
            ) : (
              <div>Unknown author</div>
            )}
            <div className="px-1">•</div>
            <div>{displayDate(props.post.createdAt)}</div>
          </div>
        )
      ) : (
        <div className="flex text-[#bdbdbd] text-sm">
          <img
            src={
              !posterLoading || posterError
                ? poster
                  ? poster.profilePic
                    ? poster.profilePic
                    : defaultProfile
                  : defaultProfile
                : defaultProfile
            }
            alt=""
            className="w-6 h-6 rounded-full"
          />
          {posterLoading ? (
            <div>Loading...</div>
          ) : posterError ? (
            <div>Unknown author</div>
          ) : poster ? (
            <div className="font-bold ml-2">{poster.username}</div>
          ) : (
            <div>Unknown author</div>
          )}
          <div className="px-1">•</div>
          <div>{displayDate(props.post.createdAt)}</div>
        </div>
      )}
      <Link
        to="/posts/$postId"
        params={{
          postId: props.post.postId.toString(),
        }}
        className="font-bold hover:underline"
      >
        <div className="my-2">{props.post.title}</div>
      </Link>
      <div className="flex">
        <div className="text-sm mr-2">
          {votesLoading
            ? "Loading..."
            : votesError
              ? "error"
              : votes !== undefined
                ? votes
                    .filter((vote) => vote.commentId === null)
                    .reduce((acc, vote) => acc + vote.value!, 0)
                : "error"}{" "}
          votes
        </div>
        <div className="text-sm">
          {commentsLengthLoading
            ? "Loading..."
            : commentsLengthError
              ? "error"
              : commentsLength}{" "}
          comments
        </div>
      </div>
    </div>
  );
}
