import api from "./api";

export const customerService = {
  async getCustomers() {
    const response = await api.get("/customers");
    return response.data?.data || [];
  },

  async createCustomer(data) {
    const response = await api.post("/customers", data);
    return response.data;
  },

  async deleteCustomer(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;

