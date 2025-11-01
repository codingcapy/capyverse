import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="flex-1 p-2">
      <div className="text-center text-cyan-500 text-2xl font-bold pt-20">
        Index
      </div>
    </div>
  );
}
