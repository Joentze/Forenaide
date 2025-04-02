import { create } from "zustand";

interface ModalStoreState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}
const createModalStore = (initialState = false) => {
  return create<ModalStoreState>()((set) => ({
    isOpen: initialState,
    openModal: () => set(() => ({ isOpen: true })),
    closeModal: () => set(() => ({ isOpen: false })),
    reset: () => set({ isOpen: initialState }),
  }));
};

const applyModalStore = createModalStore();

export { createModalStore, applyModalStore };
