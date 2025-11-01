import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex-1 p-2">
      <div className="text-center text-cyan-500 text-2xl font-bold pt-20">
        Capyverse
      </div>
    </div>
  );
}
