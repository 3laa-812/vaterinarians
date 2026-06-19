// Zustand UI store — sidebar open/close, modal states
// Only UI state here — server data lives in TanStack Query

import { create } from 'zustand'

interface UIState {
  sidebarExpanded: boolean
  toggleSidebar: () => void
  setSidebarExpanded: (value: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: true,
  toggleSidebar: () =>
    set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (value) => set({ sidebarExpanded: value }),
}))
