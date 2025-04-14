import { create } from 'zustand';


interface OverdueState {
  readMode: boolean;
  setReadModeState: (value: boolean) => void;
}

export const useCardReadModeStore = create<OverdueState>((set) => ({
  readMode: false, // Initial state for local usage
  setReadModeState: (value: boolean) => set((state) => ({ readMode: value })),
}));
