import api from "./api";

let plansCache = null;

export const subscriptionService = {
  async getPlans() {
    if (!plansCache) {
      plansCache = api
        .get("/subscriptions/plans")
        .then((response) => response.data?.data || [])
        .catch((err) => {
          plansCache = null;
          throw err;
        });
    }
    return plansCache;
  },

  async changePlan(id, data) {
    const response = await api.patch(`/subscriptions/${id}/plan`, data);
    return response.data;
  },

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

