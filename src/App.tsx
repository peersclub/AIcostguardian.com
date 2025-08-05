import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/terms-and-conditions";
import PrivacyAndPolicies from "./pages/privacy-and-policies";
import FAQs from "./pages/faqs";
import BlogListPage from "@/pages/blogs/BlogListPage";
import BlogDetailPage from "@/pages/blogs/BlogDetailPage";
import Disclaimers from "@/pages/disclaimers";

const queryClient = new QueryClient();

// Create a component to handle analytics inside the Router
const AppWithAnalytics = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/privacy-and-policies" element={<PrivacyAndPolicies />} />
      <Route path="/about-us" element={<About />} />
      <Route path="/disclaimers" element={<Disclaimers />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/blogs" element={<BlogListPage />} />
      <Route path="/blogs/:slug" element={<BlogDetailPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppWithAnalytics />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;