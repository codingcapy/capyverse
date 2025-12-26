import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import useAuthStore from "../store/AuthStore";
import useNavStore from "../store/NavStore";

export function LeftNav() {
  const { showLeftNav, setShowLeftNav } = useNavStore();
  const { user } = useAuthStore();

  return (
    <div>
      {showLeftNav && (
        <div className="fixed top-0 left-0 min-h-screen bg-[#222222] border-r border-[#808080] pt-[75px] z-70 p-10 text-sm">
          <div className="border-b border-[#808080] pb-3">
            <Link
              to="/"
              onClick={() => window.innerWidth < 1100 && setShowLeftNav(false)}
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
                to="/communities"
                onClick={() =>
                  window.innerWidth < 1100 && setShowLeftNav(false)
                }
                className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                <IoSettingsOutline size={20} />
                <div className="ml-3">Manage Communities</div>
              </Link>
            </div>
          )}
          <div className="border-b border-[#808080] pb-3 pt-3">
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
