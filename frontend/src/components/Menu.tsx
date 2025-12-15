import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import useAuthStore from "../store/AuthStore";
import { FiEdit2 } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa";
import { Post } from "../../../schemas/posts";
import usePostStore from "../store/PostStore";
import { useNavigate } from "@tanstack/react-router";
import {
  getSavedPostsByUserIdQueryOptions,
  useSavePostMutation,
  useUnsavePostMutation,
} from "../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import { FaBookmark } from "react-icons/fa";

export function Menu(props: {
  post: Post;
  setDeleteMode: Dispatch<SetStateAction<boolean>>;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthStore();
  const { setEditPostModePointer } = usePostStore();
  const navigate = useNavigate();
  const { mutate: savePost, isPending: savePostPending } =
    useSavePostMutation();
  const { data: savedPosts } = useQuery(
    getSavedPostsByUserIdQueryOptions((user && user.userId) || "")
  );
  const isSaved = !!savedPosts?.some(
    (savedPost) => savedPost.postId === props.post.postId
  );
  const { mutate: unsavePost, isPending: unsavePostPending } =
    useUnsavePostMutation();

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
      {user && props.post.userId === user.userId && (
        <div className="flex py-2 hover:text-[#ffffff] cursor-pointer">
          <FiEdit2 size={20} className="pt-1" />
          <div
            onClick={() => {
              setEditPostModePointer(props.post.postId);
              navigate({ to: `/posts/${props.post.postId}` });
              props.setShowMenu(false);
            }}
            className="ml-2"
          >
            Edit
          </div>
        </div>
      )}
      {isSaved ? (
        <div className="flex py-2 hover:text-[#ffffff] cursor-pointer">
          <FaBookmark size={20} className="pt-1" />
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (!user) return navigate({ to: "/login" });
              unsavePost(
                { userId: user.userId || "", postId: props.post.postId },
                { onSuccess: () => props.setShowMenu(false) }
              );
            }}
            className="ml-2"
          >
            Remove from saved
          </div>
        </div>
      ) : (
        <div className="flex py-2 hover:text-[#ffffff] cursor-pointer">
          <FaRegBookmark size={20} className="pt-1" />
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (!user) return navigate({ to: "/login" });
              savePost(
                { userId: user.userId || "", postId: props.post.postId },
                { onSuccess: () => props.setShowMenu(false) }
              );
            }}
            className="ml-2"
          >
            Save
          </div>
        </div>
      )}

      {user && props.post.userId === user.userId && (
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
