import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ArgumentTypes, client } from "./client";
import { getSession } from "./posts";

type CreateVoteArgs = ArgumentTypes<
  typeof client.api.v0.votes.$post
>[0]["json"];

type UpdateVoteArgs = ArgumentTypes<
  typeof client.api.v0.votes.update.$post
>[0]["json"];

async function createVote(args: CreateVoteArgs) {
  const token = getSession();
  const res = await client.api.v0.votes.$post(
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
      "There was an issue creating your vote :( We'll look into it ASAP!";
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
  if (!result.vote) {
    throw new Error("Invalid response from server");
  }
  return result.vote;
}

export const useCreateVoteMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["user-vote", data.postId, data.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["votes-summary", data.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["comment-votes-summary", data.commentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-comment-vote", data.commentId, data.userId],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function updateVote(args: UpdateVoteArgs) {
  const token = getSession();
  const res = await client.api.v0.votes.update.$post(
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
      "There was an issue updating your vote :( We'll look into it ASAP!";
    console.log(args);
    try {
    } catch (error) {
      console.log(error);
    }
    throw new Error(errorMessage);
  }
  const { vote } = await res.json();
  return vote;
}

export const useUpdateVoteMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["comment-votes-summary", data.commentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-comment-vote", data.commentId, data.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-vote", data.postId, data.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["votes-summary", data.postId],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getVotesSummaryByPostId(postId: number) {
  const res = await client.api.v0.votes.post.summary[":postId"].$get({
    param: { postId: postId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting votes by postId");
  }
  const votes = await res.json();
  return votes;
}

export const getVotesSummaryByPostIdQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ["votes-summary", postId],
    queryFn: () => getVotesSummaryByPostId(postId),
    staleTime: 30 * 1000,
  });

async function getUserVoteByPostId(postId: number, userId: string) {
  const res = await client.api.v0.votes.post.user[":postId"][":userId"].$get({
    param: { postId: postId.toString(), userId: userId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting user vote by postId");
  }
  const votes = await res.json();
  return votes;
}

export const getUserVoteByPostIdQueryOptions = (
  postId: number,
  userId: string,
) =>
  queryOptions({
    queryKey: ["user-vote", postId, userId],
    queryFn: () => getUserVoteByPostId(postId, userId),
    staleTime: 30 * 1000,
  });

async function getVotesSummaryByCommentId(commentId: number) {
  const res = await client.api.v0.votes.comment.summary[":commentId"].$get({
    param: { commentId: commentId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting comment vote summary");
  }
  return res.json();
}

export const getVotesSummaryByCommentIdQueryOptions = (commentId: number) =>
  queryOptions({
    queryKey: ["comment-votes-summary", commentId],
    queryFn: () => getVotesSummaryByCommentId(commentId),
  });

async function getUserVoteByCommentId(commentId: number, userId: string) {
  const res = await client.api.v0.votes.comment.user[":commentId"][
    ":userId"
  ].$get({
    param: { commentId: commentId.toString(), userId },
  });
  if (!res.ok) {
    throw new Error("Error getting user comment vote");
  }
  return res.json();
}

export const getUserVoteByCommentIdQueryOptions = (
  commentId: number,
  userId: string,
) =>
  queryOptions({
    queryKey: ["user-comment-vote", commentId, userId],
    queryFn: () => getUserVoteByCommentId(commentId, userId),
  });
