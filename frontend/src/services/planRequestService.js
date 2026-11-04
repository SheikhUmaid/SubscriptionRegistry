import api from "./api";

export const planRequestService = {
  async getPlanRequests(status) {
    const response = await api.get("/plan-requests", {
      params: status && status !== "all" ? { status } : {},
    });
    return response.data?.data || [];
  },

  async approve(id, data = {}) {
    const response = await api.patch(`/plan-requests/${id}/approve`, data);
    return response.data;
  },

  async reject(id, note = "") {
    const response = await api.patch(`/plan-requests/${id}/reject`, { note });
    return response.data;
  },
};

export default planRequestService;
