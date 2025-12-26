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

type DeletePostArgs = ArgumentTypes<
  typeof client.api.v0.posts.post.delete.$post
>[0]["json"];

type UpdatePostArgs = ArgumentTypes<
  typeof client.api.v0.posts.post.update.$post
>[0]["json"];

type SavePostArgs = ArgumentTypes<
  typeof client.api.v0.posts.save.$post
>[0]["json"];

type UnsavePostArgs = ArgumentTypes<
  typeof client.api.v0.posts.unsave.$post
>[0]["json"];

type SerializePost = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.posts.$get>>
>["posts"][number];

export function mapSerializedPostToSchema(serialized: SerializePost): Post {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
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

export type NewPostsCursor = {
  postId: number;
} | null;

export async function getNewPostsPage({
  pageParam,
}: {
  pageParam: NewPostsCursor;
}) {
  const res = await client.api.v0.posts.$get({
    query: pageParam ? { cursorPostId: String(pageParam.postId) } : {},
  });
  if (!res.ok) {
    throw new Error("Error getting posts");
  }
  const { posts, nextCursor } = await res.json();
  return {
    posts: posts.map(mapSerializedPostToSchema),
    nextCursor,
  };
}

export type PopularPostsCursor = {
  score: number;
  createdAt: string;
  postId: number;
} | null;

export async function getPopularPostsPage({
  pageParam,
}: {
  pageParam: PopularPostsCursor;
}) {
  const res = await client.api.v0.posts.popular.$get({
    query: pageParam
      ? {
          cursorScore: String(pageParam.score),
          cursorCreatedAt: pageParam.createdAt,
          cursorPostId: String(pageParam.postId),
        }
      : {},
  });

  if (!res.ok) {
    throw new Error("Error getting popular posts");
  }
  const { posts, nextCursor } = await res.json();
  return {
    posts: posts.map(mapSerializedPostToSchema),
    nextCursor,
  };
}

async function getPostById(postId: number) {
  const res = await client.api.v0.posts[":postId"].$get({
    param: { postId: postId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting post by id");
  }
  const { post } = await res.json();
  return mapSerializedPostToSchema(post as SerializePost);
}

export const getPostByIdQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ["posts", postId],
    queryFn: () => getPostById(postId),
  });

async function deletePost(args: DeletePostArgs) {
  const res = await client.api.v0.posts.post.delete.$post({ json: args });
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

export const useDeletePostMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSettled: (_data, _error) => {
      if (!_data) return console.log("No data, returning");
      queryClient.invalidateQueries({
        queryKey: ["posts", _data.postResult.postId],
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

async function updatePost(args: UpdatePostArgs) {
  const res = await client.api.v0.posts.post.update.$post({ json: args });
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

export const useUpdatePostMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSettled: (_data, _error) => {
      if (!_data) return console.log("No data, returning");
      queryClient.invalidateQueries({
        queryKey: ["posts", _data.postResult.postId],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getPostsByUserId(userId: string) {
  const res = await client.api.v0.posts.user[":userId"].$get({
    param: { userId: userId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting posts by user id");
  }
  const { posts } = await res.json();
  return posts.map(mapSerializedPostToSchema);
}

export const getPostsByUserIdQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["posts", userId],
    queryFn: () => getPostsByUserId(userId),
  });

async function savePost(args: SavePostArgs) {
  const res = await client.api.v0.posts.save.$post({ json: args });
  if (!res.ok) {
    let errorMessage =
      "There was an issue saving your post :( We'll look into it ASAP!";
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

export const useSavePostMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePost,
    onSettled: (_data, _error) => {
      if (!_data) return console.log("No data, returning");
      queryClient.invalidateQueries({
        queryKey: ["posts", _data.postResult.postId],
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

async function getSavedPostsByUserId(userId: string) {
  const res = await client.api.v0.posts.saved[":userId"].$get({
    param: { userId: userId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting saved posts by user id");
  }
  const { posts } = await res.json();
  console.log(posts);
  return posts.map(mapSerializedPostToSchema);
}

export const getSavedPostsByUserIdQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["saved-posts", userId],
    queryFn: () => getSavedPostsByUserId(userId),
  });

async function unsavePost(args: UnsavePostArgs) {
  const res = await client.api.v0.posts.unsave.$post({ json: args });
  if (!res.ok) {
    let errorMessage =
      "There was an issue unsaving your post :( We'll look into it ASAP!";
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

export const useUnsavePostMutation = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsavePost,
    onSettled: (_data, _error) => {
      if (!_data) return console.log("No data, returning");
      queryClient.invalidateQueries({
        queryKey: ["posts", _data.postResult.postId],
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

async function getRecentPosts() {
  const res = await client.api.v0.posts.recent.$get();
  if (!res.ok) {
    throw new Error("Error getting posts");
  }
  const { posts } = await res.json();
  return posts.map(mapSerializedPostToSchema);
}

export const getRecentPostsQueryOptions = () =>
  queryOptions({
    queryKey: ["recent-posts"],
    queryFn: () => getRecentPosts(),
  });
