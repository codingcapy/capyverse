import { create } from "zustand";

const useNavStore = create<{
  showLeftNav: boolean;
  setShowLeftNav: (args: boolean) => void;
}>((set, get) => ({
  showLeftNav: window.innerWidth > 1100 ? true : false,
  setShowLeftNav: (args) => set({ showLeftNav: args }),
}));

export default useNavStore;
