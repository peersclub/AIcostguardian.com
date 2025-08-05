import React from "react";
import { Helmet } from "react-helmet-async";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Disclaimers() {
  return (
    <div className="min-h-screen bg-white">

      {/* SEO Metadata */}
      <Helmet>
        <title>Disclaimer | AssetWorks</title>
        <meta
          name="description"
          content="Read the full disclaimer of AssetWorks. We provide research tools, not investment advice. Learn about risks, liability, and legal protections."
        />
        <meta property="og:title" content="Disclaimer | AssetWorks" />
        <meta
          property="og:description"
          content="AssetWorks offers research tools to help investors organize and enhance their investment process. We are not a SEBI-registered advisor."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://assetworks.ai/disclaimer" />
        <meta property="og:site_name" content="AssetWorks" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/*Header*/}
      <Header />

      <section id="disclaimer" className="bg-background px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-midnight text-3xl font-bold mb-4">Disclaimer Document</h1>
          <p className="mb-8">Last Updated: April 28, 2025</p>

          {/* Full Disclaimer */}
          <h2 className="text-midnight font-semibold mb-4">Full Disclaimer</h2>

          <p className="mb-6">
            AssetWorks is a platform designed to help investors organize, visualize, and enhance their investment research process.
            We provide a Research Operating System for modern investors to centralize their research activities and reduce cognitive fatigue.
          </p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">Not Investment Advice</h3>
          <p className="mb-6">
            AssetWorks is not registered with the Securities and Exchange Board of India (SEBI) or any other regulatory authority as an Investment Advisor.
            The platform does not provide personalized financial or investment advice, nor does it make recommendations to buy, sell, or hold any securities.
          </p>
          <p className="mb-6">
            All content shared on AssetWorks—including research summaries, visual tools, AI-generated insights, expert opinions, or community-contributed materials—
            is intended solely for educational and informational purposes.
          </p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">Risk Acknowledgment</h3>
          <p className="mb-6">
            Investing in financial markets involves substantial risk, including the potential loss of principal. Market conditions are volatile and unpredictable.
            Past performance of any security, strategy, or idea is not indicative of future results. The value of investments may fluctuate, and investors may lose money.
          </p>
          <p className="mb-6">
            Users of the Platform are solely responsible for evaluating the merits and risks associated with any information provided.
            All investment decisions made by users are at their own discretion and risk.
          </p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">No Liability</h3>
          <p className="mb-4">
            AssetWorks and its affiliates, officers, employees, contributors, or licensors shall not be liable for any direct, indirect, incidental,
            or consequential losses or damages arising from:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Any investment actions taken based on content presented on the Platform</li>
            <li>Technical issues or interruptions in service</li>
            <li>Inaccuracies or errors in data or research materials</li>
            <li>Any other use of the platform or its content</li>
          </ul>
          <p className="mb-6">
            Users are strongly advised to consult with a SEBI-registered financial advisor or other licensed professionals before making any investment decisions.
          </p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">Intellectual Property</h3>
          <p className="mb-6">
            The content, organization, graphics, design, and other matters related to AssetWorks are protected under applicable copyrights, trademarks,
            and other proprietary rights. Copying, redistribution, use, or publication by users of any such content or any part of the Platform is prohibited
            without express permission from AssetWorks.
          </p>

          <h3 className="text-midnight font-semibold mb-2 text-xl">Third-Party Content</h3>
          <p className="mb-6">
            Links to third-party websites or content sources are provided for convenience only. AssetWorks does not control, endorse,
            or assume responsibility for third-party content or practices.
          </p>
          <p className="mb-6">
            By accessing or using the Platform, the user acknowledges and agrees to the terms of this disclaimer and assumes full responsibility
            for their own investment decisions.
          </p>
        </div>
      </section>

      {/*Footer*/}
      <Footer />
    </div>
  );
}
