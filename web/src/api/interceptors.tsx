import axios from "axios";

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const isUnauthorized = error?.response?.status === 401;
      const isOnLoginPage = window.location.pathname === "/login";
      if (isUnauthorized && !isOnLoginPage) {
        localStorage.removeItem("access_token");
        window.location.assign("/login"); // hard redirect
      }

      return Promise.reject(error);
    }
  );
};