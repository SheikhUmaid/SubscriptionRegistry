import api from "./api";

const TOKEN_KEY = "zinth_admin_token";
const USER_KEY = "zinth_admin_user";

export const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      if (response.data.admin) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.admin));
      }
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};

export default authService;

