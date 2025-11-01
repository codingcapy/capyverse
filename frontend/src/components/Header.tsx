import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="fixed top-0 left-0 p-2 md:px-5 md:py-2 z-50 flex justify-between w-screen bg-[#222222] border-b border-[#808080]">
      <Link to="/" className="text-2xl text-cyan-500 font-bold">
        Capyverse
      </Link>
      <input
        type="text"
        className="px-5 py-2 border border-[#c4c4c4] rounded-2xl w-[30%] bg-[#414141]"
        placeholder="Search Capyverse"
      />
      <Link
        to="/login"
        className="bg-cyan-500 px-5 py-2 rounded-full font-bold"
      >
        Login
      </Link>
    </header>
  );
}
