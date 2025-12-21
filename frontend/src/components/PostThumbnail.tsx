import { Link } from "@tanstack/react-router";
import { FaEllipsis } from "react-icons/fa6";
import { VotesComponent } from "./VotesComponent";
import { displayDate } from "../lib/utils";
import { useDeletePostMutation } from "../lib/api/posts";
import { useState } from "react";
import useAuthStore from "../store/AuthStore";
import { Menu } from "./Menu";
import defaultProfile from "/capypaul01.jpg";
import { useQuery } from "@tanstack/react-query";
import { getUserByIdQueryOptions } from "../lib/api/users";
import { getCommentsByPostIdQueryOptions } from "../lib/api/comments";
import { IoChatbubbleOutline } from "react-icons/io5";
import { getImagesByPostIdQueryOptions } from "../lib/api/images";
import { Post } from "../../../schemas/posts";
import DOMPurify from "dompurify";

export function PostThumbnail(props: { post: Post }) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const { mutate: deletePost, isPending: deletePostPending } =
    useDeletePostMutation();
  const { user } = useAuthStore();
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
  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQuery(getImagesByPostIdQueryOptions(props.post.postId));

  return (
    <div className="mx-auto w-full md:w-[50%] 2xl:w-[750px] border-t border-[#636363]">
      <Link
        to="/posts/$postId"
        params={{
          postId: props.post.postId.toString(),
        }}
        key={props.post.postId}
      >
        <div className="relative my-1 rounded py-2 px-4 hover:bg-[#333333] transition-all ease-in-out duration-300">
          <div className="flex justify-between">
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
          <div className="text-xl md:text-2xl font-semibold">
            {props.post.title}
          </div>
          {imagesLoading ? (
            <div>Loading...</div>
          ) : imagesError ? (
            <div>Error loading images</div>
          ) : images ? (
            images.map((image, idx) => {
              if (idx < 1)
                return (
                  <div
                    key={image.imageId}
                    className="w-full h-[220px] sm:h-[300px] md:h-[400px] xl:h-[500px] border border-[#424242] bg-[#202020] rounded-xl my-2 flex items-center justify-center"
                  >
                    <img
                      src={`https://${image.imageUrl}`}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                );
            })
          ) : (
            <div>An unexpected error has occured</div>
          )}
          <div className="my-2">
            <div
              className="line-clamp-4"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(props.post.content, {
                  ALLOWED_TAGS: [
                    "b",
                    "i",
                    "u",
                    "s",
                    "strong",
                    "em",
                    "ul",
                    "ol",
                    "li",
                    "p",
                    "a",
                  ],
                  ALLOWED_ATTR: ["href", "target", "rel"],
                  FORBID_ATTR: ["style"],
                }),
              }}
            ></div>
          </div>
          <div className="flex">
            <VotesComponent post={props.post} />
            <div className="flex bg-[#3e3e3e] w-fit rounded-full py-1 justify-center ml-2 hover:text-cyan-500 transition-all ease-in-out duration-300">
              <div className="pl-3 pr-1">
                <IoChatbubbleOutline size={20} />
              </div>
              {commentsLoading ? (
                <div className="pr-3">Loading...</div>
              ) : commentsError ? (
                <div className="pr-3">Error fetching comments</div>
              ) : comments ? (
                <div className="pr-3 font-semibold">{comments.length}</div>
              ) : (
                <div className="pr-3">An unexpected error has occured</div>
              )}
            </div>
          </div>
          {showMenu && (
            <Menu
              post={props.post}
              setDeleteMode={setDeleteMode}
              setShowMenu={setShowMenu}
            />
          )}
        </div>
        {user && props.post.userId === user.userId && deleteMode && (
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
                  if (deletePostPending) return;
                  deletePost({ postId: props.post.postId });
                  setDeleteMode(false);
                }}
                className="p-2 mr-1 bg-red-500 rounded text-white bold secondary-font font-bold cursor-pointer"
              >
                {deletePostPending ? "Deleting..." : "DELETE"}
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
      {user && props.post.userId === user.userId && deleteMode && (
        <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
      )}
    </div>
  );
}
