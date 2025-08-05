import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function Security() {
  const securityFeatures = [
    {
      category: "Data Protection",
      icon: "🔒",
      features: [
        {
          title: "End-to-End Encryption",
          description: "All data encrypted in transit and at rest using AES-256 encryption",
          status: "active"
        },
        {
          title: "Zero-Knowledge Architecture",
          description: "Your API keys and sensitive data are encrypted client-side before reaching our servers",
          status: "active"
        },
        {
          title: "Data Residency Controls",
          description: "Choose where your data is stored with regional data centers",
          status: "active"
        },
        {
          title: "Automatic Data Purging",
          description: "Configurable data retention policies with automatic deletion",
          status: "active"
        }
      ]
    },
    {
      category: "Access Control",
      icon: "👤",
      features: [
        {
          title: "Multi-Factor Authentication",
          description: "SMS, authenticator apps, and hardware keys supported",
          status: "active"
        },
        {
          title: "Single Sign-On (SSO)",
          description: "SAML 2.0 and OAuth 2.0 integration with major identity providers",
          status: "active"
        },
        {
          title: "Role-Based Access Control",
          description: "Granular permissions with custom roles and team hierarchies",
          status: "active"
        },
        {
          title: "Session Management",
          description: "Automatic session timeouts and concurrent session limits",
          status: "active"
        }
      ]
    },
    {
      category: "Monitoring & Compliance",
      icon: "📊",
      features: [
        {
          title: "Audit Trail",
          description: "Comprehensive logging of all user actions and system events",
          status: "active"
        },
        {
          title: "Real-time Monitoring",
          description: "24/7 security monitoring with automated threat detection",
          status: "active"
        },
        {
          title: "Compliance Reports",
          description: "SOC 2, ISO 27001, and GDPR compliance reporting",
          status: "active"
        },
        {
          title: "Vulnerability Scanning",
          description: "Regular security assessments and penetration testing",
          status: "active"
        }
      ]
    }
  ]

  const certifications = [
    {
      name: "SOC 2 Type II",
      description: "Service Organization Control 2 certification for security, availability, and confidentiality",
      logo: "🏆",
      status: "Certified",
      validUntil: "December 2024"
    },
    {
      name: "ISO 27001",
      description: "International standard for information security management systems",
      logo: "🌐",
      status: "Certified",
      validUntil: "March 2025"
    },
    {
      name: "GDPR Compliant",
      description: "Full compliance with European General Data Protection Regulation",
      logo: "🇪🇺",
      status: "Compliant",
      validUntil: "Ongoing"
    },
    {
      name: "CCPA Compliant",
      description: "California Consumer Privacy Act compliance for US users",
      logo: "🇺🇸",
      status: "Compliant",
      validUntil: "Ongoing"
    }
  ]

  const securityPractices = [
    {
      title: "Secure Development",
      description: "Security-first development with automated testing and code reviews",
      items: [
        "Static Application Security Testing (SAST)",
        "Dynamic Application Security Testing (DAST)",
        "Dependency vulnerability scanning",
        "Security code reviews for all changes"
      ]
    },
    {
      title: "Infrastructure Security",
      description: "Enterprise-grade infrastructure with multiple security layers",
      items: [
        "AWS/Azure cloud infrastructure with security best practices",
        "Network segmentation and firewall protection",
        "DDoS protection and traffic filtering",
        "Regular security patching and updates"
      ]
    },
    {
      title: "Incident Response",
      description: "Comprehensive incident response plan with 24/7 monitoring",
      items: [
        "24/7 security operations center (SOC)",
        "Automated threat detection and response",
        "Incident response team with defined escalation procedures",
        "Regular incident response drills and training"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Badge className="mb-6 bg-green-100 text-green-700 px-4 py-2">
              🔒 Enterprise-Grade Security
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Your data is protected by military-grade security
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
              We implement the highest security standards to protect your AI usage data, 
              API keys, and business intelligence with zero-trust architecture and comprehensive compliance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                  Start secure trial
                </Button>
              </Link>
              <Link href="#certifications">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-300 hover:bg-white hover:text-slate-900 px-8 py-4">
                  View certifications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Security Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every aspect of our platform is designed with security in mind, 
              from data encryption to access controls and compliance monitoring.
            </p>
          </div>

          <div className="space-y-12">
            {securityFeatures.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center mb-8">
                  <div className="text-4xl mr-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.features.map((feature, featureIndex) => (
                    <Card key={featureIndex} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <Badge className="bg-green-100 text-green-700">
                            {feature.status === 'active' ? '✓ Active' : 'Coming Soon'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div id="certifications" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Security Certifications & Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We maintain the highest industry certifications and continuously audit 
              our security practices to ensure your data is always protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{cert.logo}</span>
                  </div>
                  <CardTitle className="text-lg">{cert.name}</CardTitle>
                  <Badge className="bg-green-100 text-green-700 mx-auto">
                    {cert.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    {cert.description}
                  </CardDescription>
                  <div className="text-sm text-gray-500">
                    Valid until: {cert.validUntil}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Security Practices */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Security Best Practices
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our security approach encompasses every layer of our technology stack, 
              from development to deployment and ongoing operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {securityPractices.map((practice, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{practice.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {practice.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {practice.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Center */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Transparency Through Our Trust Center
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Access real-time security reports, compliance documentation, 
            and system status updates in our dedicated Trust Center.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">📋</div>
                <CardTitle className="text-white">Security Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Download our latest SOC 2 reports and security assessments
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">🔍</div>
                <CardTitle className="text-white">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Real-time system status and security incident notifications
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <CardTitle className="text-white">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Complete security documentation and compliance guides
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10 space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Visit Trust Center
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Contact Security Team
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Experience enterprise-grade security today
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of companies who trust AI Credit Tracker with their most sensitive AI usage data. 
            Start your secure trial with enterprise-grade protection from day one.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start secure trial
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                Contact security team
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            14-day free trial • SOC 2 certified • Zero setup required
          </p>
        </div>
      </div>
    </div>
  )
}