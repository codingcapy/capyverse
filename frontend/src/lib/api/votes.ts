import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Vote } from "../../../../schemas/votes";
import { ArgumentTypes, client, ExtractData } from "./client";

type CreateVoteArgs = ArgumentTypes<
  typeof client.api.v0.votes.$post
>[0]["json"];

type UpdateVoteArgs = ArgumentTypes<
  typeof client.api.v0.votes.update.$post
>[0]["json"];

type SerializeVote = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.votes.$get>>
>["votes"][number];

export function mapSerializedVoteToSchema(SerializedVote: SerializeVote): Vote {
  return {
    ...SerializedVote,
    createdAt: new Date(SerializedVote.createdAt),
  };
}

async function createVote(args: CreateVoteArgs) {
  const res = await client.api.v0.votes.$post({ json: args });
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
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getVotes() {
  const res = await client.api.v0.votes.$get();
  if (!res.ok) {
    throw new Error("Error getting posts");
  }
  const { votes } = await res.json();
  return votes.map(mapSerializedVoteToSchema);
}

export const getVotesQueryOptions = () =>
  queryOptions({
    queryKey: ["votes"],
    queryFn: () => getVotes(),
  });

async function getVotesByPostId(postId: number) {
  const res = await client.api.v0.votes[":postId"].$get({
    param: { postId: postId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting votes by postId");
  }
  const { votes } = await res.json();
  return votes;
}

export const getVotesByPostIdQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ["post-votes", postId],
    queryFn: () => getVotesByPostId(postId),
  });

async function updateVote(args: UpdateVoteArgs) {
  const res = await client.api.v0.votes.update.$post({ json: args });
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
      console.log(data);
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

async function getVotesByCommentId(commentId: number) {
  const res = await client.api.v0.votes.comments[":commentId"].$get({
    param: { commentId: commentId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting comment votes by commentId");
  }
  const { votes } = await res.json();
  return votes;
}

export const getVotesByCommentIdQueryOptions = (commentId: number) =>
  queryOptions({
    queryKey: ["comment-votes", commentId],
    queryFn: () => getVotesByCommentId(commentId),
  });

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
  userId: string
) =>
  queryOptions({
    queryKey: ["user-vote", postId, userId],
    queryFn: () => getUserVoteByPostId(postId, userId),
  });
