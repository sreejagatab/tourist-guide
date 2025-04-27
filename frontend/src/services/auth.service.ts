import api from './api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  token: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

const AuthService = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<User> => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    
    // Update stored user data
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  changePassword: async (data: PasswordChangeData): Promise<{ message: string }> => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },
};

export default AuthService;
