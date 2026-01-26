import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import {
  getCommunitiesByUserIdQueryOptions,
  getCommunityByIdQueryOptions,
  getModeratorsQueryOptions,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useUpdateIconMutation,
} from "../../lib/api/communities";
import defaultProfile from "/capypaul01.jpg";
import { PiCaretDownBold } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { SortMode } from "..";
import { useQuery } from "@tanstack/react-query";
import usePostStore from "../../store/PostStore";
import useAuthStore from "../../store/AuthStore";
import { CommunityPostsByNew } from "../../components/CommunityPostsByNew";
import { CommunityPostsByPopular } from "../../components/CommunityPostsByPopular";

export const Route = createFileRoute("/c/$communityId")({
  component: CommunityPage,
});

function CommunityPage() {
  const { communityId } = Route.useParams();
  const {
    data: community,
    isLoading: communityLoading,
    error: communityError,
  } = useQuery(getCommunityByIdQueryOptions(communityId));
  const { user } = useAuthStore();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("Popular");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { searchContent } = usePostStore();
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useQuery(getCommunitiesByUserIdQueryOptions((user && user.userId) || ""));
  const { mutate: joinCommunity, isPending: joinCommunityPending } =
    useJoinCommunityMutation();
  const { mutate: leaveCommunity, isPending: leaveCommunityPending } =
    useLeaveCommunityMutation();
  const navigate = useNavigate();
  const [iconHovered, setIconHovered] = useState(false);
  const {
    data: moderators,
    isLoading: moderatorsLoading,
    error: moderatorsError,
  } = useQuery(getModeratorsQueryOptions(communityId));
  const { mutate: updateIcon, isPending: updateIconPending } =
    useUpdateIconMutation();

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowSortMenu(false);
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (updateIconPending || !community) return;
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size exceeds 1MB. Please upload a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateIcon({
          communityId: community.communityId,
          icon: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex-1">
      {communityLoading ? (
        <div className="pt-20 pl-2.5 lg:pl-[300px] text-2xl">Loading...</div>
      ) : communityError ? (
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 p-3">
            <p className="text-xl md:text-4xl text-center pt-20 md:pt-32">
              Whoops! This isn't what you're looking for 😅
            </p>
            <p className="mt-5 text-center">
              Check the spelling of the community name. If it's correct, the
              community might have been removed or suspended.
            </p>
            <div className="flex flex-col my-10 md:my-20 mx-auto w-[250px]">
              <Link
                to="/"
                className="py-2 px-10 rounded bg-cyan-500 text-center tracking-widest hover:bg-cyan-300 hover:text-[#202020] transition-all ease-in-out duration-300 text-white secondary-font font-bold"
              >
                LET'S GO HOME
              </Link>
            </div>
          </main>
        </div>
      ) : community ? (
        <div className="flex flex-col">
          <div className="mx-auto w-full md:w-[50%] pt-[70px] pb-2">
            <div className="flex pt-10">
              <div className="pt-5">
                {user ? (
                  moderatorsLoading ? (
                    <div>Loading...</div>
                  ) : moderatorsError ? (
                    <div>Error loading moderators</div>
                  ) : moderators ? (
                    moderators.some((m) => m.userId === user.userId) ? (
                      <div
                        className="relative cursor-pointer"
                        onMouseEnter={() => setIconHovered(true)}
                        onMouseLeave={() => setIconHovered(false)}
                      >
                        <img
                          src={community.icon ? community.icon : defaultProfile}
                          alt=""
                          className="rounded-full w-[100px] h-[100px]"
                        />
                        {iconHovered && (
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute top-[35px] left-9 z-1 cursor-pointer"
                          >
                            <path
                              d="M15.1113 9.89062C16.3766 11.9078 18.0945 13.614 20.1357 14.8662L10.5352 24.4688C10.2695 24.7344 10.1358 24.8668 9.97266 24.9541C9.8095 25.0414 9.62514 25.0787 9.25684 25.1523L4.20898 26.1621C4.00121 26.2037 3.89701 26.2242 3.83789 26.165C3.77902 26.1059 3.80027 26.0016 3.8418 25.7939L4.85059 20.7461C4.92427 20.3777 4.96149 20.1935 5.04883 20.0303C5.13616 19.8671 5.26951 19.7344 5.53516 19.4688L15.1113 9.89062ZM21.249 4.27148C21.7668 4.27148 22.1842 4.68815 23.0176 5.52148L24.4814 6.98633C25.3148 7.81966 25.7314 8.23614 25.7314 8.75391C25.7314 9.27166 25.3148 9.68816 24.4814 10.5215L21.0479 13.9541C18.9748 12.7418 17.2473 11.0284 16.0205 8.98145L19.4814 5.52148C20.3145 4.68839 20.7315 4.27172 21.249 4.27148Z"
                              fill="white"
                            />
                          </svg>
                        )}
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          className="absolute top-0 left-0 z-10 h-[100px] w-[100px] opacity-0 cursor-pointer"
                          onChange={handleImageUpload}
                        />
                        {iconHovered && (
                          <div className="absolute rounded-full inset-0 bg-black opacity-50 z-0 cursor-pointer"></div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={community.icon ? community.icon : defaultProfile}
                        alt=""
                        className="rounded-full w-[100px] h-[100px]"
                      />
                    )
                  ) : (
                    <img
                      src={community.icon ? community.icon : defaultProfile}
                      alt=""
                      className="rounded-full w-[100px] h-[100px]"
                    />
                  )
                ) : (
                  <img
                    src={community.icon ? community.icon : defaultProfile}
                    alt=""
                    className="rounded-full w-[100px] h-[100px]"
                  />
                )}
              </div>
              <div className="text-4xl font-bold pt-20 ml-2">
                c/{community.communityId}
              </div>
            </div>
            <div className="flex">
              <div
                ref={menuRef}
                className="relative mx-auto w-full 2xl:w-[750px] flex pt-5"
              >
                <div
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex cursor-pointer pl-4 md:pl-0 md:pt-1 hover:text-cyan-500 transition-all ease-in-out duration-300"
                >
                  <div className="text-xs">{sortMode}</div>
                  <div className="ml-2">
                    <PiCaretDownBold />
                  </div>
                </div>
                {showSortMenu && (
                  <div
                    onClick={() => {}}
                    className="absolute top-12 left-0 bg-[#444444] px-5 py-2 z-50 shadow-[0_0_15px_rgba(0,0,0,0.7)]"
                  >
                    <div
                      onClick={() => {
                        setSortMode("Popular");
                        setShowSortMenu(false);
                      }}
                      className=" py-1 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                    >
                      Popular
                    </div>
                    <div
                      onClick={() => {
                        setSortMode("New");
                        setShowSortMenu(false);
                      }}
                      className="py-1 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
                    >
                      New
                    </div>
                  </div>
                )}
              </div>
              {user ? (
                communitiesLoading ? (
                  <div>Loading...</div>
                ) : communitiesError ? (
                  <div>Error loading communities</div>
                ) : communities ? (
                  communities.some(
                    (c) => c.communityId === community.communityId,
                  ) ? (
                    <div
                      onClick={() => {
                        if (leaveCommunityPending) return;
                        leaveCommunity({
                          communityId,
                        });
                      }}
                      className="px-5 py-3 rounded-full border cursor-pointer hover:bg-[#333333] transition-all ease-in-out duration-300"
                    >
                      {leaveCommunityPending ? "Leaving..." : "Joined"}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        if (joinCommunityPending) return;
                        joinCommunity({
                          communityId,
                        });
                      }}
                      className="px-5 py-3 rounded-full bg-cyan-700 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300"
                    >
                      {joinCommunityPending ? "Joining..." : "Join"}
                    </div>
                  )
                ) : (
                  <div className="px-5 py-3 rounded-full bg-cyan-700 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300">
                    Join
                  </div>
                )
              ) : (
                <div
                  onClick={() => navigate({ to: "/login" })}
                  className="px-5 py-3 rounded-full bg-cyan-700 cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300"
                >
                  Join
                </div>
              )}
            </div>
          </div>
          {sortMode === "Popular" ? (
            <CommunityPostsByNew community={community} />
          ) : (
            <CommunityPostsByPopular community={community} />
          )}
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 p-3">
            <p className="text-xl md:text-4xl text-center pt-20 md:pt-32">
              Whoops! This isn't what you're looking for 😅
            </p>
            <div className="flex flex-col my-10 md:my-20 mx-auto w-[250px]">
              <Link
                to="/"
                className="py-2 px-10 rounded bg-cyan-500 text-center tracking-widest hover:bg-cyan-300 hover:text-[#202020] transition-all ease-in-out duration-300 text-white secondary-font font-bold"
              >
                LET'S GO HOME
              </Link>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
