import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <div className="flex flex-col min-h-screen bg-[#222222] text-white p-2">
        <Header />
        <Outlet />
      </div>
    </React.Fragment>
  );
}
