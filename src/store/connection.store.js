import { create } from 'zustand';

export const useConnectionStore = create(set => ({
  status: 'online', // online | contingency | error
  lastChecked: null,

  setStatus: status =>
    set({ status, lastChecked: new Date().toISOString() }),
}));
