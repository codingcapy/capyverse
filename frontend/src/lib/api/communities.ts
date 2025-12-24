import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Community } from "../../../../schemas/communities";
import { ArgumentTypes, client, ExtractData } from "./client";

type CreateCommunityArgs = ArgumentTypes<
  typeof client.api.v0.communities.$post
>[0]["json"];

type SerializeCommunity = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.communities.$get>>
>["communities"][number];

export function mapSerializedCommunityToSchema(
  serialized: SerializeCommunity
): Community {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
  };
}

async function createCommunity(args: CreateCommunityArgs) {
  const res = await client.api.v0.communities.$post({ json: args });
  if (!res.ok) {
    let errorMessage =
      "There was an issue creating your community :( We'll look into it ASAP!";
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
  if (!result.communityResult) {
    throw new Error("Invalid response from server");
  }
  return result.communityResult;
}

export const useCreateCommunityMutation = (
  onError?: (message: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommunity,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commmunities"] });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getCommunities() {
  const res = await client.api.v0.communities.$get();
  if (!res.ok) {
    throw new Error("Error getting communities");
  }
  const { communities } = await res.json();
  return communities.map(mapSerializedCommunityToSchema);
}

export const getCommunitiesQueryOptions = () =>
  queryOptions({
    queryKey: ["communities"],
    queryFn: () => getCommunities(),
  });
