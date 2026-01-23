import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ArgumentTypes, client, ExtractData } from "./client";
import { ImagePost } from "../../../../schemas/images";
import { getSession } from "./posts";

type UploadResponse =
  | {
      success: true;
      cloudFrontUrl: string;
    }
  | {
      success: false;
      error: string;
    };

type SerializeImage = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.images.$get>>
>["images"][number];

type DeleteImageArgs = ArgumentTypes<
  typeof client.api.v0.images.delete.$post
>[0]["json"];

type UpdateImageArgs = ArgumentTypes<
  typeof client.api.v0.images.update.$post
>[0]["json"];

export function mapSerializedImageToSchema(
  SerializedImage: SerializeImage,
): ImagePost {
  return {
    ...SerializedImage,
    createdAt: new Date(SerializedImage.createdAt),
  };
}

export function useUploadImageMutation() {
  const token = getSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      file,
      postId,
    }: {
      userId: string;
      file: File;
      postId: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await client.api.v0.images.upload.$post(
        {
          form: { userId, file, postId },
        },
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      );

      const data = (await res.json()) as UploadResponse;
      if (!data.success) throw new Error(data.error);
      return { cloudFrontUrl: data.cloudFrontUrl, userId };
    },
    onSettled: (args) => {
      if (!args) return console.log(args, "create args, returning");
      queryClient.invalidateQueries({ queryKey: ["images", args.userId] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

async function getImagesByPostId(postId: number) {
  const res = await client.api.v0.images[":postId"].$get({
    param: { postId: postId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting images by request");
  }
  const { images } = await res.json();
  return images.map(mapSerializedImageToSchema);
}

export const getImagesByPostIdQueryOptions = (args: number) =>
  queryOptions({
    queryKey: ["images", args],
    queryFn: () => getImagesByPostId(args),
  });

async function getImagesByUserId(userId: string) {
  const res = await client.api.v0.images.user[":userId"].$get({
    param: { userId: userId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting images by request");
  }
  const { images } = await res.json();
  return images.map(mapSerializedImageToSchema);
}

export const getImagesByUserIdQueryOptions = (args: string) =>
  queryOptions({
    queryKey: ["images", args],
    queryFn: () => getImagesByUserId(args),
  });

async function getAllImages() {
  const res = await client.api.v0.images.$get();
  if (!res.ok) {
    throw new Error("Error getting images");
  }
  const { images } = await res.json();
  return images.map(mapSerializedImageToSchema);
}

export const getAllImagesQueryOptions = () =>
  queryOptions({
    queryKey: ["images"],
    queryFn: () => getAllImages(),
  });

async function deleteImage(args: DeleteImageArgs) {
  const token = getSession();
  const res = await client.api.v0.images.delete.$post(
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
    throw new Error("Error deleting image.");
  }
  const { newImage } = await res.json();
  console.log(newImage);
  return newImage;
}

export const useDeleteImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteImage,
    onSettled: (newImage) => {
      if (!newImage) return;
      queryClient.invalidateQueries({
        queryKey: ["images", newImage.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["images"],
      });
    },
  });
};

async function updateImage(args: UpdateImageArgs) {
  const token = getSession();
  const res = await client.api.v0.images.update.$post(
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
    throw new Error("Error updating image.");
  }
  const { newImage } = await res.json();
  console.log(newImage);
  return mapSerializedImageToSchema(newImage);
}

export const useUpdateImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateImage,
    onSettled: (newImage) => {
      if (!newImage) return;
      queryClient.invalidateQueries({
        queryKey: ["images", newImage.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["images"],
      });
    },
  });
};
