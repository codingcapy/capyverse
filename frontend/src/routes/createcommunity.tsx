import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PostContentInput } from "../components/PostContentInput";
import useAuthStore from "../store/AuthStore";
import { useCreateCommunityMutation } from "../lib/api/communities";

export const Route = createFileRoute("/createcommunity")({
  component: CreateCommunityPage,
});

type Visibility = "public" | "restricted" | "private";

function CreateCommunityPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const { mutate: createCommunity, isPending: createCommunityPending } =
    useCreateCommunityMutation();
  const [matureContent, setMatureContent] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (createCommunityPending) return;
    createCommunity(
      {
        communityId: title,
        description: content,
        userId: (user && user.userId) || "",
        mature: matureContent,
        visibility,
      },
      { onSuccess: () => navigate({ to: `/c/${title}` }) }
    );
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
        <div className="p-2 border border-[#c4c4c4] rounded-xl my-2 flex">
          <div className="text-[#919191]">c/</div>
          <input
            type="text"
            name="titleinput"
            id="title"
            required
            value={title}
            onChange={(e) => {
              const noWhitespace = e.target.value.replace(/\s+/g, "");
              setTitle(noWhitespace);
            }}
            className="w-full outline-none"
            placeholder="Community name "
          />
        </div>
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
        <div className="my-2">
          <div className="text-xl mb-2 font-semibold">Visibility</div>
          <div
            onClick={() => setVisibility("public")}
            className={`p-2 cursor-pointer ${visibility === "public" && "bg-[#555555]"}`}
          >
            <div>Public</div>
            <div className="text-sm">
              Anyone can view, post and comment to this community
            </div>
          </div>
          <div
            onClick={() => setVisibility("restricted")}
            className={`p-2 cursor-pointer ${visibility === "restricted" && "bg-[#555555]"}`}
          >
            <div>Restricted</div>
            <div className="text-sm">
              Anyone can view, but only approved users can contribute
            </div>
          </div>
          <div
            onClick={() => setVisibility("private")}
            className={`p-2 cursor-pointer ${visibility === "private" && "bg-[#555555]"}`}
          >
            <div>Private</div>
            <div className="text-sm">
              Only approved users can view and contribute
            </div>
          </div>
        </div>
        <div className="my-3">
          <div>Mature (18+)</div>
          <div className="text-sm">
            Users must be over 18 to view and contribute
          </div>
          <div className="mt-2">
            <div
              className={`inline-flex items-center justify-center gap-0 mb-2 ${matureContent ? "bg-cyan-500" : "bg-[#666666]"} rounded-full shadow-[inset_-1px_0px_4.8px_rgba(0,0,0,0.5)]`}
            >
              <div
                className={`h-[25px] w-[25px] rounded-full font-bold text-lg tracking-wide transition-all duration-300 ease-in-out ${
                  !matureContent ? "bg-white" : "bg-transparent"
                }`}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                onClick={() => setMatureContent(false)}
              ></div>
              <div
                className={`h-[25px] w-[25px] rounded-full font-bold text-lg tracking-wide transition-all duration-300 ease-in-out ${
                  matureContent ? "bg-white" : "bg-transparent"
                }`}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                onClick={() => setMatureContent(true)}
              ></div>
            </div>
          </div>
        </div>
        <button className="bg-cyan-600 px-5 py-2 rounded-full font-bold my-5 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300">
          {createCommunityPending ? "Creating..." : "Create Community"}
        </button>
      </form>
      <div>{notification}</div>
    </div>
  );
}
