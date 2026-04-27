import { api } from "./api.js";

export const analyticsApi = {
  byCategory: async (period = "month") => {
    const response = await api.get("/analytics/by-category", { params: { period } });
    return response.data;
  },
  byDay: async (period = "month") => {
    const response = await api.get("/analytics/by-day", { params: { period } });
    return response.data;
  }
};

