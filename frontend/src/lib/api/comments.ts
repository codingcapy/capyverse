import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ArgumentTypes, client, ExtractData } from "./client";
import { getSession } from "./posts";

type CreateCommentArgs = ArgumentTypes<
  typeof client.api.v0.comments.$post
>[0]["json"];

type DeleteCommentArgs = ArgumentTypes<
  typeof client.api.v0.comments.comment.delete.$post
>[0]["json"];

type UpdateCommentArgs = ArgumentTypes<
  typeof client.api.v0.comments.comment.update.$post
>[0]["json"];

export type SerializeComment = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.comments.$get>>
>["comments"][number];

export function mapSerializedCommentToSchema(
  SerializedComment: SerializeComment,
) {
  return {
    ...SerializedComment,
    createdAt: new Date(SerializedComment.createdAt),
  };
}

async function createComment(args: CreateCommentArgs) {
  const token = getSession();
  const res = await client.api.v0.comments.$post(
    { json: args },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );
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
  onError?: (message: string) => void,
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
  const token = getSession();
  const res = await client.api.v0.comments[":postId"].$get(
    {
      param: { postId: postId.toString() },
    },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );
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

async function deleteComment(args: DeleteCommentArgs) {
  const token = getSession();
  const res = await client.api.v0.comments.comment.delete.$post(
    { json: args },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );
  if (!res.ok) {
    let errorMessage =
      "There was an issue deleting your post :( We'll look into it ASAP!";
    console.log(args);
    try {
    } catch (error) {
      console.log(error);
    }
    throw new Error(errorMessage);
  }
  const result = await res.json();
  return result;
}

export const useDeleteCommentMutation = (
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSettled: (_data, _error) => {
      if (!_data) return console.log("No data, returning");
      queryClient.invalidateQueries({
        queryKey: ["comments", _data.commentResult.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function updateComment(args: UpdateCommentArgs) {
  const token = getSession();
  const res = await client.api.v0.comments.comment.update.$post(
    { json: args },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );
  if (!res.ok) {
    let errorMessage =
      "There was an issue updating your post :( We'll look into it ASAP!";
    console.log(args);
    try {
    } catch (error) {
      console.log(error);
    }
    throw new Error(errorMessage);
  }
  const result = await res.json();
  return result;
}

export const useUpdateCommentMutation = (
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateComment,
    onSettled: (_data, _error) => {
      if (!_data) return console.log("No data, returning");
      queryClient.invalidateQueries({
        queryKey: ["comments", _data.commentResult.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getCommentsByUserProfile() {
  const token = getSession();
  const res = await client.api.v0.comments.user.profile.$get(
    {},
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );

  if (!res.ok) {
    throw new Error("Error getting comments by user profile");
  }
  const { comments } = await res.json();
  return comments.map(mapSerializedCommentToSchema);
}

export const getCommentsByUserProfileQueryOptions = () =>
  queryOptions({
    queryKey: ["profile-comments"],
    queryFn: () => getCommentsByUserProfile(),
  });

async function getCommentsLengthByPostId(postId: number) {
  const res = await client.api.v0.comments.post.count[":postId"].$get({
    param: { postId: postId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting comments by id");
  }
  const { commentsLength } = await res.json();
  return commentsLength;
}

export const getCommentsLengthByPostIdQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ["comments-length", postId],
    queryFn: () => getCommentsLengthByPostId(postId),
  });

async function getCommentsByUsername(username: string) {
  const res = await client.api.v0.comments.user.comments[":username"].$get({
    param: { username: username.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting comments by username");
  }
  const { comments } = await res.json();
  return comments.map(mapSerializedCommentToSchema);
}

export const getCommentsByUsernameQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["user-comments", username],
    queryFn: () => getCommentsByUsername(username),
  });
