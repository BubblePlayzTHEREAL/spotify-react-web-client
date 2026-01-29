import backendAxios from '../backendAxios';

export interface SetupStatus {
  setupComplete: boolean;
}

export interface OAuthUrlResponse {
  authUrl: string;
  codeVerifier: string;
}

export interface CompleteSetupRequest {
  code: string;
  codeVerifier: string;
  sitePassword: string;
}

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const backendAuthService = {
  // Check setup status
  checkSetupStatus: () => backendAxios.get<SetupStatus>('/auth/status'),

  // Get admin OAuth URL
  getAdminOAuthUrl: () => backendAxios.get<OAuthUrlResponse>('/auth/admin/oauth-url'),

  // Complete admin setup
  completeAdminSetup: (data: CompleteSetupRequest) =>
    backendAxios.post<{ success: boolean }>('/auth/admin/complete-setup', data),

  // Guest login
  guestLogin: (data: LoginRequest) => backendAxios.post<LoginResponse>('/auth/guest/login', data),

  // Guest logout
  guestLogout: () => backendAxios.post<{ success: boolean }>('/auth/guest/logout'),

  // Change password
  changePassword: (data: ChangePasswordRequest) =>
    backendAxios.post<{ success: boolean }>('/auth/password/change', data),
};
