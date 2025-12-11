import { Link } from "@tanstack/react-router";
import useAuthStore from "../store/AuthStore";
import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";

export function Header() {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const { logoutService } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 p-2 md:px-5 md:py-2 z-50 flex justify-between w-screen bg-[#222222] border-b border-[#808080]">
      <Link to="/" className="text-2xl text-cyan-500 font-bold">
        Capyverse
      </Link>
      {window.innerWidth > 500 ? (
        <input
          type="text"
          className="px-5 py-2 rounded-2xl w-[30%] bg-[#414141]"
          placeholder="Search Capyverse"
        />
      ) : (
        <IoSearch size={30} className="pt-2" />
      )}
      {user ? (
        <div className="flex px-5 py-2 font-bold">
          <Link
            to="/createpost"
            className="px-5 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
          >
            + Create
          </Link>
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="flex cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
          >
            <CgProfile size={25} />
            <div className="ml-1">{user.username}</div>
          </div>
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-cyan-500 px-5 py-2 rounded-full font-bold"
        >
          Login
        </Link>
      )}
      {showMenu && (
        <div
          onClick={() => {
            logoutService();
            setShowMenu(false);
          }}
          className="absolute top-[60px] right-0 bg-[#444444] p-5 cursor-pointer hover:text-cyan-500 transition-all ease-in-out duration-300"
        >
          Logout
        </div>
      )}
    </header>
  );
}
