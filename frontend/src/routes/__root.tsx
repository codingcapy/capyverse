import * as React from "react";
import {
  Outlet,
  createRootRoute,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Header } from "../components/Header";
import { QueryClient } from "@tanstack/react-query";
import { ScrollToTop } from "../ScrollToTop";
import { LeftNav } from "../components/LeftNav";
import useNavStore from "../store/NavStore";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { showLeftNav, setShowLeftNav } = useNavStore();

  return (
    <React.Fragment>
      <div className="flex flex-col min-h-screen bg-[#222222] text-[#dddddd]">
        <ScrollToTop />
        <LeftNav />
        <Header />
        <Outlet />
        {window.innerWidth < 1100 && showLeftNav && (
          <div className="fixed inset-0 bg-black opacity-50 z-0"></div>
        )}
      </div>
    </React.Fragment>
  );
}
