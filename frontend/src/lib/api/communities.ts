import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Community } from "../../../../schemas/communities";
import { ArgumentTypes, client, ExtractData } from "./client";

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

type UpdateVisibilityArgs = ArgumentTypes<
  typeof client.api.v0.communities.update.visibility.$post
>[0]["json"];

type UpdateMatureArgs = ArgumentTypes<
  typeof client.api.v0.communities.update.mature.$post
>[0]["json"];

type UpdateSettingsArgs = ArgumentTypes<
  typeof client.api.v0.communities.update.settings.$post
>[0]["json"];

type CommunityUsersCursor = {
  communityUserId: number;
} | null;

export function mapSerializedCommunityToSchema(
  serialized: SerializeCommunity,
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

export type CommunitiesCursor = string | null;

async function getCommunities(cursor: CommunitiesCursor) {
  const res = await client.api.v0.communities.$get({
    query: cursor ? { cursor } : {},
  });
  if (!res.ok) {
    throw new Error("Error getting communities");
  }
  const { communities, nextCursor } = await res.json();
  return {
    communities: communities.map(mapSerializedCommunityToSchema),
    nextCursor: nextCursor ?? null,
  };
}

export const getCommunitiesInfiniteQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: ["communities"],
    queryFn: ({ pageParam }) => getCommunities(pageParam),
    initialPageParam: null as CommunitiesCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

async function getCommunityById(communityId: string) {
  const res = await client.api.v0.communities[":communityId"].$get({
    param: { communityId },
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
    staleTime: 5 * 60 * 1000,
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

export const getCommunitiesByUserIdQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: ["user-communities", userId],
    queryFn: () => getCommunitiesByUserId(userId!),
    enabled: !!userId,
  });

async function joinCommunity(args: JoinCommunityArgs) {
  const res = await client.api.v0.communities.join.$post({ json: args });
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
  const res = await client.api.v0.communities.leave.$post({ json: args });
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
    queryKey: ["moderators", communityId],
    queryFn: () => getModerators(communityId),
  });

async function getModeratorsPage(
  communityId: string,
  cursor: CommunityUsersCursor,
) {
  const res = await client.api.v0.communities.moderators[":communityId"].$get({
    param: { communityId: communityId.toString() },
    query: cursor
      ? { cursorCommunityUserId: String(cursor.communityUserId) }
      : {},
  } as any);

  if (!res.ok) {
    throw new Error("Error getting moderators");
  }
  const { moderators, nextCursor } = await res.json();
  return {
    moderators,
    nextCursor: nextCursor ?? null,
  };
}

export const getModeratorsInfiniteQueryOptions = (communityId: string) =>
  infiniteQueryOptions({
    queryKey: ["moderators", communityId, "infinite"],
    queryFn: ({ pageParam }) => getModeratorsPage(communityId, pageParam),
    initialPageParam: null as CommunityUsersCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

async function updateIcon(args: UpdateIconArgs) {
  const res = await client.api.v0.communities.update.icon.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error updating community icon.");
  }
  const { newCommunity } = await res.json();
  console.log(newCommunity);
  return newCommunity;
}

async function getMembers(communityId: string) {
  const res = await client.api.v0.communities.members[":communityId"].$get({
    param: { communityId: communityId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting members");
  }
  const { members } = await res.json();
  return members;
}

export const getMembersQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: ["members", communityId],
    queryFn: () => getMembers(communityId),
  });

async function getMembersPage(
  communityId: string,
  cursor: CommunityUsersCursor,
) {
  const res = await client.api.v0.communities.members[":communityId"].$get({
    param: { communityId: communityId.toString() },
    query: cursor
      ? { cursorCommunityUserId: String(cursor.communityUserId) }
      : {},
  } as any);

  if (!res.ok) {
    throw new Error("Error getting members");
  }
  const { members, nextCursor } = await res.json();
  return {
    members,
    nextCursor: nextCursor ?? null,
  };
}

export const getMembersInfiniteQueryOptions = (communityId: string) =>
  infiniteQueryOptions({
    queryKey: ["members", communityId, "infinite"],
    queryFn: ({ pageParam }) => getMembersPage(communityId, pageParam),
    initialPageParam: null as CommunityUsersCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

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
  const res = await client.api.v0.communities.update.description.$post({ json: args });
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

async function updateSettings(args: UpdateSettingsArgs) {
  const res = await client.api.v0.communities.update.settings.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error updating community description.");
  }
  const { newCommunity } = await res.json();
  console.log(newCommunity);
  return newCommunity;
}

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSettled: (args) => {
      if (!args) return console.log("no args, returning");
      queryClient.invalidateQueries({
        queryKey: ["community", args.communityId],
      });
    },
  });
};

async function updateVisibility(args: UpdateVisibilityArgs) {
  const res = await client.api.v0.communities.update.visibility.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error updating community visibility.");
  }
  const { newCommunity } = await res.json();
  console.log(newCommunity);
  return newCommunity;
}

export const useUpdateVisibilityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVisibility,
    onSettled: (args) => {
      if (!args) return console.log("no args, returning");
      queryClient.invalidateQueries({
        queryKey: ["community", args.communityId],
      });
    },
  });
};

async function updateMature(args: UpdateMatureArgs) {
  const res = await client.api.v0.communities.update.mature.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error updating community mature.");
  }
  const { newCommunity } = await res.json();
  return newCommunity;
}

export const useUpdateMatureMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMature,
    onSettled: (args) => {
      if (!args) return console.log("no args, returning");
      queryClient.invalidateQueries({
        queryKey: ["community", args.communityId],
      });
    },
  });
};

type InviteModeratorArgs = ArgumentTypes<
  typeof client.api.v0.communities.moderators.invite.$post
>[0]["json"];

async function inviteModerator(args: InviteModeratorArgs) {
  const res = await client.api.v0.communities.moderators.invite.$post({ json: args });
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

export const useInviteModeratorMutation = (
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteModerator,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderators"],
      });
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};
