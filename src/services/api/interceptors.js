import { http } from './http';

http.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('❌ Error de conexión con el backend');
    }
    return Promise.reject(error);
  }
);
