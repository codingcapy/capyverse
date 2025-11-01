import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../store/AuthStore";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const { loginService, authLoading, user } = useAuthStore((state) => state);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!!user) navigate({ to: "/" });
  }, [user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    const password = (e.target as HTMLFormElement).password.value;
    loginService(email, password);
    if (authLoading) setNotification("Loading...");
    if (!user) {
      setTimeout(() => {
        setNotification("Invalid login credentials");
      }, 700);
    }
  }

  return (
    <div className="pt-20 w-[300px] mx-auto">
      <div className="text-center font-bold text-cyan-500 text-2xl mb-10">
        Login
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col mx-auto">
        <input
          type="email"
          name="email"
          id="email"
          required
          className="p-2 border border-[#c4c4c4] rounded bg-[#414141] my-2"
          placeholder="email"
        />
        <input
          type="password"
          name="password"
          id="password"
          required
          className="p-2 border border-[#c4c4c4] rounded bg-[#414141] my-2"
          placeholder="password"
        />
        <button className="bg-cyan-500 px-5 py-2 rounded-full font-bold my-5">
          LOGIN
        </button>
      </form>
      <div>
        Don't have an account?{" "}
        <Link to="/signup" className="text-cyan-500 font-bold">
          Signup
        </Link>
      </div>
      <div>{notification}</div>
    </div>
  );
}
