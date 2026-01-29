import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import useAuthStore from "../store/AuthStore";
import useNavStore from "../store/NavStore";
import { useQuery } from "@tanstack/react-query";
import { getCommunitiesByUserIdQueryOptions } from "../lib/api/communities";
import defaultProfile from "/capypaul01.jpg";
import { GiCapybara } from "react-icons/gi";
import { IoPeopleCircleOutline } from "react-icons/io5";

export function LeftNav() {
  const { showLeftNav, setShowLeftNav } = useNavStore();
  const { user } = useAuthStore();
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useQuery(getCommunitiesByUserIdQueryOptions((user && user.userId) || ""));

  return (
    <div>
      {showLeftNav && (
        <div className="fixed top-0 left-0 h-screen bg-[#222222] border-r border-[#808080] pt-[75px] z-70 p-10 text-sm overflow-y-auto custom-scrollbar">
          <div className="border-b border-[#808080] pb-3">
            <Link
              to="/"
              onClick={() => {
                window.innerWidth < 1100 && setShowLeftNav(false);
                window.scrollTo(0, 0);
              }}
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <FaHome size={20} />
              <div className="ml-3">Home</div>
            </Link>
            <Link
              to="/createcommunity"
              onClick={() => window.innerWidth < 1100 && setShowLeftNav(false)}
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <FaPlus size={20} />
              <div className="ml-3">Start a Community</div>
            </Link>
          </div>
          {user && (
            <div className="border-b border-[#808080] pb-3">
              <div className="pb-3 pt-7 text-[#808080]">COMMUNITIES</div>
              <Link
                to="/u/communities"
                onClick={() =>
                  window.innerWidth < 1100 && setShowLeftNav(false)
                }
                className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                <IoSettingsOutline size={20} />
                <div className="ml-3">Manage Communities</div>
              </Link>
              {communitiesLoading ? (
                <div>Loading...</div>
              ) : communitiesError ? (
                <div>Error loading communities</div>
              ) : communities ? (
                communities.map((community) => (
                  <Link
                    to="/c/$communityId"
                    params={{
                      communityId: community.communityId,
                    }}
                    key={community.communityId}
                  >
                    <div className="flex hover:text-cyan-500 transition-all ease-in-out duration-300 my-3">
                      <img
                        src={community.icon ? community.icon : defaultProfile}
                        alt=""
                        className="rounded-full w-[30px] h-[30px]"
                      />
                      <div className="ml-1 pt-1">c/{community.communityId}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div></div>
              )}
            </div>
          )}
          <div className="border-b border-[#808080] pb-3">
            <div className="pb-3 pt-7 text-[#808080]">RESOURCES</div>
            <Link
              to="/about"
              onClick={() => window.innerWidth < 1100 && setShowLeftNav(false)}
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <GiCapybara size={20} />
              <div className="ml-3">About Capyverse</div>
            </Link>
          </div>
          <div className="border-b border-[#808080] py-3">
            <Link
              to="/communities"
              onClick={() => window.innerWidth < 1100 && setShowLeftNav(false)}
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <IoPeopleCircleOutline size={20} />
              <div className="ml-3">Communities</div>
            </Link>
          </div>
          <div className="py-3">
            <Link
              to="/policies/privacypolicy"
              onClick={() => window.innerWidth < 1100 && setShowLeftNav(false)}
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <IoDocumentTextOutline size={20} />
              <div className="ml-3">Privacy Policy</div>
            </Link>
            <Link
              to="/policies/useragreement"
              onClick={() => window.innerWidth < 1100 && setShowLeftNav(false)}
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <IoDocumentTextOutline size={20} />
              <div className="ml-3">User Agreement</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
