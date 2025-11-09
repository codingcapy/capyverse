import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCreatePostMutation } from "../lib/api/posts";
import useAuthStore from "../store/AuthStore";

export const Route = createFileRoute("/createpost")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const {
    mutate: createPost,
    isPending: createPostPending,
    error: createPostError,
  } = useCreatePostMutation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");

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

  return (
    <div className="pt-20 w-[300px] mx-auto">
      <div className="text-center font-bold text-cyan-500 text-2xl mb-10">
        Create Post
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col mx-auto">
        <input
          type="text"
          name="titleinput"
          id="title"
          required
          className="p-2 border border-[#c4c4c4] rounded bg-[#414141] my-2"
          placeholder="title"
        />
        <textarea
          name="content"
          id="content"
          required
          className="p-2 border border-[#c4c4c4] rounded bg-[#414141] my-2"
          placeholder="content"
        />
        <button className="bg-cyan-500 px-5 py-2 rounded-full font-bold my-5">
          {createPostPending ? "Loading..." : "POST"}
        </button>
      </form>
      <div>{notification}</div>
    </div>
  );
}
