import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../store/AuthStore";
import { useEffect } from "react";

export const Route = createFileRoute("/communities")({
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user]);

  return (
    <div className="pt-[88px] px-2 md:px-0 mx-auto w-full md:w-[50%] 2xl:w-[40%]">
      <div className="text-xl md:text-3xl font-bold">Manage Communities</div>
      <div className="text-lg md:text-xl font-bold text-center mt-10">
        No communities yet!
      </div>
      <div className="text-center my-2">
        Join a community to see popular posts about topics that interest you.
      </div>
    </div>
  );
}
