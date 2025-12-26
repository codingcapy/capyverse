import { useQuery } from "@tanstack/react-query";
import { Post } from "../../../schemas/posts";
import { getUserByIdQueryOptions } from "../lib/api/users";
import defaultProfile from "/capypaul01.jpg";
import { displayDate } from "../lib/utils";
import { Link } from "@tanstack/react-router";
import { getCommentsByPostIdQueryOptions } from "../lib/api/comments";

export function PostThumbnailSimple(props: { post: Post }) {
  const {
    data: poster,
    isLoading: posterLoading,
    error: posterError,
  } = useQuery(getUserByIdQueryOptions(props.post.userId));
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery(getCommentsByPostIdQueryOptions(props.post.postId));

  return (
    <div className="px-5 border-b border-[#222222] py-3">
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
      <Link
        to="/posts/$postId"
        params={{
          postId: props.post.postId.toString(),
        }}
        className="font-bold hover:underline"
      >
        <div className="my-2">{props.post.title}</div>
      </Link>
      {commentsLoading ? (
        <div className="pr-3">Loading...</div>
      ) : commentsError ? (
        <div className="pr-3">Error fetching comments</div>
      ) : comments ? (
        <div className="text-sm">{comments.length} comments</div>
      ) : (
        <div className="pr-3"></div>
      )}
    </div>
  );
}
