import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex-1 p-2 bg-[#2b2b2b]">
      <div className="text-center text-cyan-500 text-2xl font-bold pt-10">
        Capyverse
      </div>
    </div>
  );
}
