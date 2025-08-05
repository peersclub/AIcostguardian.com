# 🏢 AI Cost Guardian

> **Enterprise AI Usage Tracking & Cost Management Dashboard**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/peersclub/ai-cost-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

A comprehensive enterprise-grade dashboard for tracking AI usage and costs across multiple providers with real-time monitoring, admin controls, and professional reporting.

![AI Cost Guardian Dashboard](https://github.com/peersclub/ai-cost-guardian/raw/main/.github/preview.png)

## ✨ Features

### 🎯 **Unified API Key Management**
- Automatic admin key detection based on key patterns
- One-key-per-provider policy for clean management
- Real-time connection status monitoring
- Secure encrypted storage

### 🏢 **Enterprise Dashboard**
- Salesforce-inspired professional table layouts
- Real-time usage analytics and cost tracking
- Export functionality (CSV, JSON, PDF reports)
- Live connection status with auto-refresh

### 🔐 **Pro Subscription System**
- Freemium model with admin key limits
- Beautiful upgrade flows and pricing pages
- Subscription status tracking
- Feature-based access control

### 📊 **Multi-Provider Support**
- **OpenAI** - GPT models, DALL-E, Whisper
- **Claude** - Anthropic's Claude 3 models + Admin Console
- **Google Gemini** - Gemini Pro and Flash models
- **Perplexity AI** - Search-augmented models
- **Grok (X.AI)** - X's AI models

### 🛡️ **Security & Authentication**
- Google OAuth integration with NextAuth.js
- Protected routes with authentication wrapper
- Creative login pages for unauthenticated access
- Secure API key encryption and storage

## 🚀 Quick Start

### 1. Deploy Instantly
Click the button above to deploy to Vercel with one click!

### 2. Local Development
```bash
# Clone the repository
git clone https://github.com/peersclub/ai-cost-guardian.git
cd ai-cost-guardian

# Navigate to the Next.js app
cd ai-credit-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration

### Environment Variables

```bash
# Google OAuth (Required)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth.js (Required)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-32-character-random-string"

# AI Provider Keys (Optional - users can add via UI)
OPENAI_API_KEY="your-openai-key"
CLAUDE_API_KEY="your-claude-key"
GEMINI_API_KEY="your-gemini-key"
PERPLEXITY_API_KEY="your-perplexity-key"
GROK_API_KEY="your-grok-key"
```

### Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Configure authorized domains and redirect URIs
4. Add credentials to environment variables

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed instructions.

## 📱 Screenshots

### Dashboard Overview
Professional enterprise dashboard with real-time monitoring:

### Settings & API Key Management
Intuitive interface for managing API keys across providers:

### Admin Detection & Messaging
Smart detection of admin vs regular API keys:

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for professional design
- **Authentication**: NextAuth.js with Google OAuth
- **Storage**: File-based encrypted API key storage
- **UI Components**: Custom enterprise-grade components

### Project Structure
```
ai-credit-tracker/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes for all providers
│   ├── dashboard/         # Dashboard pages
│   ├── settings/          # Settings management
│   └── upgrade/           # Subscription pages
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript definitions
```

## 🔄 API Integration

### Supported Providers & Detection
- **OpenAI**: `sk-org-*` (admin) vs `sk-*` (regular)
- **Claude**: Length-based + pattern detection
- **Gemini**: Service account vs API key detection
- **Perplexity**: `pplx-org-*` (admin) vs `pplx-*` (regular)
- **Grok**: `xai-org-*` (admin) vs `xai-*` (regular)

### Real-time Monitoring
- Connection status checking every 30 seconds
- Automatic retry logic for failed connections
- Live status indicators with color-coded states

## 📈 Enterprise Features

### Professional UI/UX
- Clean, Salesforce-inspired design
- Consistent enterprise color palette
- Professional typography and spacing
- Responsive design for all devices

### Advanced Analytics
- Usage trends and cost forecasting
- Provider comparison and optimization
- Export capabilities for reporting
- Historical data tracking

### Admin Controls
- Centralized usage management
- Team member access control
- Billing and subscription oversight
- Compliance and audit trails

## 🚀 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/peersclub/ai-cost-guardian)

### Other Platforms
- **Netlify**: Support for static site generation
- **Railway**: Full-stack deployment
- **Heroku**: Container-based deployment
- **AWS/GCP**: Enterprise cloud deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Email**: support@peersclub.com
- 🐙 **GitHub Issues**: [Report Issues](https://github.com/peersclub/ai-cost-guardian/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/peersclub/ai-cost-guardian/discussions)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

<div align="center">

**🏢 Enterprise-ready AI cost management made simple**

[Live Demo](https://ai-cost-guardian.vercel.app) • [Documentation](https://github.com/peersclub/ai-cost-guardian/wiki) • [API Reference](https://github.com/peersclub/ai-cost-guardian/blob/main/API.md)

Made with ❤️ by [PeersClub](https://github.com/peersclub)

</div>