import api from "./api";

export const deploymentService = {
  async getDeployments() {
    const response = await api.get("/deployments");
    return response.data?.data || [];
  },

  async createDeployment(data) {
    const response = await api.post("/deployments", data);
    return response.data; // { success: true, message, data: { deployment, apiKey } }
  },

  async deleteDeployment(id) {
    const response = await api.delete(`/deployments/${id}`);
    return response.data;
  },
};

export default deploymentService;

