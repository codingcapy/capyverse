import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  return (
    <div className="pt-20 w-[300px] mx-auto">
      <div className="text-center font-bold text-cyan-500 text-2xl mb-10">
        Login
      </div>
      <form action="" className="flex flex-col mx-auto">
        <input
          type="email"
          className="p-2 border border-[#c4c4c4] rounded bg-[#414141] my-2"
          placeholder="email"
        />
        <input
          type="password"
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
    </div>
  );
}
