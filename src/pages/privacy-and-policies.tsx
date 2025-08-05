import React from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyAndPolicies() {
  return (
    <div className="min-h-screen bg-white">
      {/*Header*/}
      <Header />
      <section id="vision" className="bg-background px-4 md:px-6 py-12 md:py-20">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-midnight text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="mb-8">Effective Date: April 28, 2025</p>

          <p className="mb-6">
            This Privacy Policy explains how AssetWorks ("we," "our," or "us") collects, uses, shares,
            and protects your personal information when you use our platform, operated by AstWrks Technologies Private Limited.
          </p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <h3 className="text-midnight font-semibold mb-2 text-xl">1.1 Personal Information</h3>
          <p className="mb-2">When you register or use our platform, we may collect:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Identity and Contact Data: Name, email address, phone number, user ID</li>
            <li>Account Information: Login credentials, profile preferences, avatar</li>
            <li>Payment Information: Credit card details, billing address, transaction history</li>
            <li>Inputs and Outputs: Research notes, documents, visualizations, and AI interactions</li>
            <li>Communication Preferences: Email settings, notification options</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">1.2 Usage Data</h3>
          <p className="mb-2">We collect technical and usage information such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Device Information: IP address, browser type, operating system, device type</li>
            <li>Log Data: Access times, pages visited, features used, clicks, scrolling behavior</li>
            <li>Activity Data: Time spent on platform, research patterns, tool usage, interactions</li>
            <li>Location Data: General location based on IP address (not precise location)</li>
            <li>Referral Data: How you found our platform</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">1.3 Data From Third Parties</h3>
          <p className="mb-2">We may receive information from:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Third-party sign-in services (if you connect your account)</li>
            <li>Financial data providers (for research data)</li>
            <li>Business partners and affiliates</li>
            <li>Public databases and sources</li>
          </ul>

          <h2 className="text-midnight font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-2">We use your personal information to:</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">2.1 Provide and Improve Services</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Create and manage your account</li>
            <li>Deliver platform functionality</li>
            <li>Process payments and subscriptions</li>
            <li>Personalize your experience</li>
            <li>Improve platform features</li>
            <li>Analyze usage patterns and trends</li>
            <li>Develop new features and services</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">2.2 Communication</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Send transactional emails and notifications</li>
            <li>Provide customer support</li>
            <li>Deliver updates about platform changes</li>
            <li>Send marketing communications (with consent)</li>
            <li>Respond to your inquiries</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">2.3 Security and Compliance</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Protect against fraud and unauthorized access</li>
            <li>Debug and fix platform issues</li>
            <li>Enforce our Terms and policies</li>
            <li>Comply with legal obligations</li>
            <li>Establish, exercise, or defend legal claims</li>
          </ul>

          <h2 className="text-midnight font-semibold mt-8 mb-4">3. Legal Basis for Processing</h2>
          <p className="mb-2">We process your personal information based on the following legal grounds:</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">3.1 Performance of Contract</h3>
          <p className="mb-4">Processing necessary to provide our services and fulfill our contractual obligations to you.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">3.2 Legitimate Interests</h3>
          <p className="mb-2">Processing necessary for our legitimate interests, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Operating and improving our platform</li>
            <li>Ensuring security and preventing fraud</li>
            <li>Marketing our services</li>
            <li>Analyzing usage patterns</li>
            <li>Business operations and management</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">3.3 Consent</h3>
          <p className="mb-2">Processing based on your specific consent, such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Marketing communications</li>
            <li>Use of certain cookies</li>
            <li>Processing of sensitive data (if applicable)</li>
          </ul>
          <p className="mb-4">You may withdraw consent at any time by contacting us or using platform controls.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">3.4 Legal Obligations</h3>
          <p className="mb-4">Processing necessary to comply with our legal obligations.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">4. How We Share Your Information</h2>

          <h3 className="text-midnight font-semibold mb-2 text-xl">4.1 Service Providers</h3>
          <p className="mb-2">We share information with trusted third parties who perform services on our behalf:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Cloud hosting providers</li>
            <li>Payment processors</li>
            <li>Analytics providers</li>
            <li>Customer support services</li>
            <li>Email service providers</li>
            <li>Marketing partners</li>
          </ul>

          <h3 className="text-midnight font-semibold mb-2 text-xl">4.2 Business Transfers</h3>
          <p className="mb-4">If we're involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">4.3 Legal Requirements</h3>
          <p className="mb-4">We may disclose your information if required by law, government request, or when necessary to protect our rights, safety, or property.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">4.4 With Your Consent</h3>
          <p className="mb-4">We may share your information with third parties when you explicitly consent to such sharing.</p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">4.5 Not For Sale</h3>
          <p className="mb-4">We do not sell your personal information to third parties for monetary or other valuable consideration.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">5. Data Retention</h2>
          <p className="mb-2">We retain your personal data only for as long as necessary to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide our services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce agreements</li>
          </ul>
          <p className="mb-4">When data is no longer needed, we securely delete or anonymize it.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
          <p className="mb-2">Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access and Portability</li>
            <li>Correction and Deletion</li>
            <li>Restriction and Objection</li>
            <li>Consent Withdrawal</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, contact us at{" "}
            <a href="mailto:founders@assetworks.ai" className="text-blue-500 underline">founders@assetworks.ai</a>.
            We'll respond to your request within 30 days.
          </p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">7. International Data Transfers</h2>
          <p className="mb-2">Your information may be transferred to and processed in countries outside your country of residence, including the United States. These countries may have different data protection laws.</p>
          <p className="mb-2">When we transfer personal data outside your country, we implement appropriate safeguards, such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Standard contractual clauses approved by relevant authorities</li>
            <li>Ensuring recipients adhere to binding corporate rules</li>
            <li>Transferring to countries with adequate data protection laws</li>
          </ul>

          <h2 className="text-midnight font-semibold mt-8 mb-4">8. Data Security</h2>
          <p className="mb-2">We implement technical and organizational measures to protect your data, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of sensitive data</li>
            <li>Access controls and authentication</li>
            <li>Regular security assessments</li>
            <li>Training for our personnel</li>
            <li>Incident response plans</li>
          </ul>
          <p className="mb-4">However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">9. Children's Privacy</h2>
          <p className="mb-4">AssetWorks is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we learn that we have collected personal data from a child, we will take steps to delete such information.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="mb-2">We may update this Privacy Policy from time to time. We will notify you of any significant changes by:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Email notification (for registered users)</li>
            <li>Notice on our website or platform</li>
            <li>Other appropriate means</li>
          </ul>
          <p className="mb-4">Your continued use of our platform after such modifications constitutes your acknowledgment of the modified Policy.</p>

          <h2 className="text-midnight font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p className="mb-4">
            For any privacy-related questions or to exercise your rights, please contact:<br />
            Data Protection Officer<br />
            Email: <a href="mailto:privacy@assetworks.ai" className="text-blue-500 underline">privacy@assetworks.ai</a><br />
            AstWrks Technologies Private Limited<br />
            Address: Bengaluru, Karnataka, India
          </p>
        </div>
      </section>
      {/*Footer*/}
      <Footer />
    </div>
  );
}
