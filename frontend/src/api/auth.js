import client from "./client";

export const authAPI = {
  signup: (data) => client.post("/auth/signup", data),
  login: (data) => client.post("/auth/login", data),
  logout: () => client.post("/auth/logout"),
  refresh: () => client.post("/auth/refresh"),
  forgotPassword: (email) => client.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => client.post("/auth/reset-password", { token, password }),
  verifyEmail: (token) => client.post("/auth/verify-email", { token }),
  getProfile: () => client.get("/profile"),
  updateProfile: (data) => client.put("/profile", data),
  changePassword: (data) => client.put("/profile/password", data),
};
