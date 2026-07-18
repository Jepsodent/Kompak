import {create} from "zustand";
import {persist} from "zustand/middleware";
interface UIState{
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true, //default
            toggleSidebar: () => set((state) => ({sidebarOpen: !state.sidebarOpen})),
            setSidebarOpen: (isOpen) => set({sidebarOpen: isOpen}),
        }),
        {
            name: 'sidebar-storage', //disimpen di local storage with name ini 
        }
    )
);