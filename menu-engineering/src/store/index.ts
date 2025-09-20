import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { type State } from "./types";

const useGlobalStore = create<State>()(
  devtools(
    (set) => ({
      isLoading: true,

      setLoadingUser: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: "store",
    }
  )
);

export default useGlobalStore;
