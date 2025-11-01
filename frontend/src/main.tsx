import { createRoot } from "react-dom/client";
import "./index.css";
import { Link, RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Auth from "./components/auth/Auth";

export const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: () => {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-3">
          <p className="text-xl md:text-4xl text-center pt-10 md:pt-32">
            Whoops! This isn't what you're looking for 😅
          </p>
          <div className="flex flex-col my-10 md:my-20 mx-auto w-[250px]">
            <Link
              to="/"
              className="py-2 px-10 rounded bg-cyan-500 text-center tracking-widest hover:bg-cyan-300 hover:text-[#202020] transition-all ease-in-out duration-300 text-white secondary-font font-bold"
            >
              LET'S GO HOME
            </Link>
          </div>
        </main>
      </div>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Auth>
      <RouterProvider router={router} />
    </Auth>
  </QueryClientProvider>
);
