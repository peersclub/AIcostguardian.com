# AI Cost Guardian - Comprehensive Testing Guide

## 🚀 Quick Start

### Application URL
- **Local Development**: http://localhost:3001
- **Live Production**: https://aicostguardian.com

### Test Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | admin@aicostguardian.com | admin@2024 | Full platform access, all features |
| **Manager/Admin** | manager@example.com | manager123 | Organization admin, team management |
| **Regular User** | demo@example.com | demo123 | Standard user access |

---

## 📱 All Available Pages & URLs

### Public Pages (No Login Required)
| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Marketing landing page with product overview |
| Pricing | `/pricing` | Subscription plans and pricing information |
| Features | `/features` | Detailed feature descriptions |
| About | `/about` | Company information |
| Documentation | `/docs` | Product documentation |
| Enterprise | `/enterprise` | Enterprise solutions page |
| Startups | `/startups` | Startup program information |
| Agencies | `/agencies` | Agency partnership information |
| Resources | `/resources` | Help resources and guides |
| Security | `/security` | Security and compliance information |
| Solutions - Developers | `/solutions/developers` | Developer-focused solutions |
| Solutions - Enterprise | `/solutions/enterprise` | Enterprise solutions |
| Solutions - Startups | `/solutions/startups` | Startup solutions |

### Authentication Pages
| Page | URL | Description |
|------|-----|-------------|
| Sign In | `/auth/signin` | Login page with demo & Google OAuth |
| Sign Up | `/auth/signup` | New user registration |
| Error | `/auth/error` | Authentication error page |

### Dashboard & Core Features (Login Required)
| Page | URL | Description | Expected Functionality |
|------|-----|-------------|------------------------|
| Dashboard | `/dashboard` | Main dashboard | • View usage overview<br>• Cost trends<br>• Recent activity<br>• Quick stats |
| Usage Tracking | `/usage` | Detailed usage analytics | • Provider-wise usage<br>• Cost breakdown<br>• Export data<br>• Date filtering |
| Billing | `/billing` | Billing management | • Current plan<br>• Invoice history<br>• Payment methods<br>• Usage limits |
| Settings | `/settings` | Account settings | • Profile management<br>• Password change<br>• Preferences |
| API Keys | `/settings/api-keys` | API key management | • Add provider keys<br>• Rotate keys<br>• Test connectivity |

### AI Features
| Page | URL | Description | Expected Functionality |
|------|-----|-------------|------------------------|
| AI Optimise Pro | `/aioptimise` | Advanced AI chat interface | • Multi-model selection<br>• Real-time cost tracking<br>• Thread management<br>• Collaboration features |
| AI Optimise V2 | `/aioptimiseV2` | Enhanced AI interface | • Advanced analytics<br>• Prompt optimization<br>• Model comparison |
| AI Chat | `/ai-chat` | Standard AI chat | • Basic chat functionality<br>• Model selection |
| AI Cost Calculator | `/ai-cost-calculator` | Cost estimation tool | • Calculate costs by model<br>• Compare providers<br>• Budget planning |
| Models | `/models` | AI model catalog | • Browse available models<br>• Compare capabilities<br>• Pricing information |

### Analytics & Monitoring
| Page | URL | Description | Expected Functionality |
|------|-----|-------------|------------------------|
| Analytics - Usage | `/analytics/usage` | Usage analytics | • Detailed usage charts<br>• Provider breakdown<br>• Time-based analysis |
| Analytics - Trends | `/analytics/trends` | Trend analysis | • Usage trends<br>• Cost trends<br>• Predictions |
| Analytics - Providers | `/analytics/providers` | Provider analytics | • Provider comparison<br>• Performance metrics |
| Monitoring | `/monitoring/dashboard` | Real-time monitoring | • Live usage tracking<br>• Alert status<br>• System health |
| Alerts | `/alerts` | Alert management | • Configure alerts<br>• View triggered alerts<br>• Alert history |

### Organization & Team Management
| Page | URL | Description | Expected Functionality |
|------|-----|-------------|------------------------|
| Organization | `/organization` | Organization overview | • Company settings<br>• Subscription management |
| Team Members | `/organization/members` | Team management | • Add/remove members<br>• Role assignment<br>• Permissions |
| Permissions | `/organization/permissions` | Permission management | • Role-based access<br>• Custom permissions |
| Usage Limits | `/organization/usage-limits` | Set usage limits | • Department limits<br>• User limits<br>• Budget controls |
| Team Dashboard | `/team` | Team overview | • Team statistics<br>• Member activity |

### Notifications & Communication
| Page | URL | Description | Expected Functionality |
|------|-----|-------------|------------------------|
| Notifications | `/notifications` | Notification center | • View all notifications<br>• Mark as read<br>• Filter by type |
| Notification Settings | `/notifications/settings` | Configure notifications | • Email preferences<br>• Alert thresholds<br>• Channels |

### Administrative Pages (Admin/Super Admin Only)
| Page | URL | Description | Expected Functionality |
|------|-----|-------------|------------------------|
| Admin Panel | `/admin` | Admin dashboard | • Platform statistics<br>• User management |
| Super Admin | `/super-admin` | Super admin panel | • Full platform control<br>• All organizations<br>• System settings |
| Budgets | `/budgets` | Budget management | • Set budgets<br>• Track spending<br>• Alerts |
| Integrations | `/integrations` | Third-party integrations | • Connect services<br>• Manage webhooks |

### Onboarding & Setup
| Page | URL | Description | Expected Functionality |
|------|-----|-------------|------------------------|
| Onboarding | `/onboarding` | New user onboarding | • Guided setup<br>• Initial configuration |
| API Setup | `/onboarding/api-setup` | API key setup | • Provider selection<br>• Key configuration |
| Complete | `/onboarding/complete` | Setup completion | • Confirmation<br>• Next steps |

### Miscellaneous
| Page | URL | Description |
|------|-----|-------------|
| Release Notes | `/release-notes` | Product updates and changes |
| Current Release | `/release-notes/current` | Latest release information |
| Upgrade | `/upgrade` | Upgrade subscription plan |
| Test Pages | `/test`, `/test-email`, `/test-notifications` | Testing utilities |

---

## 🧪 Test Scenarios

### 1. Authentication Flow
**Test Steps:**
1. Navigate to http://localhost:3001
2. Click "Sign In" or navigate to `/auth/signin`
3. Test with each account:
   - Click "Use Demo Account"
   - Enter credentials
   - Verify successful login and redirect to dashboard

**Expected Results:**
- ✅ Each account type should access appropriate features
- ✅ Super Admin sees all administrative options
- ✅ Manager sees team management features
- ✅ Regular user has limited access

### 2. Dashboard Functionality
**Test Steps:**
1. Login with any test account
2. Navigate to `/dashboard`
3. Verify dashboard components load:
   - Usage statistics
   - Cost trends chart
   - Recent activity
   - Provider breakdown

**Expected Results:**
- ✅ All widgets display data
- ✅ Charts are interactive
- ✅ Quick actions work

### 3. AI Optimise Pro Testing
**Test Steps:**
1. Navigate to `/aioptimise`
2. Test chat functionality:
   - Enter a prompt
   - Select different AI models
   - Create new threads
   - Test collaboration features

**Expected Results:**
- ✅ Chat interface responds
- ✅ Model switching works
- ✅ Cost tracking updates in real-time
- ✅ Threads save and load correctly

### 4. API Key Management
**Test Steps:**
1. Navigate to `/settings/api-keys`
2. Test adding a new API key:
   - Select provider (OpenAI, Claude, etc.)
   - Enter test key
   - Test connection
   - Save key

**Expected Results:**
- ✅ Keys are encrypted and saved
- ✅ Connection test provides feedback
- ✅ Keys can be rotated/deleted

### 5. Usage Analytics
**Test Steps:**
1. Navigate to `/usage`
2. Test filtering options:
   - Date range selection
   - Provider filtering
   - Export functionality

**Expected Results:**
- ✅ Data updates based on filters
- ✅ Charts display correctly
- ✅ Export generates CSV/JSON

### 6. Team Management (Admin/Manager Only)
**Test Steps:**
1. Login as manager@example.com
2. Navigate to `/organization/members`
3. Test team features:
   - Invite new member
   - Change member role
   - Set usage limits
   - Remove member

**Expected Results:**
- ✅ Invitations send correctly
- ✅ Role changes apply immediately
- ✅ Usage limits enforce restrictions

### 7. Alert Configuration
**Test Steps:**
1. Navigate to `/alerts`
2. Create new alert rule:
   - Set threshold (e.g., $100 daily spend)
   - Configure notification channel
   - Test alert trigger

**Expected Results:**
- ✅ Alert rules save
- ✅ Notifications trigger at threshold
- ✅ Alert history displays

### 8. Billing & Subscription
**Test Steps:**
1. Navigate to `/billing`
2. Test billing features:
   - View current plan
   - Check invoice history
   - Attempt plan upgrade

**Expected Results:**
- ✅ Current plan displays correctly
- ✅ Invoice history loads
- ✅ Upgrade flow initiates

### 9. Mobile Responsiveness
**Test Steps:**
1. Test on various screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. Check all main pages

**Expected Results:**
- ✅ Navigation adapts to screen size
- ✅ Content remains readable
- ✅ Interactive elements are accessible

### 10. Dark/Light Mode
**Test Steps:**
1. Look for theme toggle (if available)
2. Switch between modes
3. Navigate through pages

**Expected Results:**
- ✅ Theme persists across pages
- ✅ All elements adapt to theme
- ✅ No contrast issues

---

## 🔍 API Endpoints to Test

### Authentication
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - List auth providers
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Usage & Analytics
- `GET /api/usage` - Get usage data
- `GET /api/usage/stats` - Get usage statistics
- `GET /api/usage/export` - Export usage data
- `POST /api/usage/track` - Track new usage

### Settings & Configuration
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Add new key
- `DELETE /api/api-keys/[id]` - Delete key

### Organization
- `GET /api/organization` - Get organization details
- `GET /api/organization/members` - List members
- `POST /api/organization/members/invite` - Invite member
- `PUT /api/organization/members/[id]` - Update member

### AI Services
- `POST /api/chat` - AI chat endpoint
- `GET /api/models` - List available models
- `POST /api/aioptimise/chat` - AIOptimise chat
- `GET /api/aioptimise/threads` - Get chat threads

---

## 🐛 Common Issues & Troubleshooting

### Login Issues
- **Issue**: Can't login with demo credentials
- **Solution**: Ensure server is running on port 3001, check console for errors

### Dashboard Not Loading
- **Issue**: Dashboard shows loading spinner indefinitely
- **Solution**: Check network tab for failed API calls, verify database connection

### API Keys Not Saving
- **Issue**: API keys disappear after adding
- **Solution**: Check encryption key in environment variables

### Charts Not Displaying
- **Issue**: Analytics charts are blank
- **Solution**: Verify data exists in database, check browser console for errors

---

## 📊 Performance Benchmarks

### Expected Load Times
- Homepage: < 2 seconds
- Dashboard: < 3 seconds
- Analytics pages: < 4 seconds
- AI Chat response: < 5 seconds

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📝 Bug Reporting Template

When reporting issues, please include:

```
**Environment:**
- URL: 
- Browser: 
- Account Used: 
- Time: 

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshots/Console Errors:**

**Additional Notes:**
```

---

## 🎯 Testing Checklist

### Essential Tests
- [ ] All test accounts can login
- [ ] Dashboard loads for each account type
- [ ] Navigation menu works
- [ ] API key management functions
- [ ] Usage data displays
- [ ] Billing page accessible
- [ ] Settings save correctly
- [ ] Logout works

### Feature Tests
- [ ] AI Optimise chat works
- [ ] Model switching functions
- [ ] Cost tracking updates
- [ ] Alerts can be configured
- [ ] Team members can be managed
- [ ] Notifications display
- [ ] Export features work
- [ ] Search functionality works

### UI/UX Tests
- [ ] Mobile responsive design
- [ ] Theme switching (if available)
- [ ] Form validations work
- [ ] Error messages display
- [ ] Loading states show
- [ ] Tooltips appear
- [ ] Modals open/close
- [ ] Animations smooth

---

## 📞 Support & Contact

For testing support or to report critical issues:
- **GitHub Issues**: https://github.com/peersclub/AIcostguardian.com/issues
- **Documentation**: http://localhost:3001/docs

---

**Document Version**: 1.0
**Last Updated**: August 29, 2025
**Application Version**: AI Cost Guardian v1.0.0