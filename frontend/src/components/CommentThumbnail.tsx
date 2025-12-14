import { Link } from "@tanstack/react-router";
import useAuthStore from "../store/AuthStore";
import defaultProfile from "/capypaul01.jpg";
import { displayDate } from "../lib/utils";
import { FaEllipsis } from "react-icons/fa6";
import { CommentVotesComponent } from "./CommentVotesComponent";
import { useState } from "react";
import { CommentMenu } from "./CommentMenu";

export function CommentThumbnail(props: {
  comment: {
    createdAt: Date;
    commentId: number;
    userId: string;
    postId: number;
    parentCommentId: number | null;
    level: number;
    content: string | null;
    status: string;
    username: string | null;
  };
}) {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  return (
    <div
      key={props.comment.commentId}
      className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]"
    >
      <Link
        to="/posts/$postId"
        params={{
          postId: props.comment.postId.toString(),
        }}
        key={props.comment.postId}
      >
        <div className="relative my-1 rounded py-2 px-4 hover:bg-[#333333] transition-all ease-in-out duration-300">
          <div className="flex justify-between">
            <div className="flex text-[#bdbdbd] text-sm">
              <img
                src={
                  user
                    ? user.profilePic
                      ? user.profilePic
                      : defaultProfile
                    : defaultProfile
                }
                alt=""
                className="w-6 h-6 rounded-full"
              />
              <div className="font-bold ml-2">{user && user.username}</div>
              <div className="px-1">•</div>
              <div>{displayDate(props.comment.createdAt)}</div>
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
          <div>{props.comment.content}</div>
          <CommentVotesComponent comment={props.comment} />
          {showMenu && (
            <CommentMenu
              comment={props.comment}
              setDeleteMode={setDeleteMode}
              setShowMenu={setShowMenu}
              setCommentContent={setCommentContent}
            />
          )}
        </div>
      </Link>
    </div>
  );
}
