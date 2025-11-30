import { Link } from "@tanstack/react-router";
import { FaEllipsis } from "react-icons/fa6";
import { VotesComponent } from "./VotesComponent";
import { displayDate } from "../lib/utils";
import { PostWithUser } from "../lib/api/posts";
import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";

export function PostThumbnail(props: { post: PostWithUser }) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  return (
    <Link
      to="/posts/$postId"
      params={{
        postId: props.post.postId.toString(),
      }}
      key={props.post.postId}
      className="mx-auto w-full lg:w-[50%] 2xl:w-[750px] border-t border-[#636363]"
    >
      <div className="relative my-1 rounded p-5 hover:bg-[#333333] transition-all ease-in-out duration-300">
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
              setShowMenu(!showMenu);
            }}
            className="absolute top-1 right-1 p-3 rounded-full hover:bg-[#575757] transition-all ease-in-out duration-300"
          >
            <FaEllipsis />
          </div>
        </div>
        <div className="text-2xl font-bold">{props.post.title}</div>
        <div className="my-2">{props.post.content}</div>
        <VotesComponent post={props.post} />
        {showMenu && (
          <div className="absolute top-10 right-2 py-2 px-5 rounded shadow-[0_0_15px_rgba(0,0,0,0.7)] ">
            <div className="flex py-2 hover:text-[#ffffff]">
              <FiEdit2 size={20} className="pt-1" />
              <div className="ml-2">Edit</div>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setDeleteMode(true);
              }}
              className="flex py-2 hover:text-[#ffffff]"
            >
              <FaRegTrashAlt size={20} className="pt-1 " />
              <div className="ml-2">Delete</div>
            </div>
          </div>
        )}
      </div>
      {deleteMode && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#222222] p-6 rounded shadow-lg w-[90%] max-w-md text-center z-100`}
        >
          <div className="text-2xl font-bold">Delete Post?</div>
          <div className="my-5">
            Once you delete this post, it can’t be restored.
          </div>
          <div className="my-5 flex justify-end">
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="p-2 mr-1 bg-red-500 rounded text-white bold secondary-font font-bold cursor-pointer"
            >
              DELETE
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setDeleteMode(false);
              }}
              className="p-2 ml-1 bg-[#5c5c5c] rounded bold secondary-font font-bold cursor-pointer"
            >
              CANCEL
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
