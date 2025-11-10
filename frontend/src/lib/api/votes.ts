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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["votes"] });
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
  const result = await res.json();
  return result;
}

export const useUpdateVoteMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVote,
    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({
        queryKey: ["votes"],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};
