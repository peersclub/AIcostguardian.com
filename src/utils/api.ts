import axios from "axios";
import { ContactFormData, SupportFormData } from "@/types/types";
import { generateWaitlistEmail, sendEmail } from "./emailService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


/*------------------------------------------------------------------------------*/
// Submit waitlist Form with Email Notification
/*------------------------------------------------------------------------------*/
export const submitWailistForm = async (formData: ContactFormData): Promise<any> => {
  try {
    const response = await api.post("/general/waitlist", formData);
    const { status, message, data } = response.data;

    if (status !== 200) {
      throw new Error(message || "Submission failed");
    }

    // Send email notification to support
    try {
      const emailData = generateWaitlistEmail(formData);
      await sendEmail(emailData);
      console.log("Waitlist notification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send waitlist notification email:", emailError);
      // Don't throw error to avoid breaking the main submission flow
    }

    return data;
  } catch (error: any) {
    console.error("Contact form submission error:", error);
    const serverMsg = error?.response?.data?.message;
    throw new Error(serverMsg || "Please check your network and try again");
  }
};

/*------------------------------------------------------------------------------*/
// Submit Contact Form
/*------------------------------------------------------------------------------*/
export const submitContactForm = async (formData: ContactFormData): Promise<any> => {
  try {
    const response = await api.post("/general/waitlist", formData);
    const { status, message, data } = response.data;

    if (status !== 200) {
      throw new Error(message || "Submission failed");
    }

    return data;
  } catch (error: any) {
    console.error("Error:", error);
    const serverMsg = error?.response?.data?.message;
    throw new Error(serverMsg || "Please check your network and try again");
  }
};



/*------------------------------------------------------------------------------*/
// Submit Support Form
/*------------------------------------------------------------------------------*/
export const submitSupportForm = async (formData: SupportFormData): Promise<any> => {
  try {
    const response = await api.post("/general/support", formData, {
      headers: {
        "X-PLATFORM": "android",
      },
    });
    const { status, message, data } = response.data;

    if (status !== 200) {
      throw new Error(message || "Submission failed");
    }

    return data;
  } catch (error: any) {
    console.error("Support form submission error:", error);
    const serverMsg = error?.response?.data?.message;
    throw new Error(serverMsg || "Please check your network and try again");
  }
};



/*------------------------------------------------------------------------------*/
// Fetch a single blog by slug or ID
/*------------------------------------------------------------------------------*/
export const fetchBlog = async (slug: string): Promise<any> => {
  try {
    const response = await api.get(`/blogs/${slug}`);
    const { status, message, data } = response.data;

    if (status !== 200) {
      throw new Error(message || "Failed to fetch blog");
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching blog:", error);
    const serverMsg = error?.response?.data?.message;
    throw new Error(serverMsg || "Failed to fetch blog");
  }
};

/*------------------------------------------------------------------------------*/
// Fetch paginated blogs list
/*------------------------------------------------------------------------------*/
export const fetchBlogs = async ({
  page = 1,
  limit = 10,
  query = "",
}: {
  page?: number;
  limit?: number;
  query?: string;
}): Promise<{
  data: any[];
  meta: { total_pages: number; current_page: number };
}> => {
  try {
    const response = await api.get("/blogs", {
      headers: {
        "X-Requested-Page": page.toString(),
        "X-Requested-Limit": limit.toString(),
      },
      params: { q: query },
    });

    const total_pages = parseInt(response.headers["x-total-pages"] || "1", 10);
    const current_page = parseInt(response.headers["x-current-page"] || page.toString(), 10);

    return {
      data: response.data.data || [],
      meta: { total_pages, current_page },
    };
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    throw new Error("Failed to fetch blogs");
  }
};
