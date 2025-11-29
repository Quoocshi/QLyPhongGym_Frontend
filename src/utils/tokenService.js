// Token management utilities
const TOKEN_KEY = 'auth_token';

export const tokenService = {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set token in localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if token exists
  hasToken() {
    return !!this.getToken();
  }
};