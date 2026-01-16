# User Profile Features Design

**Date:** 2026-01-15  
**Status:** Approved - Ready for Implementation

## Overview

This document outlines the design for three core user profile features:
1. Multi-language support UI
2. Activation code system
3. Storage quota display

## Business Context

### User Personas
- **Target audience:** Language learners focusing on one language at a time
- **Free tier:** Single language selection (locked after choice), limited storage
- **Future paid tiers:** Multiple language support, increased storage limits

### Monetization Strategy
- Free users require activation code to prevent abuse
- Activation codes serve as access control mechanism
- Storage limits create upgrade incentive

## Feature Specifications

### 1. User Info Card Component

**Location:** Bottom of sidebar (fixed, non-scrolling)

**Inactive Users Display:**
```
┌─────────────────────────┐
│ 👤 user@gmail.com       │
│ ⚠️ 账户未激活             │
│ [🔓 输入激活码]          │
└─────────────────────────┘
```

**Active Users Display:**
```
┌─────────────────────────┐
│ 👤 user@gmail.com       │
│ 🇪🇸 Spanish (Free)      │
│ 📝 ▓▓░░░░ 25k/150k      │
│ [⚙️ Settings]           │
└─────────────────────────┘
```

**Data Requirements:**
- Fetch from `user_profiles` table
- Fields: `is_active`, `email`, `plan_type`, `target_language`, `storage_used`

**Interactions:**
- Inactive: Click button → Open activation dialog
- Active: Click Settings → Navigate to `/settings`

### 2. Activation Dialog

**Trigger Conditions:**
1. User clicks "输入激活码" button in UserInfoCard
2. Inactive user attempts to create/edit note

**UI Design:**
```
╔═══════════════════════════════════╗
║   🔓 激活你的账户                    ║
║                                   ║
║   输入激活码解锁完整功能：            ║
║   • 创建和编辑笔记                   ║
║   • 150,000 字符存储空间             ║
║   • 语音播放功能                     ║
║                                   ║
║   ┌─────────────────────────┐     ║
║   │ [输入激活码]              │     ║
║   └─────────────────────────┘     ║
║                                   ║
║   [取消]          [激活账户]        ║
╚═══════════════════════════════════╝
```

**Flow:**
1. User enters code (e.g., `HAILMARY`)
2. Call `redeem_activation_code(code)` Supabase function
3. Handle responses:
   - `Success` → Close dialog, refresh page, show success toast
   - `Invalid code` → Show error: "激活码无效"
   - `Code fully used` → Show error: "激活码已用完"
   - `Already activated` → Close dialog, show info toast

**Implementation:**
- Use Radix UI Dialog
- Use React Toast for notifications
- Create utility: `src/utils/activation/redeem.ts`

### 3. Settings Page (`/settings`)

**Layout:**
```
┌────────────────────────────────────────┐
│ ← 返回笔记                              │
│                                        │
│  ⚙️ 账户设置                            │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🌍 学习语言                       │ │
│  │                                  │ │
│  │ 目标语言: [Spanish ▼]             │ │
│  │                                  │ │
│  │ [保存设置]                        │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📊 存储使用情况                    │ │
│  │ 已用: 25,432 / 150,000 字符       │ │
│  │ ▓▓▓░░░░░░░ 17%                   │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Language Options:**
```typescript
const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
];
```

**Access Control:**
- Inactive users: Redirect to home or show "请先激活账户"
- Active users: Full access

**Language Selection Logic:**
- Free users: Dropdown enabled until first save, then locked/disabled
- Future paid tiers: Controlled by environment variables (implementation ready)

**Storage Display:**
- Calculate total characters across all notes
- Display in human-readable format (k for thousands)
- Show progress bar with percentage

## Technical Implementation

### Data Layer

**New Type Definitions (`src/types/profile.ts`):**
```typescript
export interface UserProfile {
  id: string;
  email: string;
  is_active: boolean;
  storage_used: number;
  plan_type: 'free' | 'pro' | 'premium';
  target_language: string | null;
  created_at: string;
}
```

**Utility Functions:**

`src/utils/profile/queries.ts`:
- `getUserProfile()`: Fetch current user's profile
- `updateTargetLanguage(language: string)`: Update user's target language
- `calculateStorageUsed(userId: string)`: Calculate total character count

`src/utils/activation/redeem.ts`:
- `redeemActivationCode(code: string)`: Call Supabase RPC function

`src/utils/storage/limits.ts`:
- `getStorageLimit(planType: string)`: Get storage limit from env vars
- `formatCharacterCount(count: number)`: Format as "25k" or "150k"

### Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_FREE_STORAGE_LIMIT=300000      # 300KB ≈ 150k characters
NEXT_PUBLIC_PRO_STORAGE_LIMIT=10000000     # 10MB
NEXT_PUBLIC_FREE_LANGUAGE_LIMIT=1
```

**Storage Calculation:**
- Database stores bytes in `storage_used`
- Display characters: `bytes / 2` (average approximation)
- Future: Calculate actual character count from note contents

### Component Architecture

**New Components:**
- `src/components/UserInfoCard.tsx` - Sidebar user info display
- `src/components/ActivationDialog.tsx` - Activation code modal
- `src/components/StorageIndicator.tsx` - Progress bar component
- `src/app/settings/page.tsx` - Settings page

**Modified Components:**
- `src/components/Sidebar.tsx` - Add UserInfoCard at bottom
- `src/components/CreateNoteButton.tsx` - Check `is_active` before creating
- `src/components/Editor.tsx` - Check `is_active` before editing
- `src/app/page.tsx` - Fetch and pass user profile

### Permission Control

**Guard Logic:**
```typescript
if (!profile.is_active) {
  showActivationDialog();
  return;
}
// Proceed with create/edit
```

**Applied to:**
- Create note button click
- Edit button click
- Note content modification

## Database Verification

**Required Tables (Already Exist):**
- ✅ `user_profiles` - User activation status and metadata
- ✅ `activation_codes` - Activation code inventory
- ✅ `notes` - Notes with RLS enforcing `is_active` check

**Test Data (Already Inserted):**
- `HAILMARY` - 10 uses, beta_access
- `VIP-ONLY-ONE` - 1 use, pro_plan

## User Flows

### Flow 1: New User First Login
1. User signs in with Google OAuth
2. `user_profiles` row created via trigger (is_active = false)
3. User lands on home page → sees empty notes list
4. Clicks "New Note" → Activation dialog appears
5. Enters activation code → Account activated
6. Redirected to create note

### Flow 2: Active User Without Language Set
1. User opens app → sees notes and UserInfoCard
2. Clicks "Settings" → Goes to `/settings`
3. Selects target language (e.g., Spanish)
4. Clicks "保存设置" → Language locked for free tier
5. Returns to home → UserInfoCard shows "🇪🇸 Spanish (Free)"

### Flow 3: Active User Creating Notes
1. User creates/edits notes normally
2. Storage count updates in database
3. UserInfoCard shows live storage usage
4. If approaching limit → Progress bar shows warning color

## Testing Requirements

### Manual Testing Checklist
- [ ] Inactive user sees activation prompt when creating note
- [ ] Valid activation code successfully activates account
- [ ] Invalid code shows appropriate error message
- [ ] Used-up code shows "already used" error
- [ ] Active user can access settings page
- [ ] Language selection works and locks after first save (free tier)
- [ ] Storage indicator displays correct character count
- [ ] UserInfoCard displays correct user state

### Test Activation Codes
Use these codes for testing:
- `HAILMARY` - Valid, 10 uses
- `VIP-ONLY-ONE` - Valid, 1 use
- `INVALID123` - Should fail

## Future Enhancements (Out of Scope)

- Multiple language support for paid tiers
- Stripe/LemonSqueezy payment integration
- Real-time storage calculation
- Language-specific TTS voice selection
- Storage upgrade purchase flow

## Success Criteria

- ✅ Inactive users cannot create/edit notes without activation
- ✅ Activation code system prevents unauthorized usage
- ✅ Users can select and lock their target language
- ✅ Storage usage is visible and accurate
- ✅ All components integrate seamlessly with existing UI
- ✅ Tests verify all permission checks work correctly

---

**Approved by:** User  
**Next Step:** Create implementation plan and begin development
