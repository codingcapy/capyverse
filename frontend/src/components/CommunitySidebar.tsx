import { Community } from "../../../schemas/communities";
import DOMPurify from "dompurify";
import { FiEdit2 } from "react-icons/fi";
import {
  getModeratorsQueryOptions,
  useUpdateDescriptionMutation,
} from "../lib/api/communities";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../store/AuthStore";
import React, { useState } from "react";

export function CommunitySidebar(props: { community: Community }) {
  const { user } = useAuthStore();
  const {
    data: moderators,
    isLoading: moderatorsLoading,
    error: moderatorsError,
  } = useQuery(getModeratorsQueryOptions(props.community.communityId));
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(props.community.description);
  const { mutate: updateDescription, isPending: updateDescriptionPending } =
    useUpdateDescriptionMutation();

  function handleUpdateDescription(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (updateDescriptionPending || !user) return;
    updateDescription(
      {
        communityId: props.community.communityId,
        description: editContent,
      },
      { onSuccess: () => setEditMode(false) }
    );
  }

  return (
    <aside className="hidden 2xl:block sticky top-[110px] h-[calc(100vh-150px)] w-[300px] ml-5 custom-scrollbar bg-[#111111] rounded-xl py-2 overflow-y-auto">
      <div className="flex justify-between">
        <div className="my-3 px-5 font-bold">{props.community.communityId}</div>
        {user ? (
          moderatorsLoading ? (
            <div>Loading...</div>
          ) : moderatorsError ? (
            <div>Error loading moderators</div>
          ) : moderators ? (
            moderators.some((m) => m.userId === user.userId) ? (
              <div
                onClick={() => setEditMode(true)}
                className="rounded-full m-2.5 p-2 bg-[#333333] hover:text-cyan-500 transition-all ease-in-out duration-300 cursor-pointer"
              >
                <FiEdit2 size={12} className="" />
              </div>
            ) : (
              ""
            )
          ) : (
            ""
          )
        ) : (
          ""
        )}
      </div>
      {editMode ? (
        <form onSubmit={handleUpdateDescription} className="flex flex-col">
          <textarea
            className="border border-[#a0a0a0] mx-auto w-[280px] rounded p-2"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="m-2 self-end flex text-center">
            <div
              onClick={() => setEditMode(false)}
              className="rounded-full w-[75px] bg-[#555555] mr-2 cursor-pointer hover:bg-[#666666] transition-all ease-in-out duration-300"
            >
              Cancel
            </div>
            <button className="rounded-full w-[100px] bg-cyan-700 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300">
              Edit
            </button>
          </div>
        </form>
      ) : (
        <div className="px-5 line-clamp-4">{props.community.description}</div>
      )}
    </aside>
  );
}
