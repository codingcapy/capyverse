import { Community } from "../../../schemas/communities";
import { FiEdit2 } from "react-icons/fi";
import {
  getModeratorsQueryOptions,
  useUpdateDescriptionMutation,
  useUpdateSettingsMutation,
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
  const { mutate: updateSettings, isPending: updateSettingsPending } =
    useUpdateSettingsMutation();
  const [matureContent, setMatureContent] = useState(
    props.community.mature || false,
  );
  const [visibility, setVisibility] = useState(props.community.visibility);

  function handleUpdateDescription(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (updateSettingsPending || !user) return;
    updateSettings(
      {
        communityId: props.community.communityId,
        description: editContent,
        visibility: visibility,
        mature: matureContent,
      },
      { onSuccess: () => setEditMode(false) },
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
          <div className="m-2">
            <div className="font-semibold">Visibility</div>
            <div
              onClick={() => setVisibility("public")}
              className={`p-2 cursor-pointer ${visibility === "public" && "bg-[#555555]"}`}
            >
              <div>Public</div>
              <div className="text-xs">Anyone can view, post and comment</div>
            </div>
            <div
              onClick={() => setVisibility("restricted")}
              className={`p-2 cursor-pointer ${visibility === "restricted" && "bg-[#555555]"}`}
            >
              <div>Restricted</div>
              <div className="text-xs">
                Anyone can view, but only approved users can contribute
              </div>
            </div>
            <div
              onClick={() => setVisibility("private")}
              className={`p-2 cursor-pointer ${visibility === "private" && "bg-[#555555]"}`}
            >
              <div>Private</div>
              <div className="text-xs">
                Only approved users can view and contribute
              </div>
            </div>
          </div>
          <div onClick={() => setMatureContent(!matureContent)} className="m-2">
            <div className="mb-2 font-semibold">Mature (18+)</div>
            <div
              className={`inline-flex items-center justify-center gap-0 mb-2 ${matureContent ? "bg-cyan-500" : "bg-[#666666]"} rounded-full shadow-[inset_-1px_0px_4.8px_rgba(0,0,0,0.5)]`}
            >
              <div
                className={`h-[25px] w-[25px] rounded-full font-bold text-lg tracking-wide transition-all duration-300 ease-in-out ${
                  !matureContent ? "bg-white" : "bg-transparent"
                }`}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              ></div>
              <div
                className={`h-[25px] w-[25px] rounded-full font-bold text-lg tracking-wide transition-all duration-300 ease-in-out ${
                  matureContent ? "bg-white" : "bg-transparent"
                }`}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              ></div>
            </div>
          </div>
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
