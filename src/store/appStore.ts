import { create } from 'zustand';
import { Course, Enrollment, Wishlist } from '../types';

interface AppStore {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Courses
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Enrollments
  enrollments: Enrollment[];
  setEnrollments: (enrollments: Enrollment[]) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollment: (id: string, enrollment: Partial<Enrollment>) => void;

  // Wishlist
  wishlist: Wishlist[];
  setWishlist: (wishlist: Wishlist[]) => void;
  addToWishlist: (wishlist: Wishlist) => void;
  removeFromWishlist: (courseId: string) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Theme
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  // Courses
  courses: [],
  setCourses: (courses) => set({ courses }),
  addCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
  updateCourse: (id, courseData) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === id ? { ...course, ...courseData } : course
      ),
    })),
  deleteCourse: (id) =>
    set((state) => ({
      courses: state.courses.filter((course) => course.id !== id),
    })),

  // Enrollments
  enrollments: [],
  setEnrollments: (enrollments) => set({ enrollments }),
  addEnrollment: (enrollment) =>
    set((state) => ({ enrollments: [...state.enrollments, enrollment] })),
  updateEnrollment: (id, enrollmentData) =>
    set((state) => ({
      enrollments: state.enrollments.map((enrollment) =>
        enrollment.id === id ? { ...enrollment, ...enrollmentData } : enrollment
      ),
    })),

  // Wishlist
  wishlist: [],
  setWishlist: (wishlist) => set({ wishlist }),
  addToWishlist: (wishlistItem) =>
    set((state) => ({ wishlist: [...state.wishlist, wishlistItem] })),
  removeFromWishlist: (courseId) =>
    set((state) => ({
      wishlist: state.wishlist.filter((item) => item.courseId !== courseId),
    })),

  // UI State
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Search & Filters
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: '',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  selectedLevel: '',
  setSelectedLevel: (level) => set({ selectedLevel: level }),
}));