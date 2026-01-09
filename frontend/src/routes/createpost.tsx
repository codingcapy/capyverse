import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useCreatePostMutation } from "../lib/api/posts";
import useAuthStore from "../store/AuthStore";
import {
  getImagesByUserIdQueryOptions,
  useDeleteImageMutation,
  useUploadImageMutation,
} from "../lib/api/images";
import { useQuery } from "@tanstack/react-query";
import { FaTrashCan } from "react-icons/fa6";
import { PostContentInput } from "../components/PostContentInput";
import { getCommunitiesByUserIdQueryOptions } from "../lib/api/communities";
import { PiCaretDown } from "react-icons/pi";

export const Route = createFileRoute("/createpost")({
  component: CreatePostPage,
});

function CreatePostPage() {
  const { user } = useAuthStore();
  const {
    mutate: createPost,
    isPending: createPostPending,
    error: createPostError,
  } = useCreatePostMutation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { mutate: uploadImage, isPending: uploadImagePending } =
    useUploadImageMutation();
  const {
    data: imagesByUser,
    isLoading: imagesByUserLoading,
    error: imagesByUserError,
  } = useQuery(getImagesByUserIdQueryOptions((user && user.userId) || ""));
  const { mutate: deleteImage } = useDeleteImageMutation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = imagesByUser && imagesByUser[activeImageIndex];
  const [content, setContent] = useState("");
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useQuery(getCommunitiesByUserIdQueryOptions((user && user.userId) || ""));
  const [showCommunities, setShowCommunities] = useState(false);
  const [community, setCommunity] = useState("Select a community");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return "Error: no logged in user";
    if (content.length > 10000)
      return setNotification(
        "Post content length max character limit is 10,000"
      );
    const titleInput = (e.target as HTMLFormElement).titleinput.value;
    if (titleInput.length > 400)
      return setNotification("Title content length max character limit is 400");
    createPost(
      {
        userId: user.userId || "",
        title: titleInput,
        content,
        communityId: community === "Select a community" ? "" : community,
      },
      {
        onSuccess: () => navigate({ to: "/" }),
        onError: (e) => setNotification(e.toString()),
      }
    );
    if (createPostError) setNotification(createPostError.toString());
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (uploadImagePending) return;
    const file = event.target.files?.[0];
    if (!file) return;
    uploadImage({
      postId: "",
      userId: (user && user.userId) || "",
      file: file,
    });
    event.target.value = "";
  }

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => console.log(communities), [communities]);

  return (
    <div className="pt-20 w-[80%] lg:w-[50%] 2xl:w-[30%] mx-auto">
      <div className="text-center font-bold text-cyan-500 text-2xl mb-5">
        Create Post
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col mx-auto ">
        <div className="relative w-fit">
          <div
            onClick={() => setShowCommunities(!showCommunities)}
            className="cursor-pointer rounded-full px-5 py-3 bg-[#333333] w-[207px] flex mb-5 justify-between"
          >
            <div
              className={`mr-2 ${community === "Select a community" ? "" : "font-bold"}`}
            >
              {community === "Select a community"
                ? community
                : `c/${community}`}
            </div>
            <div className="pt-0.5">
              <PiCaretDown size={20} />
            </div>
          </div>
          {showCommunities && (
            <div className="absolute top-14 right-2 bg-[#333333] py-1 min-h-[50px] min-w-[190px] rounded-lg">
              {communitiesLoading ? (
                <div>Loading...</div>
              ) : communitiesError ? (
                <div>Error loading communities</div>
              ) : communities ? (
                communities.length > 0 ? (
                  communities.map((c) => (
                    <div
                      onClick={() => {
                        setCommunity(c.communityId);
                        setShowCommunities(false);
                      }}
                      className="px-3 py-2 cursor-pointer font-bold hover:text-cyan-500 transition-all ease-in-out duration-300 z-50"
                      key={c.communityId}
                    >
                      c/{c.communityId}
                    </div>
                  ))
                ) : (
                  <div className="my-3 p-2 "></div>
                )
              ) : (
                <div className="my-3 p-2 "></div>
              )}
            </div>
          )}
        </div>
        <input
          type="text"
          name="titleinput"
          id="title"
          required
          className="p-2 border border-[#c4c4c4] rounded-xl my-2"
          placeholder="Title"
        />
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (uploadImagePending) return;
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            uploadImage({
              postId: "",
              userId: (user && user.userId) || "",
              file: file,
            });
          }}
          className={`my-5 border border-dashed w-full h-[150px] rounded-xl ${
            isDragOver ? "bg-[#242424]" : ""
          }
          ${showCommunities ? "pointer-events-none" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/heic, image/webp"
          />
          <div className="relative w-full h-full">
            {imagesByUserError ? (
              <div>Error loading images</div>
            ) : imagesByUserLoading ? (
              <div>Loading...</div>
            ) : imagesByUser ? (
              imagesByUser.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {imagesByUser.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((i) =>
                          i === 0 ? imagesByUser.length - 1 : i - 1
                        )
                      }
                      className="absolute left-2 z-10 bg-zinc-800/80 hover:bg-zinc-700 p-2 rounded-full"
                    >
                      ‹
                    </button>
                  )}
                  {activeImage && (
                    <div className="relative">
                      <FaTrashCan
                        size={20}
                        className="text-red-400 absolute top-2 right-2 bg-zinc-700 p-[4px] rounded z-10 cursor-pointer"
                        onClick={() =>
                          deleteImage({
                            imageId: imagesByUser[activeImageIndex].imageId,
                          })
                        }
                      />
                      <img
                        src={`https://${imagesByUser[activeImageIndex].imageUrl}`}
                        className="max-h-[140px] mx-auto rounded-lg bg-[#3d3d3d] object-contain"
                      />
                    </div>
                  )}
                  {imagesByUser.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((i) =>
                          i === imagesByUser.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute right-2 z-10 bg-zinc-800/80 hover:bg-zinc-700 p-2 rounded-full"
                    >
                      ›
                    </button>
                  )}
                  <div className="absolute bottom-2 flex gap-1">
                    {imagesByUser.map((_, i) => (
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
                <div className="text-center pt-[60px]">
                  Drag and drop or upload images
                </div>
              )
            ) : (
              <div className="text-center pt-[60px]">
                Drag and drop or upload images
              </div>
            )}

            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full py-2 opacity-0 cursor-pointer appearance-none file:hidden"
              accept="image/png, image/jpeg, image/heic, image/webp"
              onChange={handleImageUpload}
            />
          </div>
        </div>
        <PostContentInput
          content={content}
          onChange={(e) => setContent(e)}
          contentPlaceholder="Content (optional)"
        />
        <button className="bg-cyan-600 px-5 py-2 rounded-full font-bold my-5 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300">
          {createPostPending ? "Posting..." : "POST"}
        </button>
      </form>
      <div>{notification}</div>
    </div>
  );
}
