import os

base_dir = r'c:\Users\acer\OneDrive\Desktop\FinSight(1)\frontend'
src_dir = os.path.join(base_dir, 'src')

files = {
    'src/api/auth.js': '''import client from "./client";

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
''',
    'src/api/expenses.js': '''import client from "./client";

export const expensesAPI = {
  getAll: (params) => client.get("/expenses", { params }),
  getById: (id) => client.get(/expenses/),
  create: (data) => client.post("/expenses", data),
  update: (id, data) => client.put(/expenses/, data),
  delete: (id) => client.delete(/expenses/),
};
''',
    'src/api/budget.js': '''import client from "./client";

export const budgetAPI = {
  getOverview: (params) => client.get("/budget", { params }),
  create: (data) => client.post("/budget", data),
  update: (id, data) => client.put(/budget/, data),
  delete: (id) => client.delete(/budget/),
};
''',
    'src/api/goals.js': '''import client from "./client";

export const goalsAPI = {
  getAll: () => client.get("/goals"),
  create: (data) => client.post("/goals", data),
  addContribution: (id, amount) => client.post(/goals//contribution, { amount }),
  delete: (id) => client.delete(/goals/),
};
''',
    'src/api/analytics.js': '''import client from "./client";

export const analyticsAPI = {
  getDashboardStats: () => client.get("/analytics/dashboard"),
  getSpendingTrends: (params) => client.get("/analytics/trends", { params }),
  getInsights: () => client.get("/analytics/insights"),
  getAnomalies: () => client.get("/analytics/anomalies"),
};
''',
    'src/api/upload.js': '''import client from "./client";

export const uploadAPI = {
  uploadFile: (formData) => client.post("/upload/statements", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  confirmUpload: (data) => client.post("/upload/confirm", data),
};
''',
    'src/api/notifications.js': '''import client from "./client";

export const notificationsAPI = {
  getAll: () => client.get("/notifications"),
  markAsRead: (id) => client.put(/notifications//read),
  markAllAsRead: () => client.put("/notifications/read-all"),
};
''',
    'src/api/reports.js': '''import client from "./client";

export const reportsAPI = {
  getAll: () => client.get("/reports"),
  generate: (params) => client.post("/reports/generate", params, { responseType: 'blob' }),
};
''',
    'src/context/ThemeContext.jsx': '''import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
''',
    'src/hooks/useExpenses.js': '''import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesAPI } from "../api/expenses";

export const useExpenses = (params) => {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => expensesAPI.getAll(params).then(res => res.data),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => expensesAPI.create(data),
    onSuccess: () => queryClient.invalidateQueries(["expenses"]),
  });
};
''',
    'src/hooks/useBudget.js': '''import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetAPI } from "../api/budget";

export const useBudget = (params) => {
  return useQuery({
    queryKey: ["budget", params],
    queryFn: () => budgetAPI.getOverview(params).then(res => res.data),
  });
};
''',
    'src/hooks/useGoals.js': '''import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsAPI } from "../api/goals";

export const useGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: () => goalsAPI.getAll().then(res => res.data),
  });
};
''',
    'src/hooks/useAnalytics.js': '''import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "../api/analytics";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => analyticsAPI.getDashboardStats().then(res => res.data),
  });
};
''',
}

for path, content in files.items():
    os.makedirs(os.path.dirname(os.path.join(base_dir, path)), exist_ok=True)
    with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

print("Part 1 generated.")
