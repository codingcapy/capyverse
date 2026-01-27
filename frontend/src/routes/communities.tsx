import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getCommunitiesQueryOptions } from "../lib/api/communities";
import { useQuery } from "@tanstack/react-query";
import defaultProfile from "/capypaul01.jpg";
import DOMPurify from "dompurify";
import z from "zod";

export const Route = createFileRoute("/communities")({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).default(1),
  }),
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const navigate = Route.useNavigate();
  const { page } = Route.useSearch();
  const {
    data: data,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useQuery(getCommunitiesQueryOptions(page));

  return (
    <div className="pt-[88px] px-2 lg:px-0 mx-auto w-full ">
      <div className="text-xl text-center md:text-3xl font-bold mb-10">
        Capyverse Communities
      </div>
      <div className="lg:pl-[300px] sm:grid grid-cols-4 gap-5 2xl:w-[95%]">
        {communitiesLoading ? (
          <div></div>
        ) : communitiesError ? (
          <div></div>
        ) : data ? (
          data.communities.length > 0 ? (
            data.communities.map((community, idx) => (
              <div className="flex my-5 sm:my-0" key={community.communityId}>
                <div className="mr-3 sm:mr-5 pt-2">
                  {(page - 1) * 250 + idx + 1}
                </div>
                <Link
                  to="/c/$communityId"
                  params={{
                    communityId: community.communityId,
                  }}
                  key={community.communityId}
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
          )
        ) : (
          <div></div>
        )}
      </div>
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    page: p,
                  }),
                })
              }
              className={`px-3 py-1 rounded ${
                p === page ? "text-cyan-500" : ""
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
