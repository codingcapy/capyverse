import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Community } from "../../../../schemas/communities";
import { ArgumentTypes, client, ExtractData } from "./client";
import { getSession } from "./posts";

type CreateCommunityArgs = ArgumentTypes<
  typeof client.api.v0.communities.$post
>[0]["json"];

type JoinCommunityArgs = ArgumentTypes<
  typeof client.api.v0.communities.join.$post
>[0]["json"];

type LeaveCommunityArgs = ArgumentTypes<
  typeof client.api.v0.communities.leave.$post
>[0]["json"];

type SerializeCommunity = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.communities.$get>>
>["communities"][number];

type UpdateIconArgs = ArgumentTypes<
  typeof client.api.v0.communities.update.icon.$post
>[0]["json"];

type UpdateDescriptionArgs = ArgumentTypes<
  typeof client.api.v0.communities.update.description.$post
>[0]["json"];

export function mapSerializedCommunityToSchema(
  serialized: SerializeCommunity,
): Community {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
  };
}

async function createCommunity(args: CreateCommunityArgs) {
  const token = getSession();
  const res = await client.api.v0.communities.$post(
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
  onError?: (message: string) => void,
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

async function getCommunityById(communityId: string) {
  const res = await client.api.v0.communities[":communityId"].$get({
    param: { communityId: communityId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting community by id");
  }
  const { community } = await res.json();
  return mapSerializedCommunityToSchema(community as SerializeCommunity);
}

export const getCommunityByIdQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: ["community", communityId],
    queryFn: () => getCommunityById(communityId),
  });

async function getCommunitiesByUserId(userId: string) {
  const res = await client.api.v0.communities.user[":userId"].$get({
    param: { userId: userId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting saved posts by user id");
  }
  const { communities } = await res.json();
  return communities;
}

export const getCommunitiesByUserIdQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["user-communities", userId],
    queryFn: () => getCommunitiesByUserId(userId),
  });

async function joinCommunity(args: JoinCommunityArgs) {
  const token = getSession();
  const res = await client.api.v0.communities.join.$post(
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
      "There was an issue joining the community :( We'll look into it ASAP!";
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

export const useJoinCommunityMutation = (
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinCommunity,
    onSettled: (args) => {
      queryClient.invalidateQueries({
        queryKey: ["user-communities", args?.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["commmunities", args?.communityId],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function leaveCommunity(args: LeaveCommunityArgs) {
  const token = getSession();
  const res = await client.api.v0.communities.leave.$post(
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
      "There was an issue leaving the community :( We'll look into it ASAP!";
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

export const useLeaveCommunityMutation = (
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveCommunity,
    onSettled: (args) => {
      queryClient.invalidateQueries({
        queryKey: ["user-communities", args?.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["commmunities", args?.communityId],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getModerators(communityId: string) {
  const res = await client.api.v0.communities.moderators[":communityId"].$get({
    param: { communityId: communityId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting moderators");
  }
  const { moderators } = await res.json();
  return moderators;
}

export const getModeratorsQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: ["moderators"],
    queryFn: () => getModerators(communityId),
  });

async function updateIcon(args: UpdateIconArgs) {
  const token = getSession();
  const res = await client.api.v0.communities.update.icon.$post(
    {
      json: args,
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
    throw new Error("Error updating community icon.");
  }
  const { newCommunity } = await res.json();
  console.log(newCommunity);
  return newCommunity;
}

export const useUpdateIconMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIcon,
    onSettled: (args) => {
      if (!args) return console.log("no args, returning");
      queryClient.invalidateQueries({
        queryKey: ["community", args.communityId],
      });
    },
  });
};

async function updateDescription(args: UpdateDescriptionArgs) {
  const token = getSession();
  const res = await client.api.v0.communities.update.description.$post(
    {
      json: args,
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
    throw new Error("Error updating community description.");
  }
  const { newCommunity } = await res.json();
  console.log(newCommunity);
  return newCommunity;
}

export const useUpdateDescriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDescription,
    onSettled: (args) => {
      if (!args) return console.log("no args, returning");
      queryClient.invalidateQueries({
        queryKey: ["community", args.communityId],
      });
    },
  });
};
