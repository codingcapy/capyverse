import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ArgumentTypes, client, ExtractData } from "./client";
import { Post } from "../../../../schemas/posts";

type CreatePostArgs = ArgumentTypes<
  typeof client.api.v0.posts.$post
>[0]["json"];

type SerializePost = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.posts.$get>>
>["posts"][number];

export function mapSerializedPostToSchema(SerializedPost: SerializePost): Post {
  return {
    ...SerializedPost,
    createdAt: new Date(SerializedPost.createdAt),
  };
}

async function createPost(args: CreatePostArgs) {
  const res = await client.api.v0.posts.$post({ json: args });
  if (!res.ok) {
    let errorMessage =
      "There was an issue creating your post :( We'll look into it ASAP!";
    try {
      const errorResponse = await res.json();
      if (
        errorResponse &&
        typeof errorResponse === "object" &&
        "message" in errorResponse
      ) {
        errorMessage = String(errorResponse.message);
      }
    } catch (error) {
      console.error("Failed to parse error response:", error);
    }
    throw new Error(errorMessage);
  }
  const result = await res.json();
  if (!result.postResult) {
    throw new Error("Invalid response from server");
  }
  return result.postResult;
}

export const useCreatePostMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getPosts() {
  const res = await client.api.v0.posts.$get();
  if (!res.ok) {
    throw new Error("Error getting posts");
  }
  const { posts } = await res.json();
  return posts.map(mapSerializedPostToSchema);
}

export const getPostsQueryOptions = () =>
  queryOptions({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

async function getPostById(postId: number) {
  const res = await client.api.v0.posts[":postId"].$get({
    param: { postId: postId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting post by id");
  }
  const { post } = await res.json();
  return mapSerializedPostToSchema(post);
}

export const getPostByIdQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ["posts", postId],
    queryFn: () => getPostById(postId),
  });
