import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { getPostByIdQueryOptions } from "../../lib/api/posts";
import { PiArrowFatUp } from "react-icons/pi";
import { PiArrowFatDown } from "react-icons/pi";

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

  return (
    <div className="p-20 mx-auto w-full lg:w-[50%]">
      <div className="text-4xl font-bold"> {post.title}</div>
      <div className="my-10">
        <div> {post.content}</div>
      </div>
      <div className="flex bg-[#3e3e3e] w-fit rounded-full py-1 justify-center">
        <div className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300">
          <PiArrowFatUp size={20} />
        </div>
        <div className="">0</div>
        <div className="px-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300">
          <PiArrowFatDown size={20} />
        </div>
      </div>
    </div>
  );
}
