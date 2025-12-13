import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useCreatePostMutation } from "../lib/api/posts";
import useAuthStore from "../store/AuthStore";
import { useUploadImageMutation } from "../lib/api/images";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { mutate: uploadImage, isPending: uploadImagePending } =
    useUploadImageMutation();

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

  function handleImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function handleImageUpload(file: File) {
    if (uploadImagePending) return;
    uploadImage({
      postId: "",
      userId: (user && user.userId) || "",
      file: file,
    });
  }

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
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            handleImage(file);
            if (fileInputRef.current) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInputRef.current.files = dataTransfer.files;
            }
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
            {imagePreview ? (
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="text-center pt-[60px]">
                Drag and drop or upload images
              </div>
            )}
            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full py-2 opacity-0 cursor-pointer appearance-none file:hidden"
              accept="image/png, image/jpeg, image/heic, image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleImage(file);
              }}
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
