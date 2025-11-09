import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCreateUserMutation } from "../lib/api/users";
import { useState } from "react";
import useAuthStore from "../store/AuthStore";

export const Route = createFileRoute("/signup")({
  component: SignupComponent,
});

function SignupComponent() {
  const { mutate: createUser } = useCreateUserMutation();
  const [notification, setNotification] = useState("");
  const { loginService, authLoading, user } = useAuthStore((state) => state);
  const navigate = useNavigate();

  if (!!user) navigate({ to: "/" });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const username = (e.target as HTMLFormElement).username.value;
    const email = (e.target as HTMLFormElement).email.value;
    const password = (e.target as HTMLFormElement).password.value;
    if (username.length > 255) return setNotification("Username too long!");
    if (email.length > 255) return setNotification("Email too long!");
    if (password.length > 80)
      return setNotification("Password too long! Max character limit is 80");
    createUser(
      { username, password, email },
      {
        onSuccess: () => {
          loginService(email, password);
          if (authLoading) setNotification("Loading...");
        },
        onError: (errorMessage) => setNotification(errorMessage.toString()),
      }
    );
  }

  return (
    <div className="pt-20 w-[300px] mx-auto">
      <div className="text-center font-bold text-cyan-500 text-2xl mb-10">
        Sign Up
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col mx-auto">
        <input
          type="text"
          name="username"
          id="username"
          required
          className="p-2 border border-[#c4c4c4] rounded bg-[#414141] my-2"
          placeholder="username"
        />
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
          SIGN UP
        </button>
      </form>
      <div>
        Already have an account?{" "}
        <Link to="/login" className="text-cyan-500 font-bold">
          Login
        </Link>
      </div>
      <div>{notification}</div>
    </div>
  );
}
