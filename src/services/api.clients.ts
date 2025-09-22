import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { enviornment, URLs } from './api.enviroments';
import { store } from '../redux/store';

// Base Axios configuration
const axiosConfig: AxiosRequestConfig = {
  baseURL: URLs[enviornment].apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
};

const axiosAuthConfig: AxiosRequestConfig = {
  baseURL: URLs[enviornment].apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create instances
export const baseClient: AxiosInstance = axios.create(axiosConfig);
export const authClient: AxiosInstance = axios.create(axiosAuthConfig);

// Apply interceptors to a client
const applyInterceptors = (
  client: AxiosInstance,
  withAuth: boolean = false,
) => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (withAuth) {
        const accessToken = store.getState().auth.token;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }

      console.log('📤 [REQUEST]');
      console.log(`➡️ URL: ${config.baseURL}${config.url}`);
      console.log(`🔁 Method: ${config.method?.toUpperCase()}`);
      console.log('🧾 Headers:', config.headers);
      if (config.data) {
        console.log('📦 Payload:', config.data);
      }

      return config;
    },
    (error: AxiosError) => {
      console.error('🛑 [REQUEST ERROR]', error);
      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('✅ [RESPONSE]');
      console.log(`⬅️ URL: ${response.config.baseURL}${response.config.url}`);
      console.log(`📊 Status: ${response.status}`);
      console.log('📥 Data:', response.data);
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        console.error('❌ [ERROR RESPONSE]');
        console.error(`URL: ${error.config?.baseURL}${error.config?.url}`);
        console.error(`Status: ${error.response.status}`);
        console.error('Error Data:', error.response.data);

        // 🚫 Removed Alert and forceLogout
        if (error.response.status === 401) {
          console.warn('⚠️ Unauthorized (401) - Token might be expired.');
        }

      } else if (error.request) {
        console.error('⚠️ [NO RESPONSE]');
        console.error('Request:', error.request);
      } else {
        console.error('🚨 [REQUEST SETUP ERROR]');
        console.error('Message:', error.message);
      }
      return Promise.reject(error);
    },
  );
};

// Apply interceptors to both clients
applyInterceptors(baseClient, true);
applyInterceptors(authClient, true);

export default { baseClient, authClient };
