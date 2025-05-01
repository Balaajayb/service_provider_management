// src/context/AuthProvider.tsx
import { ReactNode, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.code === "TOKEN_EXPIRED") {
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          toast.error('Session expired. Please login again.');
          
          // Use window.location instead of useNavigate
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return <>{children}</>;
};