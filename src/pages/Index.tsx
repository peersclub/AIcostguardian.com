import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, BarChart3, Globe, Lightbulb, TrendingUp, Star, Brain, MessageSquare, RefreshCw, Clock, DollarSign, Eye, Frown, Smile, Zap, Grid3X3, Puzzle, Users } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
import { toast } from "sonner";
import { submitWailistForm } from "@/utils/api";
import { ContactFormData } from "@/types/types";
import { Helmet } from "react-helmet-async";


export const submitWaitlist = async (formElement: HTMLFormElement) => {
  const formData = new FormData(formElement);
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    toast.error("Please enter a valid email.");
    return;
  }

  try {
    const payload: ContactFormData = { email };
    await submitWailistForm(payload);
    toast.success("Successfully joined the waitlist!");
    formElement.reset();
  } catch (err: any) {
    toast.error(err.message || "Submission failed.");
  }
};

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>AssetWorks AI - Smarter Investment Research, All in One Place</title>
        <meta
          name="description"
          content="AssetWorks AI is an AI-enabled investment intelligence platform crafted to transform research - smarter, faster, and all in one place."
        />
        <meta property="og:title" content="AssetWorks AI - Smarter Investment Research, All in One Place" />
        <meta
          property="og:description"
          content="AssetWorks AI is an AI-enabled investment intelligence platform crafted to transform research - smarter, faster, and all in one place."
        />
        <meta property="og:image" content="/meta/og-thumbnail.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://assetworks.ai/" />
        <meta property="og:site_name" content="AssetWorks" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Custom animations */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes rotate-slow-reverse {
          from { transform: rotate(180deg); }
          to { transform: rotate(-180deg); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
        
        @keyframes rotate-organized {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .blinking-cursor {
          animation: blink 1s infinite;
        }
        
        .floating-widget {
          animation: float 3s ease-in-out infinite;
        }
        
        .icon-hover {
          transition: transform 0.3s ease;
        }
        
        .card-hover:hover .icon-hover {
          transform: scale(1.3);
        }
        
        .vision-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
        }
        
        .vision-card:hover {
          transform: scale(1.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .tangled-circle-1 {
          animation: rotate-slow 15s linear infinite;
        }
        
        .tangled-circle-2 {
          animation: rotate-reverse 12s linear infinite;
        }
        
        .tangled-circle-3 {
          animation: rotate-slow 18s linear infinite;
        }
        
        .tangled-circle-4 {
          animation: rotate-slow-reverse 14s linear infinite;
        }
        
        .tangled-circle-5 {
          animation: rotate-reverse 16s linear infinite;
        }
        
        .organized-circle-1 {
          animation: pulse-gentle 4s ease-in-out infinite, rotate-organized 30s linear infinite;
        }
        
        .organized-circle-2 {
          animation: pulse-gentle 4.5s ease-in-out infinite, rotate-organized 35s linear infinite reverse;
        }
        
        .organized-circle-3 {
          animation: pulse-gentle 5s ease-in-out infinite, rotate-organized 40s linear infinite;
        }
        
        .organized-circle-4 {
          animation: pulse-gentle 5.5s ease-in-out infinite, rotate-organized 45s linear infinite reverse;
        }
        
        .organized-circle-5 {
          animation: pulse-gentle 6s ease-in-out infinite, rotate-organized 50s linear infinite;
        }
        
        .organized-circle-6 {
          animation: pulse-gentle 6.5s ease-in-out infinite, rotate-organized 55s linear infinite;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="px-4 md:px-6 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col justify-center order-2 md:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 md:mb-6">
              Make Smarter<br />
              Investment Decisions in<br />
              Seconds
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Stop spending hours on research. Get personalized,
              AI-powered insights that help you
              invest with confidence and stay ahead of the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8">
              {/**/}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitWaitlist(e.currentTarget);
                }}
                className="flex flex-col sm:flex-row gap-4 w-full"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 text-sm"
                >
                  Join Waitlist
                </button>
              </form>

              {/**/}
            </div>
            
            <div className="flex items-center space-x-4 text-xs md:text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border-2 border-white">
                    <img
                      src="/waitlist/p1.png"
                      alt="Profile 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border-2 border-white">
                    <img
                      src="/waitlist/p2.png"
                      alt="Profile 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border-2 border-white">
                    <img
                      src="/waitlist/p3.png"
                      alt="Profile 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="ml-2">Join <strong>2,500+</strong> investors making smarter decisions</span>
              </div>
            </div>
          </div>
          
          <div className="relative floating-widget flex justify-center order-1 md:order-2">
            <div className="w-80 h-80 md:w-96 md:h-96 p-4 md:p-6 bg-white rounded-3xl shadow-2xl border border-gray-100">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              <div className="mb-6 md:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-100 flex items-center justify-center mr-3 md:mr-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">Analyze Tesla before earnings</h3>
                    <div className="w-0.5 h-6 bg-gray-900 blinking-cursor"></div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 md:mb-8">
                  <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-4/5"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-3/5"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Revenue Growth</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">+27.4%</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Analyst Rating</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">Buy (4.2/5)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Building Neural Network Section */}
      <section id="vision" className="bg-gray-50 px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-sm text-gray-500 mb-4">OUR VISION</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8">
            Building the neural network for<br className="hidden md:block" />
            global investment intelligence
          </h2>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {/* Our Purpose Card */}
          <Card className="vision-card shadow-lg bg-white">
            <CardContent className="p-6 md:p-8 h-full flex flex-col">
              <div className="flex items-start space-x-4 mb-6 flex-grow">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Our Purpose</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                    "Democratizing investment intelligence to reduce
                    inequality and unlock human potential at scale."
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded flex items-center">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mr-2 md:mr-3" />
                <span className="text-xs md:text-sm text-gray-700 font-medium">Equal access for everyone</span>
              </div>
            </CardContent>
          </Card>
          
          {/* The Problem Card */}
          <Card className="vision-card shadow-lg bg-gray-900 text-white">
            <CardContent className="p-6 md:p-8 h-full flex flex-col">
              <div className="flex items-start space-x-4 mb-6 flex-grow">
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-white mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">The Problem</h3>
                  <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6">
                    Investment research is fragmented, time-consuming, and often leaves investors uncertain about their decisions.
                  </p>
                </div>
              </div>
              <div className="bg-gray-800 p-3 md:p-4 rounded flex items-center">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mr-2 md:mr-3" />
                <span className="text-xs md:text-sm text-gray-400">Hours of research, still uncertain</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Complete Analysis Section */}
      <section id="features" className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-sm text-gray-500 mb-4">OUR FEATURES</p>
          <h2 className="text-3xl md:text-4xl font-bold">Complete analysis in 60 seconds</h2>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 md:gap-8">
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 card-hover">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="icon-hover inline-block mb-4 md:mb-6">
                <Lightbulb className="w-10 h-10 md:w-12 md:h-12 mx-auto text-yellow-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">Understands What You Need</h3>
              <p className="text-sm md:text-base text-gray-600">
                Input a ticker, asset or investment theme and get data along with insights that help you make informed decisions.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 card-hover">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="icon-hover inline-block mb-4 md:mb-6">
                <BarChart3 className="w-10 h-10 md:w-12 md:h-12 mx-auto text-blue-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">Shows It Clearly</h3>
              <p className="text-sm md:text-base text-gray-600">
                Cuts through market noise and uncertainty to provide clear, contextualized recommendations with the key metrics that matter.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 card-hover">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="icon-hover inline-block mb-4 md:mb-6">
                <Globe className="w-10 h-10 md:w-12 md:h-12 mx-auto text-green-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">Adds Collective Wisdom</h3>
              <p className="text-sm md:text-base text-gray-600">
                Continuously learns from analyst reports, earnings calls and expert opinions to give you insights you can trust.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Combined How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-sm text-gray-500 mb-4">HOW IT WORKS</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8">
            From fragmented research to instant insights
          </h2>
        </div>
        
        {/* Research Chaos vs Research Clarity */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-start mb-16 md:mb-24">
          {/* Left Side - Research Chaos */}
          <div className="text-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 md:mb-8">
              {/* Tangled asymmetric circle background with animations */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Main tangled circles - asymmetric and overlapping with different animations */}
                <div className="absolute w-24 h-18 md:w-32 md:h-24 border-4 border-gray-800 rounded-full transform rotate-12 opacity-70 tangled-circle-1"></div>
                <div className="absolute w-20 h-26 md:w-28 md:h-36 border-4 border-gray-600 rounded-full transform -rotate-45 translate-x-4 translate-y-2 tangled-circle-2"></div>
                <div className="absolute w-26 h-16 md:w-36 md:h-20 border-4 border-gray-700 rounded-full transform rotate-75 -translate-x-2 translate-y-1 tangled-circle-3"></div>
                <div className="absolute w-18 h-20 md:w-24 md:h-28 border-4 border-gray-500 rounded-full transform -rotate-30 translate-x-2 -translate-y-3 tangled-circle-4"></div>
                <div className="absolute w-22 h-16 md:w-30 md:h-22 border-4 border-gray-400 rounded-full transform rotate-150 -translate-x-3 translate-y-4 tangled-circle-5"></div>
              </div>
              
              {/* Static elements positioned on left and right - adjusted for mobile */}
              {/* Left side elements */}
              <div className="absolute top-4 -left-12 md:top-8 md:-left-16 p-2 rounded-lg">
                <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">8+ platform juggling</span>
              </div>
              
              <div className="absolute top-1/2 -left-14 md:-left-20 transform -translate-y-1/2 p-2 rounded-lg">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">Information overload</span>
              </div>
              
              <div className="absolute bottom-4 -left-12 md:bottom-8 md:-left-16 p-2 rounded-lg">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">45+ minutes research</span>
              </div>
              
              {/* Right side elements */}
              <div className="absolute top-4 -right-12 md:top-8 md:-right-16 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">$600+ professional tools</span>
              </div>
              
              <div className="absolute top-1/2 -right-14 md:-right-20 transform -translate-y-1/2 p-2 rounded-lg">
                <Puzzle className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">Complex interfaces</span>
              </div>
              
              <div className="absolute bottom-4 -right-12 md:bottom-8 md:-right-16 p-2 rounded-lg">
                <Frown className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">Still feel uncertain</span>
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-4">From research chaos to research clarity</h3>
          </div>
          
          {/* Right Side - Research Clarity */}
          <div className="text-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 md:mb-8">
              {/* Central organized spiral with smart animations */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border-4 border-gray-800 organized-circle-1"></div>
                <div className="absolute w-30 h-30 md:w-40 md:h-40 rounded-full border-4 border-gray-700 organized-circle-2"></div>
                <div className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-600 organized-circle-3"></div>
                <div className="absolute w-18 h-18 md:w-24 md:h-24 rounded-full border-4 border-gray-500 organized-circle-4"></div>
                <div className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-gray-400 organized-circle-5"></div>
                <div className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-gray-300 organized-circle-6"></div>
              </div>
              
              {/* Static elements positioned on left and right - adjusted for mobile */}
              {/* Left side elements */}
              <div className="absolute top-4 -left-12 md:top-8 md:-left-16 p-2 rounded-lg">
                <Eye className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">One unified platform</span>
              </div>
              
              <div className="absolute top-1/2 -left-14 md:-left-20 transform -translate-y-1/2 p-2 rounded-lg">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">Targeted insights</span>
              </div>
              
              <div className="absolute bottom-4 -left-12 md:bottom-8 md:-left-16 p-2 rounded-lg">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">60 seconds analysis</span>
              </div>
              
              {/* Right side elements */}
              <div className="absolute top-4 -right-12 md:top-8 md:-right-16 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">$240/year intelligence</span>
              </div>
              
              <div className="absolute top-1/2 -right-14 md:-right-20 transform -translate-y-1/2 p-2 rounded-lg">
                <Grid3X3 className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">Simple UX</span>
              </div>
              
              <div className="absolute bottom-4 -right-12 md:bottom-8 md:-right-16 p-2 rounded-lg">
                <Smile className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <span className="text-xs block mt-1 text-gray-700 font-medium">Clear insights</span>
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-4">Same depth. 90% less time. 100% more confidence.</h3>
          </div>
        </div>

        {/* Mobile Interface Demo */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8">
              The AssetWorks AI Way
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side - Mobile Interface */}
            <div className="relative order-2 md:order-1">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-6">
                {/* Window controls */}
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                {/* Chat interface */}
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                        <p className="text-xs md:text-sm text-gray-800">Analyze Apple stock before earnings</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white"></div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-black text-white rounded-lg p-3 md:p-4">
                        <div className="space-y-2 md:space-y-3">
                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Current Price</p>
                              <p className="text-sm md:text-lg font-semibold text-green-400">$175.84</p>
                              <p className="text-xs text-green-400">+2.3%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">P/E Ratio</p>
                              <p className="text-sm md:text-lg font-semibold">28.5</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Analyst Rating</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm md:text-lg font-semibold text-green-400">Strong Buy</p>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-2 h-2 md:w-3 md:h-3 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-700 pt-2 md:pt-3">
                            <p className="text-xs md:text-sm text-gray-300">
                              Based on Q4 earnings expectations and recent product launches, 
                              Apple shows strong fundamentals with revenue growth projected at 8-12%.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input field with blinking cursor */}
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="border border-gray-200 rounded-lg p-2 md:p-3">
                        <span className="text-xs md:text-sm text-gray-800">Ask a query</span>
                        <span className="blinking-cursor ml-1">|</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Features */}
            <div className="space-y-6 md:space-y-8 order-1 md:order-2">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                  From hours of research<br />
                  to seconds of clarity
                </h3>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                  Ask any investment question and get comprehensive analysis 
                  with real-time data, expert insights, and clear recommendations.
                </p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Understands context</h4>
                    <p className="text-sm md:text-base text-gray-600">
                      AI comprehends complex investment queries and market nuances
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Delivers insights</h4>
                    <p className="text-sm md:text-base text-gray-600">
                      Real-time analysis with key metrics and clear recommendations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Learns continuously</h4>
                    <p className="text-sm md:text-base text-gray-600">
                      Aggregates wisdom from analysts, reports, and market data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Transform Section */}
      <section id="get-started" className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-4">GET STARTED</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            Ready to Transform Your<br className="hidden md:block" />
            Investments?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
            Join thousands making smarter, faster decisions with AI-powered investment
            intelligence.
          </p>
          {/*Contact */}
          <Contact />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
