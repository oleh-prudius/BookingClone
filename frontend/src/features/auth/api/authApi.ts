import { httpClient } from '@shared/api/httpClient';
import type { AuthResponse, User } from '@shared/types';

export interface LoginDto {
  emailOrUserName: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: 'Customer' | 'Realtor';
}

export interface UpdateProfileDto {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
}

export const authApi = {
  register: (dto: RegisterDto): Promise<string> =>
    httpClient.post<string>('/auth/register', dto).then((r) => r.data),

  login: (dto: LoginDto): Promise<AuthResponse> =>
    httpClient.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  updateProfile: (dto: UpdateProfileDto): Promise<User> =>
    httpClient.patch<User>('/auth/profile', dto).then((r) => r.data),

  uploadAvatar: (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient
      .post<User>('/auth/avatar', formData, { headers: { 'Content-Type': undefined } })
      .then((r) => r.data);
  },

  confirmEmail: (userId: number, token: string): Promise<string> =>
    httpClient.post<string>('/auth/confirm-email', { userId, token }).then((r) => r.data),

  resendConfirmation: (email: string): Promise<string> =>
    httpClient.post<string>('/auth/resend-confirmation', { email }).then((r) => r.data),

  forgotPassword: (email: string): Promise<string> =>
    httpClient.post<string>('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (email: string, token: string, newPassword: string): Promise<string> =>
    httpClient.post<string>('/auth/reset-password', { email, token, newPassword }).then((r) => r.data),
};
