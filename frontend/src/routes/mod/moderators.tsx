import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useAuthStore from "../../store/AuthStore";
import { useEffect } from "react";

export const Route = createFileRoute("/mod/moderators")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user]);

  return (
    <div className="pt-[70px] mx-auto">
      <div className="md:flex pt-[5px] px-5 lg:px-0 lg:pl-[170px] max-w-[1300px]">
        <div className="text-3xl font-bold">Settings</div>
        <div className="w-[1300px]"></div>
      </div>
    </div>
  );
}
