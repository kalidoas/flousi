import { api } from "./api.js";

export const goalsApi = {
  getGoals: async () => {
    const response = await api.get("/goals");
    return response.data.goals || [];
  },
  createGoal: async (payload) => {
    const response = await api.post("/goals", payload);
    return response.data.goal;
  },
  updateGoal: async (id, payload) => {
    const response = await api.put(`/goals/${id}`, payload);
    return response.data.goal;
  },
  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`);
  },
  contribute: async (id, payload) => {
    const response = await api.post(`/goals/${id}/contribute`, payload);
    return response.data;
  },
  impact: async (id) => {
    const response = await api.get(`/goals/${id}/impact`);
    return response.data;
  },
  achieve: async (id) => {
    const response = await api.put(`/goals/${id}/achieve`);
    return response.data.goal;
  }
};

