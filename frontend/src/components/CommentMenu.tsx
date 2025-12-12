import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import useAuthStore from "../store/AuthStore";
import { FiEdit2 } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa";
import usePostStore from "../store/PostStore";
import { useNavigate } from "@tanstack/react-router";
import { Comment } from "../../../schemas/comments";

export function CommentMenu(props: {
  comment: Comment;
  setDeleteMode: Dispatch<SetStateAction<boolean>>;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
  setCommentContent: Dispatch<SetStateAction<string>>;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthStore();
  const { setEditCommentModePointer } = usePostStore();
  const navigate = useNavigate();

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      props.setShowMenu(false);
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      className="absolute top-12 right-2 py-2 px-5 rounded bg-[#222222] shadow-[0_0_15px_rgba(0,0,0,0.7)] z-40"
    >
      {user && props.comment.userId === user.userId && (
        <div className="flex py-2 hover:text-[#ffffff] cursor-pointer">
          <FiEdit2 size={20} className="pt-1" />
          <div
            onClick={() => {
              setEditCommentModePointer(props.comment.commentId);
              props.setCommentContent(props.comment.content || "");
              props.setShowMenu(false);
            }}
            className="ml-2"
          >
            Edit
          </div>
        </div>
      )}
      <div className="flex py-2 hover:text-[#ffffff] cursor-pointer">
        <FaRegBookmark size={20} className="pt-1" />
        <div className="ml-2">Save</div>
      </div>
      {user && props.comment.userId === user.userId && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            props.setDeleteMode(true);
            props.setShowMenu(false);
          }}
          className="flex py-2 hover:text-[#ffffff] cursor-pointer"
        >
          <FaRegTrashAlt size={20} className="pt-1 " />
          <div className="ml-2">Delete</div>
        </div>
      )}
    </div>
  );
}
