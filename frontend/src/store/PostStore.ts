import { create } from "zustand";

const usePostStore = create<{
  editPostModePointer: number;
  setEditPostModePointer: (args: number) => void;
  editCommentModePointer: number;
  setEditCommentModePointer: (args: number) => void;
}>((set, get) => ({
  editPostModePointer: 0,
  setEditPostModePointer: (args) => set({ editPostModePointer: args }),
  editCommentModePointer: 0,
  setEditCommentModePointer: (args) => set({ editCommentModePointer: args }),
}));

export default usePostStore;
