import api from './api';

export const authService = {
  login: async (username: string, password: string) => {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  register: async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      phone_number: phoneNumber || null,
    });
    return response.data;
  },

  googleLogin: async (credential: string) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  },
};
