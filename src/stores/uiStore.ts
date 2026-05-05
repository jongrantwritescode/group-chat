import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;

  // Bottom sheets / modals
  activeSheet: string | null;
  openSheet: (sheetId: string) => void;
  closeSheet: () => void;

  // Global confirmation dialog
  confirmDialog: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  };
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  activeSheet: null,
  openSheet: (sheetId) => set({ activeSheet: sheetId }),
  closeSheet: () => set({ activeSheet: null }),

  confirmDialog: {
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  },

  openConfirm: (title, message, onConfirm) =>
    set({
      confirmDialog: { open: true, title, message, onConfirm },
    }),

  closeConfirm: () =>
    set((state) => ({
      confirmDialog: { ...state.confirmDialog, open: false, onConfirm: null },
    })),
}));
