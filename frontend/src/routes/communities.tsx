import { createFileRoute, Link } from "@tanstack/react-router";
import { getCommunitiesInfiniteQueryOptions } from "../lib/api/communities";
import { useInfiniteQuery } from "@tanstack/react-query";
import defaultProfile from "/capypaul01.jpg";
import DOMPurify from "dompurify";

export const Route = createFileRoute("/communities")({
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery(getCommunitiesInfiniteQueryOptions());

  const communities = data?.pages.flatMap((p) => p.communities) ?? [];

  return (
    <div className="pt-[88px] px-2 lg:px-0 mx-auto w-full ">
      <div className="text-xl text-center md:text-3xl font-bold mb-10">
        Capyverse Communities
      </div>
      <div className="lg:pl-[300px] sm:grid grid-cols-4 gap-5 2xl:w-[95%]">
        {isLoading ? (
          <div></div>
        ) : error ? (
          <div></div>
        ) : communities.length > 0 ? (
          communities.map((community) => (
            <div className="flex my-5 sm:my-0" key={community.communityId}>
              <Link
                to="/c/$communityId"
                params={{
                  communityId: community.communityId,
                }}
              >
                <div className="flex hover:text-cyan-500 transition-all ease-in-out duration-300">
                  <img
                    src={community.icon ? community.icon : defaultProfile}
                    alt=""
                    className="rounded-full w-[30px] h-[30px]"
                  />
                  <div>
                    <div className="ml-1 pt-1 font-bold">
                      c/{community.communityId}
                    </div>
                    <div
                      className="line-clamp-1 text-[#999999]"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(community.description, {
                          ALLOWED_TAGS: [
                            "b",
                            "i",
                            "u",
                            "s",
                            "strong",
                            "em",
                            "ul",
                            "ol",
                            "li",
                            "p",
                            "a",
                          ],
                          ALLOWED_ATTR: ["href", "target", "rel"],
                          FORBID_ATTR: ["style"],
                        }),
                      }}
                    ></div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div>
            <div className="text-lg md:text-xl font-bold text-center mt-10">
              No communities yet!
            </div>
            <div className="text-center my-2">
              Join a community to see popular posts about topics that interest
              you.
            </div>
          </div>
        )}
      </div>
      {hasNextPage && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-cyan-600 px-5 py-2 rounded-full font-bold cursor-pointer hover:bg-cyan-500 transition-all ease-in-out duration-300 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
