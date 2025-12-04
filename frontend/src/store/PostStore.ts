import { create } from "zustand";

const usePostStore = create<{
  editModePointer: number;
  setEditModePointer: (args: number) => void;
}>((set, get) => ({
  editModePointer: 0,
  setEditModePointer: (args) => set({ editModePointer: args }),
}));

export default usePostStore;
