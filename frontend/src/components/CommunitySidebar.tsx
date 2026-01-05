import { Community } from "../../../schemas/communities";
import DOMPurify from "dompurify";
import { FiEdit2 } from "react-icons/fi";
import { getModeratorsQueryOptions } from "../lib/api/communities";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../store/AuthStore";

export function CommunitySidebar(props: { community: Community }) {
  const { user } = useAuthStore();
  const {
    data: moderators,
    isLoading: moderatorsLoading,
    error: moderatorsError,
  } = useQuery(getModeratorsQueryOptions(props.community.communityId));

  return (
    <aside className="hidden 2xl:block sticky top-[110px] h-[calc(100vh-150px)] w-[300px] ml-5 custom-scrollbar bg-[#111111] rounded-xl py-2 overflow-y-auto">
      <div className="flex justify-between">
        <div className="my-3 px-5 font-bold">{props.community.communityId}</div>
        {user ? (
          moderatorsLoading ? (
            <div>Loading...</div>
          ) : moderatorsError ? (
            <div>Error loading moderators</div>
          ) : moderators ? (
            moderators.some((m) => m.userId === user.userId) ? (
              <div className="rounded-full m-2.5 p-2 bg-[#333333] hover:text-cyan-500 transition-all ease-in-out duration-300 cursor-pointer">
                <FiEdit2 size={12} className="" />
              </div>
            ) : (
              ""
            )
          ) : (
            ""
          )
        ) : (
          ""
        )}
      </div>
      <div
        className="px-5 line-clamp-4"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(props.community.description, {
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
    </aside>
  );
}
