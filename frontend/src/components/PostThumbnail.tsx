import { Link } from "@tanstack/react-router";
import { FaEllipsis } from "react-icons/fa6";
import { VotesComponent } from "./VotesComponent";
import { displayDate } from "../lib/utils";
import { PostWithUser } from "../lib/api/posts";

export function PostThumbnail(props: { post: PostWithUser }) {
  return (
    <Link
      to="/posts/$postId"
      params={{
        postId: props.post.postId.toString(),
      }}
      key={props.post.postId}
      className="mx-auto w-full lg:w-[50%] 2xl:w-[750px] border-t border-[#636363]"
    >
      <div className="relative my-1 rounded p-5 hover:bg-[#3e3e3e] transition-all ease-in-out duration-300">
        <div className="flex justify-between">
          <div className="flex text-[#bdbdbd] text-sm">
            <div className="font-bold">{props.post.username}</div>
            <div className="px-1">•</div>
            <div>{displayDate(props.post.createdAt)}</div>
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
        <div className="text-2xl font-bold">{props.post.title}</div>
        <div className="my-2">{props.post.content}</div>
        <VotesComponent post={props.post} />
      </div>
    </Link>
  );
}
