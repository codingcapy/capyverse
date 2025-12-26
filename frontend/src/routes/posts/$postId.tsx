import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import z from "zod";
import {
  getPostByIdQueryOptions,
  useDeletePostMutation,
  useUpdatePostMutation,
} from "../../lib/api/posts";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/AuthStore";
import { VotesComponent } from "../../components/VotesComponent";
import { useState } from "react";
import {
  getCommentsByPostIdQueryOptions,
  useCreateCommentMutation,
} from "../../lib/api/comments";
import { getUserByIdQueryOptions } from "../../lib/api/users";
import { displayDate } from "../../lib/utils";
import { CommentComponent } from "../../components/CommentComponent";
import { FaEllipsis } from "react-icons/fa6";
import { Menu } from "../../components/Menu";
import usePostStore from "../../store/PostStore";
import defaultProfile from "/capypaul01.jpg";
import { getImagesByPostIdQueryOptions } from "../../lib/api/images";
import { PiCaretRightBold } from "react-icons/pi";
import { PiCaretLeftBold } from "react-icons/pi";
import { Comment } from "../../../../schemas/comments";
import DOMPurify from "dompurify";
import { PostContentInput } from "../../components/PostContentInput";

export type CommentNode = Comment & {
  children: CommentNode[];
};

export const Route = createFileRoute("/posts/$postId")({
  beforeLoad: async ({ context, params }) => {
    const { postId: postIdParam } = params;
    try {
      const postId = z.coerce.number().int().parse(postIdParam);
      const postQuery = await context.queryClient.fetchQuery({
        ...getPostByIdQueryOptions(postId),
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes("404")) {
            return false;
          }
          if (error instanceof Error && error.message.includes("403")) {
            return false;
          }
          return failureCount < 1;
        },
      });
      return postQuery;
    } catch (e) {
      console.error(e, "redirect to dash on error");
      throw redirect({ to: "/" });
    }
  },
  component: PostComponent,
});

function PostComponent() {
  const post = Route.useRouteContext();
  const { user } = useAuthStore();
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery(getCommentsByPostIdQueryOptions(post.postId));
  const {
    data: author,
    isLoading: authorLoading,
    error: authorError,
  } = useQuery(getUserByIdQueryOptions(post.userId));
  const [commentContent, setCommentContent] = useState("");
  const { mutate: createComment, isPending: createCommentPending } =
    useCreateCommentMutation();
  const navigate = useNavigate();
  const [commentMode, setCommentMode] = useState(false);
  const commentTree = buildCommentTree((comments && comments) || [], {
    sort: "asc",
  });
  const [showMenu, setShowMenu] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const { mutate: deletePost, isPending: deletePostPending } =
    useDeletePostMutation();
  const { editPostModePointer, setEditPostModePointer } = usePostStore();
  const { mutate: updatePost, isPending: updatePostPending } =
    useUpdatePostMutation();
  const [editContent, setEditContent] = useState(post.content);
  const router = useRouter();
  const { data: poster, isLoading: posterLoading } = useQuery(
    getUserByIdQueryOptions(post.userId)
  );
  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQuery(getImagesByPostIdQueryOptions(post.postId));
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = images && images[activeImageIndex];
  const [notification, setNotification] = useState("");

  function buildCommentTree(
    comments: Comment[],
    opts?: { sort?: "asc" | "desc" }
  ): CommentNode[] {
    const sort = opts?.sort ?? "desc";
    const map = new Map<number, CommentNode>();
    for (const c of comments) {
      map.set(c.commentId, { ...c, children: [] });
    }
    const roots: CommentNode[] = [];
    for (const c of comments) {
      const node = map.get(c.commentId)!;
      if (c.parentCommentId == null) {
        roots.push(node);
        continue;
      }
      const parent = map.get(c.parentCommentId);
      if (!parent) {
        roots.push(node);
        continue;
      }
      parent.children.push(node);
    }
    const cmp = (a: CommentNode, b: CommentNode) =>
      sort === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    function sortRec(nodes: CommentNode[]) {
      nodes.sort(cmp);
      for (const n of nodes) {
        if (n.children.length) sortRec(n.children);
      }
    }
    sortRec(roots);
    return roots;
  }

  function handleCreateComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (createCommentPending) return;
    if (commentContent.length > 10000)
      return setNotification(
        "Comment content length max character limit is 10,000"
      );
    if (!user) return navigate({ to: "/login" });
    const userId = user.userId;
    createComment(
      { userId, postId: post.postId, content: commentContent },
      {
        onSuccess: () => {
          setCommentContent("");
          setCommentMode(false);
        },
      }
    );
  }

  return (
    <div className="pt-[88px] pb-[140px] px-2 md:px-0 mx-auto w-full md:w-[50%] 2xl:w-[40%]">
      <div className="relative flex justify-between">
        <div className="flex text-[#bdbdbd] text-sm">
          <img
            src={
              !posterLoading
                ? poster
                  ? poster.profilePic
                    ? poster.profilePic
                    : defaultProfile
                  : defaultProfile
                : defaultProfile
            }
            alt=""
            className="w-8 h-8 rounded-full"
          />
          {authorLoading ? (
            <div className="ml-2">Loading...</div>
          ) : authorError ? (
            <div>Error loading author</div>
          ) : author ? (
            <div className="font-bold ml-2">{author.username}</div>
          ) : (
            <div className="ml-2">unknown author</div>
          )}
          <div className="px-1">•</div>
          <div>{displayDate(post.createdAt)}</div>
        </div>
        <div className="">
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className=" absolute top-1 right-1 p-3 rounded-full hover:bg-[#575757] transition-all ease-in-out duration-300"
          >
            <FaEllipsis />
          </div>
        </div>
        {showMenu && (
          <Menu
            post={post}
            setDeleteMode={setDeleteMode}
            setShowMenu={setShowMenu}
          />
        )}
      </div>
      <div className="text-xl md:text-3xl font-semibold"> {post.title}</div>
      <div>
        {imagesError ? (
          <div className="w-full h-auto md:h-[400px] xl:h-[500px] border border-[#424242] bg-[#202020] rounded-xl my-2 flex items-center justify-center">
            Error loading images
          </div>
        ) : imagesLoading ? (
          <div className="w-full h-auto md:h-[400px] xl:h-[500px] border border-[#424242] bg-[#202020] rounded-xl my-2 flex items-center justify-center">
            Loading...
          </div>
        ) : images ? (
          images.length > 0 ? (
            <div className="relative w-full h-full flex items-center justify-center mt-1">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((i) =>
                      i === 0 ? images.length - 1 : i - 1
                    )
                  }
                  className="absolute left-2 z-10 bg-zinc-800/80 hover:bg-zinc-700 p-2 rounded-full"
                >
                  <PiCaretLeftBold />
                </button>
              )}
              {activeImage && (
                <div className="w-full h-[220px] sm:h-[300px] md:h-[400px] xl:h-[500px] border border-[#424242] bg-[#202020] rounded-xl my-2 flex items-center justify-center">
                  <img
                    src={`https://${images[activeImageIndex].imageUrl}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((i) =>
                      i === images.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute right-2 z-10 bg-zinc-800/80 hover:bg-zinc-700 p-2 rounded-full"
                >
                  <PiCaretRightBold />
                </button>
              )}
              <div className="absolute bottom-2 flex gap-1">
                {images.length > 1 &&
                  images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-2 h-2 rounded-full ${
                        i === activeImageIndex ? "bg-cyan-400" : "bg-zinc-500"
                      }`}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="mt-2 md:mt-5"></div>
          )
        ) : (
          <div className="mt-2 md:mt-5"></div>
        )}
      </div>
      {editPostModePointer === post.postId ? (
        <div>
          <PostContentInput
            content={editContent}
            onChange={(e) => setEditContent(e)}
            contentPlaceholder="Content (optional)"
          />
          <div className="flex justify-end">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setEditPostModePointer(0);
              }}
              className="cursor-pointer px-2 py-1 rounded-full bg-[#383838]"
            >
              Cancel
            </div>
            <button
              onClick={() => {
                if (updatePostPending) return;
                if (editContent.length > 10000)
                  return setNotification(
                    "Post content length max character limit is 10,000"
                  );
                updatePost(
                  {
                    postId: post.postId,
                    content: editContent,
                  },
                  {
                    onSuccess: () => {
                      router.invalidate();
                      setEditPostModePointer(0);
                    },
                  }
                );
              }}
              className="mx-2 px-2 py-1 rounded-full bg-cyan-700"
            >
              {updatePostPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content, {
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
      )}
      <VotesComponent post={post} />
      <form
        onClick={() => {
          if (!user) navigate({ to: "/login" });
          setCommentMode(true);
        }}
        onSubmit={handleCreateComment}
        className={`pl-5 py-2 my-5 ${commentMode ? "rounded-2xl" : "rounded-full"} border border-[#5c5c5c] w-full hover:bg-[#383838] hover:border-[#818181] transition-all ease-in-out duration-300`}
      >
        <input
          type="text"
          placeholder="Join the conversation"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          required
          className="outline-none w-full"
        />

        {commentMode && (
          <div className="flex justify-end">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setCommentMode(false);
              }}
              className="cursor-pointer px-2 py-1 rounded-full bg-[#383838]"
            >
              Cancel
            </div>
            <button
              disabled={createCommentPending}
              className="mx-2 px-2 py-1 rounded-full bg-red-500 cursor-pointer"
            >
              {createCommentPending ? "Submitting..." : "Comment"}
            </button>
          </div>
        )}
      </form>
      {user && post.userId === user.userId && deleteMode && (
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
                deletePost(
                  { postId: post.postId },
                  {
                    onSuccess: () => {
                      router.invalidate();
                      setDeleteMode(false);
                      setEditContent(
                        "[This post has been deleted by the user]"
                      );
                    },
                  }
                );
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
      {user && post.userId === user.userId && deleteMode && (
        <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
      )}
      {commentsError ? (
        <div>Error loading comments</div>
      ) : commentsLoading ? (
        <div>Loading...</div>
      ) : (
        commentTree.map((comment) => (
          <CommentComponent
            comment={comment}
            post={post}
            key={comment.commentId}
          />
        ))
      )}
    </div>
  );
}
