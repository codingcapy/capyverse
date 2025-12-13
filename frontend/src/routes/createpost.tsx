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
  const [imageUploadNotification, setImageUploadNotification] = useState("");
  const { mutate: deleteImage } = useDeleteImageMutation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = imagesByUser && imagesByUser[activeImageIndex];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return "Error: no logged in user";
    const titleInput = (e.target as HTMLFormElement).titleinput.value;
    const content = (e.target as HTMLFormElement).content.value;
    createPost(
      { userId: user.userId || "", title: titleInput, content },
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
    if (!user) navigate({ to: "/" });
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="pt-20 w-[80%] lg:w-[50%] 2xl:w-[30%] mx-auto">
      <div className="text-center font-bold text-cyan-500 text-2xl mb-10">
        Create Post
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col mx-auto ">
        <input
          type="text"
          name="titleinput"
          id="title"
          required
          className="p-2 border border-[#c4c4c4] rounded-xl bg-[#414141] my-2"
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
          }`}
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
        <textarea
          name="content"
          id="content"
          className="p-2 border border-[#c4c4c4] rounded-xl bg-[#414141] my-2 h-[200px]"
          placeholder="Content (optional)"
        />
        <button className="bg-cyan-500 px-5 py-2 rounded-full font-bold my-5">
          {createPostPending ? "Loading..." : "POST"}
        </button>
      </form>
      <div>{notification}</div>
    </div>
  );
}
