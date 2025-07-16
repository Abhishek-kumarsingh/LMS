import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

// Types
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiError {
  error: string;
  details?: any[];
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
              
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(refreshToken: string) {
    return axios.post(`${this.baseURL}/auth/refresh`, {
      refreshToken
    });
  }

  private handleAuthError() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    useAuthStore.getState().logout();
    window.location.href = '/login';
  }

  private handleApiError(error: any) {
    const { addToast } = useToastStore.getState();
    
    if (error.response?.data?.error) {
      addToast(error.response.data.error, 'error');
    } else if (error.message) {
      addToast(error.message, 'error');
    } else {
      addToast('An unexpected error occurred', 'error');
    }
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    return this.post('/auth/register', userData);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return this.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string) {
    return this.post('/auth/verify-email', { token });
  }

  // User endpoints
  async getCurrentUser() {
    return this.get('/users/me');
  }

  async updateProfile(data: any) {
    return this.put('/users/me', data);
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Course endpoints
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    level?: string;
    status?: string;
  }) {
    return this.get('/courses', { params });
  }

  async getCourse(id: string) {
    return this.get(`/courses/${id}`);
  }

  async createCourse(courseData: any) {
    return this.post('/courses', courseData);
  }

  async updateCourse(id: string, courseData: any) {
    return this.put(`/courses/${id}`, courseData);
  }

  async deleteCourse(id: string) {
    return this.delete(`/courses/${id}`);
  }

  async enrollInCourse(id: string) {
    return this.post(`/courses/${id}/enroll`);
  }

  async unenrollFromCourse(id: string) {
    return this.delete(`/courses/${id}/enroll`);
  }

  async publishCourse(id: string, isPublished: boolean) {
    return this.patch(`/courses/${id}/publish`, { isPublished });
  }

  // Lesson endpoints
  async getLessons(courseId: string) {
    return this.get(`/lessons?courseId=${courseId}`);
  }

  async getLesson(id: string) {
    return this.get(`/lessons/${id}`);
  }

  async createLesson(lessonData: any) {
    return this.post('/lessons', lessonData);
  }

  async updateLesson(id: string, lessonData: any) {
    return this.put(`/lessons/${id}`, lessonData);
  }

  async deleteLesson(id: string) {
    return this.delete(`/lessons/${id}`);
  }

  async markLessonComplete(id: string) {
    return this.post(`/lessons/${id}/complete`);
  }

  // Assignment endpoints
  async getAssignments(courseId?: string) {
    const params = courseId ? { courseId } : {};
    return this.get('/assignments', { params });
  }

  async getAssignment(id: string) {
    return this.get(`/assignments/${id}`);
  }

  async createAssignment(assignmentData: any) {
    return this.post('/assignments', assignmentData);
  }

  async updateAssignment(id: string, assignmentData: any) {
    return this.put(`/assignments/${id}`, assignmentData);
  }

  async deleteAssignment(id: string) {
    return this.delete(`/assignments/${id}`);
  }

  async submitAssignment(id: string, submissionData: any) {
    return this.post(`/assignments/${id}/submit`, submissionData);
  }

  // Grade endpoints
  async getGrades(courseId?: string) {
    const params = courseId ? { courseId } : {};
    return this.get('/grades', { params });
  }

  async gradeSubmission(submissionId: string, gradeData: any) {
    return this.post(`/grades/submission/${submissionId}`, gradeData);
  }

  // Discussion endpoints
  async getDiscussions(courseId: string) {
    return this.get(`/discussions?courseId=${courseId}`);
  }

  async getDiscussion(id: string) {
    return this.get(`/discussions/${id}`);
  }

  async createDiscussion(discussionData: any) {
    return this.post('/discussions', discussionData);
  }

  async createPost(discussionId: string, content: string) {
    return this.post(`/discussions/${discussionId}/posts`, { content });
  }

  async createReply(postId: string, content: string) {
    return this.post(`/discussions/posts/${postId}/replies`, { content });
  }

  // Calendar endpoints
  async getEvents(startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.get('/calendar/events', { params });
  }

  async createEvent(eventData: any) {
    return this.post('/calendar/events', eventData);
  }

  async updateEvent(id: string, eventData: any) {
    return this.put(`/calendar/events/${id}`, eventData);
  }

  async deleteEvent(id: string) {
    return this.delete(`/calendar/events/${id}`);
  }

  // Analytics endpoints
  async getAnalytics(type: string, params?: any) {
    return this.get(`/analytics/${type}`, { params });
  }

  async getDashboardData() {
    return this.get('/analytics/dashboard');
  }

  // Upload endpoints
  async uploadFile(file: File, type: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return this.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Stream endpoints
  async getStreams(params?: any) {
    return this.get('/streams', { params });
  }

  async createStream(streamData: any) {
    return this.post('/streams', streamData);
  }

  async joinStream(id: string) {
    return this.post(`/streams/${id}/join`);
  }

  async endStream(id: string) {
    return this.post(`/streams/${id}/end`);
  }

  // Notification endpoints
  async getNotifications() {
    return this.get('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.patch(`/notifications/${id}/read`);
  }

  async markAllNotificationsRead() {
    return this.patch('/notifications/read-all');
  }

  // Health check
  async healthCheck() {
    return axios.get(`${this.baseURL.replace('/api', '')}/health`);
  }
}

export const apiService = new ApiService();
export default apiService;
