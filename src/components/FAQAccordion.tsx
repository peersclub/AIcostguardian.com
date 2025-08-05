import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQAccordion = () => {
  const faqData = [
    {
      question: "What am I agreeing to by signing up on AssetWorks?",
      answer: "By creating an account, you agree to our Terms and Conditions, Privacy Policy, and Usage Policy, which govern how we operate the platform, use your data, and establish rules for platform usage."
    },
    {
      question: "Is AssetWorks registered as an investment advisor?",
      answer: "No. AssetWorks is not registered with SEBI or any financial regulatory authority as an investment advisor. We are a platform for research organization and process improvement—not for personalized investment advice."
    },
    {
      question: "Can I use AssetWorks content to make investment decisions?",
      answer: "All content on AssetWorks is for informational purposes only. You are responsible for your own investment decisions and should consult a licensed advisor before investing."
    },
    {
      question: "What happens if I violate the platform rules?",
      answer: "Depending on the violation, consequences may include content removal, account suspension, or termination. Serious violations may result in legal action."
    },
    {
      question: "Will my personal data be shared or sold?",
      answer: "We do not sell your personal data. Some data may be shared with trusted third-party vendors for necessary services like hosting and analytics—but only as outlined in our Privacy Policy."
    },
    {
      question: "How do I control what emails I receive?",
      answer: "You can unsubscribe from marketing communications using the link in any message. Essential service communications may still be sent."
    },
    {
      question: "Can I delete my account and data?",
      answer: "Yes. You can request account deletion through account settings or by emailing privacy@assetworks.ai. We'll delete your personal data in accordance with our Privacy Policy and applicable laws."
    },
    {
      question: "What happens if AssetWorks changes its terms or policies?",
      answer: "You'll be notified of significant changes via email or platform notification. Continued use confirms your acceptance of updated terms."
    },
    {
      question: "How are my payment details protected?",
      answer: "Payment information is processed through secure, PCI-compliant payment processors. We do not store complete payment card details on our servers."
    },
    {
      question: "What should I do if I find a security vulnerability?",
      answer: "Please report security concerns immediately to founders@assetworks.ai. We appreciate responsible disclosure and will investigate all legitimate reports."
    }
  ];

  return (
    <section id="faq" className="px-4 md:px-6 py-12 md:py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQAccordion; 