import { Link, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../store/AuthStore";
import { useEffect, useRef, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";
import usePostStore from "../store/PostStore";
import defaultProfile from "/capypaul01.jpg";
import { FaHamburger } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import useNavStore from "../store/NavStore";

export function Header() {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const { logoutService } = useAuthStore();
  const [searchMode, setSearchMode] = useState(false);
  const { setSearchContent } = usePostStore();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { showLeftNav, setShowLeftNav } = useNavStore();

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div>
      {searchMode ? (
        <div className="fixed top-0 left-0 p-2 md:px-5 md:py-2 z-80 flex justify-between w-screen bg-[#222222] border-b border-[#808080]">
          <div
            onClick={() => setSearchMode(false)}
            className="mt-1 cursor-pointer"
          >
            <FaArrowLeft size={25} />
          </div>
          <input
            type="text"
            className="px-5 py-1 ml-2 rounded-2xl w-full bg-[#414141]"
            placeholder="Search Capyverse"
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>
      ) : (
        <header
          ref={menuRef}
          className="fixed top-0 left-0 p-2 md:px-5 md:py-2 z-80 flex justify-between w-screen bg-[#222222] border-b border-[#808080]"
        >
          {window.innerWidth < 1100 && (
            <div onClick={() => setShowLeftNav(!showLeftNav)} className="py-2">
              <GiHamburgerMenu size={25} />
            </div>
          )}
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="text-2xl text-cyan-500 font-bold"
          >
            Capyverse
          </Link>
          {window.innerWidth > 500 && (
            <input
              type="text"
              className="px-5 py-2 rounded-2xl w-[30%] bg-[#414141]"
              placeholder="Search Capyverse"
              onChange={(e) => setSearchContent(e.target.value)}
            />
          )}
          {window.innerWidth < 501 && (
            <div
              onClick={() => setSearchMode(true)}
              className="pt-2 md:py-2 cursor-pointer"
            >
              <IoSearch size={25} />
            </div>
          )}
          {user ? (
            <div className="flex sm:px-5 pt-2 md:py-2 font-bold">
              <Link
                to="/createpost"
                className="sm:px-5 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                + Create
              </Link>
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="hidden sm:flex cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                <CgProfile size={25} />
                <div className="ml-1">{user.username}</div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-cyan-600 px-5 py-2 rounded-full font-bold cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300"
            >
              Login
            </Link>
          )}
          {user && (
            <div className="sm:hidden pt-1">
              <img
                src={user.profilePic ? user.profilePic : defaultProfile}
                alt="User Profile"
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full cursor-pointer object-cover object-center"
              />
            </div>
          )}
          {showMenu && (
            <div className="absolute top-[60px] right-[15px] bg-[#444444] shadow-[0_0_15px_rgba(0,0,0,0.7)]">
              <div className="px-4 pt-3 pb-1 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300">
                <Link to="/profile" onClick={() => setShowMenu(false)}>
                  View Profile
                </Link>
              </div>
              <div
                onClick={() => {
                  logoutService();
                  setShowMenu(false);
                }}
                className="px-4 pb-3 pt-1 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
              >
                Logout
              </div>
            </div>
          )}
        </header>
      )}
    </div>
  );
}
