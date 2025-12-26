import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PostContentInput } from "../components/PostContentInput";
import useAuthStore from "../store/AuthStore";

export const Route = createFileRoute("/createcommunity")({
  component: CreateCommunityPage,
});

function CreateCommunityPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user]);

  return (
    <div className="pt-20 w-[80%] lg:w-[50%] 2xl:w-[30%] mx-auto">
      <div className="text-center font-bold text-cyan-500 text-2xl mb-5">
        Create Community
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col mx-auto ">
        <input
          type="text"
          name="titleinput"
          id="title"
          required
          className="p-2 border border-[#c4c4c4] rounded-xl my-2"
          placeholder="Community name "
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
            <div className="text-center pt-[60px]">
              Drag and drop or upload community icon
            </div>
            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full py-2 opacity-0 cursor-pointer appearance-none file:hidden"
              accept="image/png, image/jpeg, image/heic, image/webp"
            />
          </div>
        </div>
        <PostContentInput
          content={content}
          onChange={(e) => setContent(e)}
          contentPlaceholder="Description"
        />
        <button className="bg-cyan-600 px-5 py-2 rounded-full font-bold my-5 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300">
          Create Community
        </button>
      </form>
      <div>{notification}</div>
    </div>
  );
}
