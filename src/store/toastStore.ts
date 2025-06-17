import { create } from 'zustand';
import { Toast } from '../components/ui/Toast';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  }
}));

// Helper functions for easier usage
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  },
  
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'error',
      title,
      message,
      ...options
    });
  },
  
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'warning',
      title,
      message,
      ...options
    });
  },
  
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }
};
