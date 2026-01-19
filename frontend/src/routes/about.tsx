import { createFileRoute } from "@tanstack/react-router";
import logo from "/capyness.png";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pt-[70px] mx-auto">
      <div className="md:flex pt-[100px] px-5 lg:px-0 lg:pl-[170px] max-w-[900px]">
        <div className="">
          <div className="text-5xl font-bold mb-5">Welcome to Capyverse</div>
          <div className="text-lg mr-5">
            Capyverse is a user-generated content social platform. You can post
            anything you like and join any community of interest. Don't see the
            community you are looking for? Make it yourself! Interact with other
            posts by voting and commenting on them.
          </div>
        </div>
        <img
          src={logo}
          alt=""
          className="pt-10 md:pt-0 mx-auto w-auto self-start"
        />
      </div>
    </div>
  );
}
