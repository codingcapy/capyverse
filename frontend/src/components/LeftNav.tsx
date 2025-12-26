import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";

export function LeftNav() {
  const [showLeftNav, setShowLeftNav] = useState(
    window.innerWidth > 900 ? true : false
  );

  return (
    <div>
      {showLeftNav && (
        <div className="fixed top-0 left-0 min-h-screen bg-[#222222] border-r border-[#808080] pt-[75px] z-70 p-10 text-sm">
          <div className="border-b border-[#808080] pb-3">
            <Link
              to="/"
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <FaHome size={20} />
              <div className="ml-3">Home</div>
            </Link>
            <div className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300">
              <FaPlus size={20} />
              <div className="ml-3">Start a Community</div>
            </div>
          </div>
          <div className="border-b border-[#808080] pb-3">
            <div className="pb-3 pt-7 text-[#808080]">COMMUNITIES</div>
            <div className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300">
              <IoSettingsOutline size={20} />
              <div className="ml-3">Manage Communities</div>
            </div>
          </div>
          <div className="border-b border-[#808080] pb-3 pt-3">
            <Link
              to="/policies/privacypolicy"
              className="flex py-2 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
            >
              <IoDocumentTextOutline size={20} />
              <div className="ml-3">Privacy Policy</div>
            </Link>
            <Link
              to="/policies/useragreement"
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
