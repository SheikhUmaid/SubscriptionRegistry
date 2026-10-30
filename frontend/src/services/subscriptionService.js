import api from "./api";

export const subscriptionService = {
  async getSubscriptions() {
    const response = await api.get("/subscriptions");
    return response.data?.data || [];
  },

  async createSubscription(data) {
    const response = await api.post("/subscriptions", data);
    return response.data;
  },

  async extendSubscription(id, data) {
    const response = await api.patch(`/subscriptions/${id}/extend`, data);
    return response.data;
  },

  async suspendSubscription(id) {
    const response = await api.patch(`/subscriptions/${id}/suspend`);
    return response.data;
  },

  async deleteSubscription(id) {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },
};

export default subscriptionService;

