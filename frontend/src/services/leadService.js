import api from "./api";

export const leadService = {
  async getLeads(status) {
    const response = await api.get("/leads", {
      params: status && status !== "all" ? { status } : undefined,
    });
    return response.data?.data || [];
  },

  async updateLead(id, data) {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data?.data;
  },

  async deleteLead(id) {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};

export default leadService;
