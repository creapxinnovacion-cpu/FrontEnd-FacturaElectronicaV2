import axios from 'axios';
import { env } from '@/config/env';

export const http = axios.create({
  baseURL: env.API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});
