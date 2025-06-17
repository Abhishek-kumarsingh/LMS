import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useThemeStore } from '../../store/themeStore';
import { useToastStore } from '../../store/toastStore';
import Header from './Header';
import Sidebar from './Sidebar';
import { ToastContainer } from '../ui/Toast';

const Layout: React.FC = () => {
  const { isDarkMode } = useAppStore();
  const { initializeTheme } = useThemeStore();
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    // Initialize theme system
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        position="top-right"
      />
    </div>
  );
};

export default Layout;