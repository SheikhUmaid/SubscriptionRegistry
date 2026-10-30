import api from "./api";

export const renewalService = {
  async getRenewals(params = {}) {
    const query = new URLSearchParams();
    if (params.deploymentId) query.append("deploymentId", params.deploymentId);
    if (params.customerId) query.append("customerId", params.customerId);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/renewals${queryString}`);
    return response.data?.data || [];
  },

  async deleteRenewal(id) {
    const response = await api.delete(`/renewals/${id}`);
    return response.data;
  },
};

export default renewalService;

