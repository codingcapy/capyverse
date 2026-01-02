import { Community } from "../../../schemas/communities";
import DOMPurify from "dompurify";

export function CommunitySidebar(props: { community: Community }) {
  return (
    <aside className="hidden 2xl:block sticky top-[110px] h-[calc(100vh-150px)] w-[300px] ml-5 custom-scrollbar bg-[#111111] rounded-xl py-2 overflow-y-auto">
      <div className="my-3 px-5 font-bold">{props.community.communityId}</div>
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
