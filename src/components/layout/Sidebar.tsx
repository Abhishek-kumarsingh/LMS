import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  X,
  Heart,
  Award,
  User
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const location = useLocation();

  if (!user) return null;

  const getMenuItems = () => {
    const commonItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: BookOpen, label: 'Courses', path: '/courses' },
      { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    ];

    switch (user.role) {
      case 'STUDENT':
        return [
          ...commonItems,
          { icon: BookOpen, label: 'My Courses', path: '/my-courses' },
          { icon: Award, label: 'My Certificates', path: '/my-certificates' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      case 'INSTRUCTOR':
        return [
          ...commonItems,
          { icon: Plus, label: 'Create Course', path: '/instructor/create-course' },
          { icon: BarChart3, label: 'Analytics', path: '/instructor/analytics' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'ADMIN':
        return [
          { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
          { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
          { icon: Settings, label: 'Settings', path: '/admin/settings' },
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <span className="text-xl font-bold text-gray-900 dark:text-white">Menu</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64">
              <SidebarContent />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;