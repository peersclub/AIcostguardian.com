// types/types.ts

export interface ContactFormData {
  email: string;
  mobile?: string;
  user_type?: string;
  message?: string;
}



export interface SupportFormData {
  subject: string;
  identifier: string;
  description?: string;
}
