import { useQuery } from "@tanstack/react-query";
import { getRecentPostsQueryOptions } from "../lib/api/posts";

export default function Sidebar() {
  const {
    data: recentPosts,
    isLoading: recentPostsLoading,
    error: recentPostsError,
  } = useQuery(getRecentPostsQueryOptions());
  return (
    <aside className="hidden 2xl:block sticky top-[110px] h-[calc(100vh-150px)] w-[300px] ml-5 overflow-y-auto custom-scrollbar">
      <div className="bg-[#111111] rounded-xl pt-2 overflow-y-auto">
        <div className="my-3 px-5">RECENT POSTS</div>
        {recentPostsLoading ? (
          <div className="px-5 border-b border-[#222222] py-3">Loading...</div>
        ) : recentPostsError ? (
          <div className="px-5 border-b border-[#222222] py-3">
            Error fetching recent posts
          </div>
        ) : recentPosts ? (
          recentPosts.map((post) => (
            <div className="px-5 border-b border-[#222222] py-3">
              <div>{`${post.createdAt}`}</div>
              <div className="my-2 font-bold">{post.title}</div>
            </div>
          ))
        ) : (
          <div></div>
        )}
      </div>
    </aside>
  );
}
