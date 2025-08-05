import React from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';

export default function FAQs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <section className="bg-background px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <FAQAccordion />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
