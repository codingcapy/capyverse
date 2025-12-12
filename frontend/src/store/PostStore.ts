import { create } from "zustand";

const usePostStore = create<{
  editPostModePointer: number;
  setEditPostModePointer: (args: number) => void;
  editCommentModePointer: number;
  setEditCommentModePointer: (args: number) => void;
  searchContent: string;
  setSearchContent: (args: string) => void;
}>((set, get) => ({
  editPostModePointer: 0,
  setEditPostModePointer: (args) => set({ editPostModePointer: args }),
  editCommentModePointer: 0,
  setEditCommentModePointer: (args) => set({ editCommentModePointer: args }),
  searchContent: "",
  setSearchContent: (args) => set({ searchContent: args }),
}));

export default usePostStore;
