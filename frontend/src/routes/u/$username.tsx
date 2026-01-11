import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/u/$username")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { username } = Route.useParams();

  return (
    <div className="pt-[70px] mx-auto">
      <div className="flex text-2xl font-bold">Hello "/u/$userId"!</div>
    </div>
  );
}
