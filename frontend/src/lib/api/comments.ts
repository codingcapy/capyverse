import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Comment } from "../../../../schemas/comments";
import { ArgumentTypes, client, ExtractData } from "./client";

type CreateCommentArgs = ArgumentTypes<
  typeof client.api.v0.comments.$post
>[0]["json"];

type SerializeComment = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.comments.$get>>
>["comments"][number];

export function mapSerializedCommentToSchema(
  SerializedComment: SerializeComment
): Comment {
  return {
    ...SerializedComment,
    createdAt: new Date(SerializedComment.createdAt),
  };
}

async function createComment(args: CreateCommentArgs) {
  const res = await client.api.v0.comments.$post({ json: args });
  if (!res.ok) {
    let errorMessage =
      "There was an issue creating your comment :( We'll look into it ASAP!";
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
  return result;
}

export const useCreateCommentMutation = (
  onError?: (message: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getCommentsByPostId(postId: number) {
  const res = await client.api.v0.comments[":postId"].$get({
    param: { postId: postId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting comments by id");
  }
  const { comments } = await res.json();
  return comments.map(mapSerializedCommentToSchema);
}

export const getCommentsByPostIdQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostId(postId),
  });
