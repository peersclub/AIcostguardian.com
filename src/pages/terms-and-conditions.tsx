import React from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      <section className="bg-background px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-midnight text-3xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-slate mb-8">Version 2.0 - Effective Date: April 28, 2025</p>

          <p className="mb-6 text-slate">
            By accessing or using the AssetWorks platform ("the Platform"), you agree to these Terms and Conditions ("Terms"). These Terms govern your use of services provided by AssetWorks, a product operated by AstWrks Technologies Private Limited ("the Company").
          </p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">1. Account Registration and Security</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">1.1 Registration Requirements</h3>
          <p className="text-slate mb-4">To use certain features of the Platform, you must create an account by providing accurate and complete information. You must be at least 18 years old to register.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">1.2 Account Security</h3>
          <p className="text-slate mb-2">You are solely responsible for:</p>
          <ul className="text-slate list-disc pl-6 mb-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access or security breaches</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">1.3 Account Restrictions</h3>
          <p className="text-slate mb-2">You agree not to:</p>
          <ul className="text-slate list-disc pl-6 mb-4">
            <li>Create multiple accounts to circumvent restrictions</li>
            <li>Share your account with third parties</li>
            <li>Use false identification information or impersonate others</li>
            <li>Use the Platform while your account is suspended or terminated</li>
          </ul>

          <h2 className="text-midnight font-semibold mt-8 mb-4">2. User Content and Conduct</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">2.1 User-Generated Content</h3>
          <p className="text-slate mb-4">When you post, upload, or submit content to AssetWorks ("User Content"), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of providing and improving our services.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">2.2 Content Restrictions</h3>
          <p className="text-slate mb-2">You agree not to post content that:</p>
          <ul className="text-slate list-disc pl-6 mb-4">
            <li>Violates intellectual property rights of others</li>
            <li>Is false, misleading, or deceptive</li>
            <li>Constitutes unauthorized disclosure of confidential information</li>
            <li>Is illegal, harmful, abusive, or harassing</li>
            <li>Promotes discrimination or violence</li>
            <li>Contains malware, spyware, or other harmful code</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">2.3 Prohibited Activities</h3>
          <ul className="text-slate list-disc pl-6 mb-4">
            <li>Use the Platform for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
            <li>Interfere with the proper functioning of the Platform</li>
            <li>Engage in data scraping or use automated methods to access the Platform without permission</li>
            <li>Misrepresent your affiliation with AssetWorks</li>
            <li>Impersonate any person or entity</li>
          </ul>

          <h2 className="text-midnight font-semibold mt-8 mb-4">3. Services and Platform Usage</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">3.1 Platform Modifications</h3>
          <p className="text-slate mb-4">We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time, with or without notice. We are not liable for any such modifications, suspensions, or discontinuations.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">3.2 Service Availability</h3>
          <p className="text-slate mb-4">While we strive for continuous availability, we do not guarantee uninterrupted access to the Platform. Temporary interruptions may occur due to maintenance, updates, or factors beyond our control.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">5. Data Usage and Privacy</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">5.1 Data Collection</h3>
          <p className="text-slate mb-4">We collect and process your personal information as described in our Privacy Policy, which is incorporated into these Terms by reference.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">5.2 Communication</h3>
          <p className="text-slate mb-4">By registering, you consent to receive communications from AssetWorks, including product updates, research features, newsletters, and promotional content. You may opt-out of marketing communications at any time.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">6. Intellectual Property Rights</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">6.1 AssetWorks Property</h3>
          <p className="text-slate mb-4">All content, features, and functionality of the Platform, including text, graphics, logos, icons, images, and software, are owned by AssetWorks or its licensors and are protected by copyright, trademark, and other intellectual property laws.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">6.2 Limited License</h3>
          <p className="text-slate mb-4">We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial purposes in accordance with these Terms.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">6.3 Feedback</h3>
          <p className="text-slate mb-4">If you provide suggestions, ideas, or feedback ("Feedback"), we may use this Feedback without restriction and without compensating you.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">7. Investment Disclaimer</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">7.1 No Investment Advice</h3>
          <p className="text-slate mb-4">AssetWorks is not registered with the Securities and Exchange Board of India (SEBI) or any other regulatory authority as an Investment Advisor. The Platform does not provide investment advice or recommendations.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">7.2 Risk Acknowledgment</h3>
          <p className="text-slate mb-4">Investing in securities involves risk, including the potential loss of principal. Past performance is not indicative of future results.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">7.3 No Liability</h3>
          <p className="text-slate mb-4">Any investment decisions you make are your sole responsibility. AssetWorks and its affiliates, employees, or contributors will not be liable for any loss or damage arising from the use of information on the platform.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">7.4 Independent Research</h3>
          <p className="text-slate mb-4">We strongly encourage all users to conduct independent research and consult a licensed financial advisor before making investment decisions.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">8.1 Disclaimer of Warranties</h3>
          <p className="text-slate mb-4">THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">8.2 Limitation of Liability</h3>
          <p className="text-slate mb-4">TO THE MAXIMUM EXTENT PERMITTED BY LAW, ASSETWORKS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF THE PLATFORM.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">8.3 Cap on Liability</h3>
          <p className="text-slate mb-4">IN NO EVENT SHALL OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE PLATFORM EXCEED THE AMOUNT PAID BY YOU TO ASSETWORKS DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">9. Termination</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">9.1 Termination by User</h3>
          <p className="text-slate mb-4">You may terminate your account at any time by following the instructions on the Platform or by contacting us.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">9.2 Termination by AssetWorks</h3>
          <p className="text-slate mb-4">We may suspend or terminate your account for any reason, including violation of these Terms, without prior notice.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">9.3 Effect of Termination</h3>
          <p className="text-slate mb-4">Upon termination, your right to access and use the Platform will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">10. Miscellaneous</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">10.1 Governing Law</h3>
          <p className="text-slate mb-4">These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">10.2 Changes to Terms</h3>
          <p className="text-slate mb-4">We may modify these Terms at any time. We will notify you of material changes via email or through the Platform. Your continued use of the Platform after such modifications constitutes your acceptance of the updated Terms.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">10.3 Severability</h3>
          <p className="text-slate mb-4">If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">10.4 Entire Agreement</h3>
          <p className="text-slate mb-4">These Terms, together with our Privacy Policy and any other agreements expressly incorporated by reference, constitute the entire agreement between you and AssetWorks concerning the Platform.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">10.5 No Waiver</h3>
          <p className="text-slate mb-4">Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">10.6 Contact Information</h3>
          <p className="text-slate mb-4">For questions about these Terms, please contact us at <a href="mailto:founders@assetworks.ai" className="text-blue-500 underline">founders@assetworks.ai</a>.</p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
