import { type ArgumentTypes, client, type ExtractData } from "./client";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getSession } from "./posts";

type CreateUserArgs = ArgumentTypes<
  typeof client.api.v0.users.$post
>[0]["json"];

type UpdateProfilePicArgs = ArgumentTypes<
  typeof client.api.v0.users.update.profilepic.$post
>[0]["json"];

async function createUser(args: CreateUserArgs) {
  const res = await client.api.v0.users.$post({ json: args });
  if (!res.ok) {
    let errorMessage =
      "There was an issue creating your account :( We'll look into it ASAP!";
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
  if (!result.user) {
    throw new Error("Invalid response from server");
  }
  return result.user;
}

export const useCreateUserMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getUserById(userId: string) {
  const res = await client.api.v0.users[":userId"].$get({
    param: { userId },
  });

  if (!res.ok) {
    throw new Error("Error getting user by id");
  }
  const { userQuery } = await res.json();
  return userQuery;
}

export const getUserByIdQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
  });

async function getUserByUsername(username: string) {
  const res = await client.api.v0.users.user[":username"].$get({
    param: { username },
  });

  if (!res.ok) {
    throw new Error("Error getting user by id");
  }
  const { userQuery } = await res.json();
  return userQuery;
}

export const getUserByUsernameQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["user", username],
    queryFn: () => getUserByUsername(username),
  });

async function updateProfilePic(args: UpdateProfilePicArgs) {
  const token = getSession();
  const res = await client.api.v0.users.update.profilepic.$post(
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
    throw new Error("Error updating user.");
  }
  const { newUser } = await res.json();
  console.log(newUser);
  return newUser;
}

export const useUpdateProfilePicMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfilePic,
    onSettled: (newUser) => {
      if (!newUser) return;
      queryClient.invalidateQueries({
        queryKey: ["users", newUser.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};
