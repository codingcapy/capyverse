import * as React from "react";
import {
  Outlet,
  createRootRoute,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Header } from "../components/Header";
import { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <div className="flex flex-col min-h-screen bg-[#222222] text-[#dddddd] p-2">
        <Header />
        <Outlet />
      </div>
    </React.Fragment>
  );
}
