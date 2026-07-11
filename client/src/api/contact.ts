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

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "resolved";
  createdAt: string;
}

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const { data } = await apiClient.get("/contact");
  return data;
};

export const replyToContactMessage = async (id: string, replyMessage: string): Promise<any> => {
  const { data } = await apiClient.post(`/contact/${id}/reply`, { replyMessage });
  return data;
};
