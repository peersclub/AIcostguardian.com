# AI Provider Logos Implementation

## Overview
We use [@lobehub/icons](https://github.com/lobehub/lobe-icons) for high-quality, consistent AI company logos throughout the application.

## Why Lobe Icons?
- **Professional Quality**: Official, high-resolution logos
- **Consistent Design**: All logos follow similar design principles
- **Well Maintained**: Regular updates with new providers
- **Proper Licensing**: Clear licensing for commercial use
- **TypeScript Support**: Full TypeScript definitions

## Installation
```bash
npm install @lobehub/icons --legacy-peer-deps
```

## Usage

### Basic Usage
```tsx
import { getAIProviderLogo } from '@/components/ui/ai-logos'

// In your component
<div>
  {getAIProviderLogo('openai', 'w-8 h-8')}
</div>
```

### Available Providers
- `openai` - OpenAI (GPT-3, GPT-4)
- `claude` - Anthropic Claude
- `gemini` - Google Gemini
- `grok` - X.AI Grok
- `perplexity` - Perplexity AI
- `meta` - Meta (Llama)
- `mistral` - Mistral AI
- `cohere` - Cohere
- `huggingface` - Hugging Face
- `replicate` - Replicate
- `together` - Together AI

### Size Options
- `w-4 h-4` - 16px
- `w-5 h-5` - 20px
- `w-6 h-6` - 24px (default)
- `w-8 h-8` - 32px
- `w-10 h-10` - 40px
- `w-12 h-12` - 48px

### Provider Info
```tsx
import { getProviderInfo } from '@/components/ui/ai-logos'

const info = getProviderInfo('openai')
// Returns: { name: 'OpenAI', color: '#10a37f', gradient: 'from-emerald-500 to-teal-600' }
```

## File Structure
```
components/ui/
├── ai-logos.tsx          # Main logos implementation
├── logos-reference.tsx   # Visual reference component
└── ...

public/logos/
└── ai-providers/        # Static logo backups (if needed)
```

## Fallback Strategy
1. **Primary**: Use @lobehub/icons components
2. **Fallback**: Generic AI badge for unknown providers
3. **Offline**: Static assets in public/logos (optional)

## Adding New Providers
1. Check if available in @lobehub/icons
2. Add to switch case in `getAIProviderLogo()`
3. Add provider info to `getProviderInfo()`
4. Update this documentation

## Benefits of This Approach
- ✅ Professional, official logos
- ✅ Consistent sizing and styling
- ✅ Easy to maintain and update
- ✅ Reduced bundle size (SVG components)
- ✅ TypeScript support
- ✅ Fallback for unknown providers
- ✅ Centralized logo management