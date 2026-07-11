import apiClient from "./client";

export const submitContactMessage = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const response = await apiClient.post("/contact/submit", data);
  return response.data;
};
