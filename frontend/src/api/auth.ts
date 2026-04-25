import axios from 'axios';

const API_BASE = 'http://localhost:5020/api';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const registerApi = async (data: RegisterPayload): Promise<AuthResult> => {
  const response = await axios.post(`${API_BASE}/auth/register`, data);
  return response.data;
};

export const loginApi = async (data: LoginPayload): Promise<AuthResult> => {
  const response = await axios.post(`${API_BASE}/auth/login`, data);
  return response.data;
};