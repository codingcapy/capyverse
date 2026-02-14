import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../../store/AuthStore";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCommunityByIdQueryOptions,
  getModeratorsQueryOptions,
} from "../../lib/api/communities";
import { PiCaretDownBold } from "react-icons/pi";

type MembersMode = "mods" | "members";
type EditMode = "none" | "description" | "visibility" | "mature";

export const Route = createFileRoute("/mod/$communityId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { communityId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    data: moderators,
    isLoading: moderatorsLoading,
    error: moderatorsError,
  } = useQuery(getModeratorsQueryOptions(communityId));
  const {
    data: community,
    isLoading: communityLoading,
    error: communityError,
  } = useQuery(getCommunityByIdQueryOptions(communityId));
  const [membersMode, setMembersMode] = useState<MembersMode>("mods");
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [descriptionContent, setDescriptionContent] = useState(
    community ? community.description : "",
  );
  const [visibility, setVisibility] = useState(
    community ? community.visibility : "public",
  );
  const [matureContent, setMatureContent] = useState(
    community ? community.mature : false,
  );

  useEffect(() => {
    if (moderatorsLoading) return;
    if (moderatorsError) navigate({ to: "/" });
    if (!user) navigate({ to: "/" });
    if (
      moderators &&
      user &&
      !moderators.some((m) => m.username === user.username)
    )
      navigate({ to: "/" });
  }, [user, moderators]);

  return (
    <div className="pt-[70px] mx-auto">
      {communityLoading ? (
        <div className="p-5 lg:pl-[170px]">Loading community...</div>
      ) : communityError ? (
        <div className="p-5 lg:pl-[170px]">Error loading community</div>
      ) : community ? (
        <div className="p-5 lg:px-0 lg:pl-[170px]">
          <div className="text-3xl font-bold">Settings</div>
          <div className="my-5">
            <div className="flex justify-between max-w-[700px] w-[70vw] 2xl:max-w-[1000px] my-2">
              <div className="">Display name</div>
              <div>{community.communityId}</div>
            </div>
            <div className="flex justify-between max-w-[700px] 2xl:max-w-[1000px]">
              <div className="mr-10">Description</div>
              <div className="flex">
                <div className="line-clamp-1 mr-2">{community.description}</div>
                <div
                  onClick={() => setEditMode("description")}
                  className="rotate-270 hover:bg-[#666666] p-2 rounded-full cursor-pointer"
                >
                  <PiCaretDownBold />
                </div>
              </div>
            </div>
            <div className="flex justify-between max-w-[700px] 2xl:max-w-[1000px]">
              <div className="">Community Type</div>
              <div className="flex">
                <div className="capitalize mr-2">{community.visibility}</div>
                <div
                  onClick={() => setEditMode("visibility")}
                  className="rotate-270 hover:bg-[#666666] p-2 rounded-full cursor-pointer"
                >
                  <PiCaretDownBold />
                </div>
              </div>
            </div>
            <div className="flex justify-between max-w-[700px] 2xl:max-w-[1000px]">
              <div className="">Mature (18+)</div>
              <div className="flex">
                <div className="mr-2">
                  {community.mature ? community.mature.toString() : "Off"}
                </div>
                <div
                  onClick={() => setEditMode("mature")}
                  className="rotate-270 hover:bg-[#666666] p-2 rounded-full cursor-pointer"
                >
                  <PiCaretDownBold />
                </div>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold">Mature (18+)</div>
          <div className="my-5 flex">
            <div
              onClick={() => setMembersMode("mods")}
              className={`pr-2 cursor-pointer ${membersMode === "mods" && "underline font-bold"}`}
            >
              Moderators
            </div>
            <div
              onClick={() => setMembersMode("members")}
              className={`px-2 cursor-pointer ${membersMode === "members" && "underline font-bold"}`}
            >
              Members
            </div>
          </div>
          <div className="flex justify-between font-bold border-y border-[#555555] py-2 mb-5">
            <div>USERNAME</div>
            <div>JOINED</div>
          </div>
          {moderatorsLoading ? (
            <div>Loading moderators...</div>
          ) : moderatorsError ? (
            <div>Error loading moderators</div>
          ) : moderators ? (
            membersMode === "mods" ? (
              moderators.map((m) => {
                const createdAt = new Date(m.createdAt);
                return (
                  <div key={m.communityUserId} className="flex justify-between">
                    <div>{m.username}</div>
                    <div>{createdAt.toLocaleString()}</div>
                  </div>
                );
              })
            ) : (
              <div></div>
            )
          ) : (
            <div></div>
          )}
          {editMode === "description" ? (
            <div>
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#222222] p-6 rounded shadow-lg w-[90%] max-w-md  z-100">
                <form action="" className="flex flex-col">
                  <div className="text-2xl mb-5">Description</div>
                  <textarea
                    className="bg-[#444444] p-3 mx-auto mb-5 w-full rounded-xl"
                    value={descriptionContent}
                    onChange={(e) => setDescriptionContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <div
                      onClick={() => {
                        setEditMode("none");
                        setDescriptionContent(community.description);
                      }}
                      className="mx-1 bg-[#444444] hover:bg-[#555555] px-2 py-1 rounded-full cursor-pointer transition-all ease-in-out duration-300"
                    >
                      Cancel
                    </div>
                    <div className="mx-1 bg-cyan-600 hover:bg-cyan-500 px-2 py-1 rounded-full cursor-pointer transition-all ease-in-out duration-300">
                      Save
                    </div>
                  </div>
                </form>
              </div>
              <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
            </div>
          ) : editMode === "mature" ? (
            <div>
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#222222] p-6 rounded shadow-lg w-[90%] max-w-md  z-100">
                <form action="" className="flex flex-col">
                  <div className="text-2xl mb-5">Mature (18+)</div>
                  <div
                    onClick={() => setMatureContent(!matureContent)}
                    className=""
                  >
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
                  <div className="flex justify-end">
                    <div
                      onClick={() => {
                        setEditMode("none");
                        setMatureContent(community.mature);
                      }}
                      className="mx-1 bg-[#444444] hover:bg-[#555555] px-2 py-1 rounded-full cursor-pointer transition-all ease-in-out duration-300"
                    >
                      Cancel
                    </div>
                    <div className="mx-1 bg-cyan-600 hover:bg-cyan-500 px-2 py-1 rounded-full cursor-pointer transition-all ease-in-out duration-300">
                      Save
                    </div>
                  </div>
                </form>
              </div>
              <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
            </div>
          ) : editMode === "visibility" ? (
            <div className="">
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#222222] p-6 rounded shadow-lg w-[90%] max-w-md  z-100">
                <form action="" className="flex flex-col">
                  <div className="text-2xl mb-5">Visibility</div>
                  <div
                    onClick={() => setVisibility("public")}
                    className={`p-2 cursor-pointer ${visibility === "public" && "bg-[#555555]"}`}
                  >
                    <div>Public</div>
                    <div className="text-xs">
                      Anyone can view, post and comment
                    </div>
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
                    className={`p-2 cursor-pointer mb-5 ${visibility === "private" && "bg-[#555555]"}`}
                  >
                    <div>Private</div>
                    <div className="text-xs">
                      Only approved users can view and contribute
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div
                      onClick={() => {
                        setEditMode("none");
                        setVisibility(community.visibility);
                      }}
                      className="mx-1 bg-[#444444] hover:bg-[#555555] px-2 py-1 rounded-full cursor-pointer transition-all ease-in-out duration-300"
                    >
                      Cancel
                    </div>
                    <div className="mx-1 bg-cyan-600 hover:bg-cyan-500 px-2 py-1 rounded-full cursor-pointer transition-all ease-in-out duration-300">
                      Save
                    </div>
                  </div>
                </form>
              </div>
              <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
