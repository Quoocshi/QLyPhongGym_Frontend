// src/utils/tokenService.js
const TOKEN_KEY = 'access_token';

export const tokenService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  },

  setToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
