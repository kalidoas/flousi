import { api } from "./api.js";

export const analyticsApi = {
  byCategory: async (period = "month") => {
    const response = await api.get("/analytics/by-category", { params: { period } });
    return response.data;
  },
  byDay: async (period = "month") => {
    const response = await api.get("/analytics/by-day", { params: { period } });
    return response.data;
  },
  incomeBySource: async (period = "month") => {
    const response = await api.get("/analytics/income-by-source", { params: { period } });
    return response.data;
  },
  totals: async (period = "month") => {
    const response = await api.get("/analytics/totals", { params: { period } });
    return response.data;
  }
};
