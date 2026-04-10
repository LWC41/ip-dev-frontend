/**
 * API客户端配置
 */
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('api_key');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，跳转到登录页
      localStorage.removeItem('api_key');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ============== API接口 ==============

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  api_key: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  personality: string;
  backstory: string;
  visual_config: Record<string, any>;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_data: Record<string, any>;
  output_data: Record<string, any> | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// 用户API
export const userAPI = {
  register: (data: { username: string; email?: string; password: string }) =>
    apiClient.post<User>('/api/v1/users/register', data),
  
  getCurrentUser: () =>
    apiClient.get<User>('/api/v1/users/me'),
};

// 项目API
export const projectAPI = {
  create: (data: {
    name: string;
    description?: string;
    fruit_type: string;
    target_audience: string;
    style: string;
  }) => apiClient.post<Project>('/api/v1/projects', data),
  
  list: () => apiClient.get<Project[]>('/api/v1/projects'),
  
  get: (projectId: string) =>
    apiClient.get<Project>(`/api/v1/projects/${projectId}`),
  
  update: (projectId: string, data: Partial<Project>) =>
    apiClient.put<Project>(`/api/v1/projects/${projectId}`, data),
  
  delete: (projectId: string) =>
    apiClient.delete(`/api/v1/projects/${projectId}`),
};

// 角色API
export const characterAPI = {
  create: (data: {
    project_id: string;
    name: string;
    personality: string;
    backstory: string;
    appearance: Record<string, any>;
  }) => apiClient.post<Character>('/api/v1/characters', data),
  
  list: (projectId: string) =>
    apiClient.get<Character[]>(`/api/v1/projects/${projectId}/characters`),
  
  get: (characterId: string) =>
    apiClient.get<Character>(`/api/v1/characters/${characterId}`),
  
  update: (characterId: string, data: Partial<Character>) =>
    apiClient.put<Character>(`/api/v1/characters/${characterId}`, data),
  
  delete: (characterId: string) =>
    apiClient.delete(`/api/v1/characters/${characterId}`),
};

// 任务API
export const taskAPI = {
  create: (data: {
    project_id?: string;
    task_type: string;
    params: Record<string, any>;
  }) => apiClient.post<Task>('/api/v1/tasks', data),
  
  get: (taskId: string) =>
    apiClient.get<Task>(`/api/v1/tasks/${taskId}`),
  
  list: (projectId?: string) =>
    apiClient.get<Task[]>('/api/v1/tasks', {
      params: projectId ? { project_id: projectId } : {},
    }),
  
  // 轮询任务状态
  poll: async (taskId: string, interval: number = 2000) => {
    while (true) {
      const response = await taskAPI.get(taskId);
      if (
        response.data.status === 'completed' ||
        response.data.status === 'failed'
      ) {
        return response.data;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  },
};
