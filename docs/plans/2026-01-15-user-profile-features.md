# User Profile Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement multi-language support, activation code system, and storage quota display for Spanish Notes App.

**Architecture:** Extend existing Next.js app with user profile management. Add database queries for user_profiles table, create activation flow with Radix UI dialogs, implement permission guards on create/edit operations, and build settings page for language selection.

**Tech Stack:** Next.js 16, TypeScript, Supabase (PostgreSQL + RLS), Radix UI, Tailwind CSS, Vitest

---

## 2026-01-18 Patch
- Change: Storage usage now maintained by DB trigger + backfill; profile reads use stored `storage_used`.
- Scope: `user_profiles.storage_used` trigger + backfill SQL, storage display in settings/sidebar.
- Status: done

## Task 1: Verify Database Schema and Test Data

**Goal:** Confirm activation_codes table has test data.

**Files:**
- Create: `scripts/verify_db.js` (temporary test script)

**Step 1: Create database verification script**

Create `scripts/verify_db.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('🔍 Verifying database schema...\n');

  // Check activation_codes table
  const { data: codes, error } = await supabase
    .from('activation_codes')
    .select('*');

  if (error) {
    console.error('❌ activation_codes table error:', error.message);
    process.exit(1);
  }

  console.log('✅ activation_codes table exists');
  console.log('📊 Test codes found:', codes.length);
  codes.forEach(code => {
    console.log(`   - ${code.code}: ${code.used_count}/${code.max_uses} uses, plan: ${code.plan_type}`);
  });

  if (codes.length === 0) {
    console.log('\n⚠️  No test codes found. Run this SQL in Supabase:');
    console.log(`
INSERT INTO activation_codes (code, max_uses, plan_type) 
VALUES ('HAILMARY', 10, 'beta_access')
ON CONFLICT (code) DO NOTHING;

INSERT INTO activation_codes (code, max_uses, plan_type) 
VALUES ('VIP-ONLY-ONE', 1, 'pro_plan')
ON CONFLICT (code) DO NOTHING;
    `);
  }
}

verify();
```

**Step 2: Run verification script**

Run: `node scripts/verify_db.js`  
Expected: Should show test activation codes exist

**Step 3: Clean up and commit**

Run:
```bash
rm scripts/verify_db.js
git add -A
git commit -m "chore: verify database schema"
```

---

## Task 2: Add Environment Variables

**Files:**
- Modify: `.env.local`

**Step 1: Add storage limit environment variables**

Add to `.env.local`:
```bash
NEXT_PUBLIC_FREE_STORAGE_LIMIT=300000
NEXT_PUBLIC_PRO_STORAGE_LIMIT=10000000
NEXT_PUBLIC_FREE_LANGUAGE_LIMIT=1
```

**Step 2: Commit**

Run:
```bash
git add .env.local
git commit -m "config: add storage and language limit environment variables"
```

---

## Task 3: Create Type Definitions

**Files:**
- Create: `src/types/profile.ts`

**Step 1: Create UserProfile type**

Create `src/types/profile.ts`:
```typescript
export interface UserProfile {
  id: string;
  email: string;
  is_active: boolean;
  storage_used: number;
  plan_type: 'free' | 'beta_access' | 'pro_plan' | 'premium';
  target_language: string | null;
  created_at: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
];
```

**Step 2: Commit**

Run:
```bash
git add src/types/profile.ts
git commit -m "feat: add user profile type definitions"
```

---

## Task 4: Create Storage Utility Functions

**Files:**
- Create: `src/utils/storage/limits.ts`
- Create: `src/utils/storage/limits.test.ts`

**Step 1: Write failing test for getStorageLimit**

Create `src/utils/storage/limits.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { getStorageLimit, formatCharacterCount, getCharacterLimit } from './limits';

describe('Storage Limits', () => {
  it('should return correct storage limit for free plan', () => {
    expect(getStorageLimit('free')).toBe(300000);
  });

  it('should return correct storage limit for pro plan', () => {
    expect(getStorageLimit('pro_plan')).toBe(10000000);
  });

  it('should default to free limit for unknown plan', () => {
    expect(getStorageLimit('unknown')).toBe(300000);
  });
});

describe('Format Character Count', () => {
  it('should format small numbers without suffix', () => {
    expect(formatCharacterCount(500)).toBe('500');
  });

  it('should format thousands with k suffix', () => {
    expect(formatCharacterCount(25000)).toBe('25k');
  });

  it('should format large numbers with k suffix', () => {
    expect(formatCharacterCount(150000)).toBe('150k');
  });
});

describe('Get Character Limit', () => {
  it('should convert bytes to approximate character count', () => {
    expect(getCharacterLimit('free')).toBe(150000); // 300000 / 2
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/utils/storage/limits.test.ts`  
Expected: FAIL - "Cannot find module './limits'"

**Step 3: Implement storage limit utilities**

Create `src/utils/storage/limits.ts`:
```typescript
export function getStorageLimit(planType: string): number {
  const limits: Record<string, number> = {
    'free': parseInt(process.env.NEXT_PUBLIC_FREE_STORAGE_LIMIT || '300000'),
    'beta_access': parseInt(process.env.NEXT_PUBLIC_FREE_STORAGE_LIMIT || '300000'),
    'pro_plan': parseInt(process.env.NEXT_PUBLIC_PRO_STORAGE_LIMIT || '10000000'),
    'premium': parseInt(process.env.NEXT_PUBLIC_PRO_STORAGE_LIMIT || '10000000'),
  };
  
  return limits[planType] || limits['free'];
}

export function formatCharacterCount(count: number): string {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k`;
  }
  return count.toString();
}

export function getCharacterLimit(planType: string): number {
  // Approximate: 1 character ≈ 2 bytes on average
  return Math.floor(getStorageLimit(planType) / 2);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/utils/storage/limits.test.ts`  
Expected: PASS

**Step 5: Commit**

Run:
```bash
git add src/utils/storage/
git commit -m "feat: add storage limit utilities with tests"
```

---

## Task 5: Create Profile Query Functions

**Files:**
- Create: `src/utils/profile/queries.ts`
- Create: `src/utils/profile/queries.test.ts`

**Step 1: Write test for getUserProfile**

Create `src/utils/profile/queries.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserProfile, updateTargetLanguage, calculateStorageUsed } from './queries';

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }))
    },
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-user-id',
              email: 'test@example.com',
              is_active: true,
              storage_used: 5000,
              plan_type: 'free',
              target_language: 'es',
              created_at: '2026-01-15T00:00:00Z'
            },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

describe('getUserProfile', () => {
  it('should fetch user profile successfully', async () => {
    const profile = await getUserProfile();
    expect(profile).toBeDefined();
    expect(profile?.email).toBe('test@example.com');
    expect(profile?.is_active).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/utils/profile/queries.test.ts`  
Expected: FAIL - "Cannot find module './queries'"

**Step 3: Implement profile queries**

Create `src/utils/profile/queries.ts`:
```typescript
'use server';

import { createServerClient } from '@/utils/supabase/server';
import { UserProfile } from '@/types/profile';

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
}

export async function updateTargetLanguage(language: string): Promise<void> {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ target_language: language })
    .eq('id', user.id);

  if (error) {
    throw new Error(`Failed to update language: ${error.message}`);
  }
}

export async function calculateStorageUsed(userId: string): Promise<number> {
  const supabase = await createServerClient();
  
  const { data: notes, error } = await supabase
    .from('notes')
    .select('content')
    .eq('user_id', userId);

  if (error) {
    console.error('Error calculating storage:', error);
    return 0;
  }

  // Calculate total character count
  const totalChars = notes?.reduce((sum, note) => {
    return sum + (note.content?.length || 0);
  }, 0) || 0;

  // Convert to approximate bytes (1 char ≈ 2 bytes)
  return totalChars * 2;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/utils/profile/queries.test.ts`  
Expected: PASS

**Step 5: Commit**

Run:
```bash
git add src/utils/profile/
git commit -m "feat: add user profile query functions with tests"
```

---

## Task 6: Create Activation Code Utility

**Files:**
- Create: `src/utils/activation/redeem.ts`

**Step 1: Implement redeem activation code function**

Create `src/utils/activation/redeem.ts`:
```typescript
'use server';

import { createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface RedeemResult {
  success: boolean;
  message: string;
}

export async function redeemActivationCode(code: string): Promise<RedeemResult> {
  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase.rpc('redeem_activation_code', {
      input_code: code
    });

    if (error) {
      return {
        success: false,
        message: `数据库错误: ${error.message}`
      };
    }

    const result = data as string;

    if (result === 'Success') {
      revalidatePath('/');
      return {
        success: true,
        message: '激活成功！'
      };
    } else if (result === 'Already activated') {
      return {
        success: false,
        message: '你的账户已经激活过了'
      };
    } else if (result === 'Invalid code') {
      return {
        success: false,
        message: '激活码无效'
      };
    } else if (result === 'Code fully used') {
      return {
        success: false,
        message: '激活码已用完'
      };
    } else {
      return {
        success: false,
        message: result
      };
    }
  } catch (err) {
    return {
      success: false,
      message: '激活失败，请稍后重试'
    };
  }
}
```

**Step 2: Commit**

Run:
```bash
git add src/utils/activation/
git commit -m "feat: add activation code redemption utility"
```

---

## Task 7: Create Storage Indicator Component

**Files:**
- Create: `src/components/StorageIndicator.tsx`
- Create: `src/components/StorageIndicator.test.tsx`

**Step 1: Write component test**

Create `src/components/StorageIndicator.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StorageIndicator from './StorageIndicator';

describe('StorageIndicator', () => {
  it('should render storage usage correctly', () => {
    render(<StorageIndicator used={25000} limit={150000} />);
    
    expect(screen.getByText(/25k/)).toBeInTheDocument();
    expect(screen.getByText(/150k/)).toBeInTheDocument();
  });

  it('should calculate percentage correctly', () => {
    const { container } = render(<StorageIndicator used={30000} limit={150000} />);
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '20%' });
  });

  it('should show warning color when near limit', () => {
    const { container } = render(<StorageIndicator used={140000} limit={150000} />);
    const progressBar = container.querySelector('.bg-yellow-500, .bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/components/StorageIndicator.test.tsx`  
Expected: FAIL - "Cannot find module './StorageIndicator'"

**Step 3: Implement StorageIndicator component**

Create `src/components/StorageIndicator.tsx`:
```typescript
import { formatCharacterCount } from '@/utils/storage/limits';

interface StorageIndicatorProps {
  used: number;
  limit: number;
}

export default function StorageIndicator({ used, limit }: StorageIndicatorProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  
  let barColor = 'bg-blue-500';
  if (percentage >= 90) {
    barColor = 'bg-red-500';
  } else if (percentage >= 70) {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>📝 {formatCharacterCount(used)}/{formatCharacterCount(limit)}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div 
          className={`${barColor} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/components/StorageIndicator.test.tsx`  
Expected: PASS

**Step 5: Commit**

Run:
```bash
git add src/components/StorageIndicator*
git commit -m "feat: add storage indicator component with tests"
```

---

## Task 8: Create Activation Dialog Component

**Files:**
- Create: `src/components/ActivationDialog.tsx`

**Step 1: Implement ActivationDialog component**

Create `src/components/ActivationDialog.tsx`:
```typescript
'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { redeemActivationCode } from '@/utils/activation/redeem';
import { useRouter } from 'next/navigation';

interface ActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActivationDialog({ open, onOpenChange }: ActivationDialogProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await redeemActivationCode(code.trim());
      
      if (result.success) {
        onOpenChange(false);
        router.refresh();
        // Show success toast (we'll add toast system later)
        alert(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('激活失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md z-50 shadow-xl">
          <Dialog.Title className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            🔓 激活你的账户
          </Dialog.Title>
          
          <Dialog.Description className="text-slate-300 mb-6 space-y-2">
            <p>输入激活码解锁完整功能：</p>
            <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
              <li>创建和编辑笔记</li>
              <li>150,000 字符存储空间</li>
              <li>语音播放功能</li>
            </ul>
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="输入激活码"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                  disabled={isLoading}
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? '激活中...' : '激活账户'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Step 2: Commit**

Run:
```bash
git add src/components/ActivationDialog.tsx
git commit -m "feat: add activation dialog component"
```

---

## Task 9: Create UserInfoCard Component

**Files:**
- Create: `src/components/UserInfoCard.tsx`

**Step 1: Implement UserInfoCard component**

Create `src/components/UserInfoCard.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { UserProfile, LANGUAGES } from '@/types/profile';
import { getCharacterLimit } from '@/utils/storage/limits';
import StorageIndicator from './StorageIndicator';
import ActivationDialog from './ActivationDialog';
import Link from 'next/link';

interface UserInfoCardProps {
  profile: UserProfile;
}

export default function UserInfoCard({ profile }: UserInfoCardProps) {
  const [showActivationDialog, setShowActivationDialog] = useState(false);

  if (!profile.is_active) {
    return (
      <>
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-300">👤</span>
            <span className="text-slate-400 truncate">{profile.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <span>⚠️</span>
            <span>账户未激活</span>
          </div>

          <button
            onClick={() => setShowActivationDialog(true)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm"
          >
            🔓 输入激活码
          </button>
        </div>

        <ActivationDialog 
          open={showActivationDialog} 
          onOpenChange={setShowActivationDialog}
        />
      </>
    );
  }

  const language = LANGUAGES.find(l => l.code === profile.target_language);
  const characterLimit = getCharacterLimit(profile.plan_type);
  const usedCharacters = Math.floor(profile.storage_used / 2);

  return (
    <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-300">👤</span>
        <span className="text-slate-400 truncate">{profile.email}</span>
      </div>
      
      {language && (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span>{language.flag}</span>
          <span>{language.name}</span>
          <span className="text-slate-500">({profile.plan_type === 'free' ? 'Free' : 'Pro'})</span>
        </div>
      )}

      <StorageIndicator used={usedCharacters} limit={characterLimit} />

      <Link
        href="/settings"
        className="block w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-center text-sm"
      >
        ⚙️ Settings
      </Link>
    </div>
  );
}
```

**Step 2: Commit**

Run:
```bash
git add src/components/UserInfoCard.tsx
git commit -m "feat: add user info card component"
```

---

## Task 10: Update Sidebar to Include UserInfoCard

**Files:**
- Modify: `src/components/Sidebar.tsx`

**Step 1: Update Sidebar component**

Modify `src/components/Sidebar.tsx`:
```typescript
import Link from 'next/link';
import { Note } from '@/types/note';
import { UserProfile } from '@/types/profile';
import CreateNoteButton from './CreateNoteButton';
import UserInfoCard from './UserInfoCard';

interface SidebarProps {
  notes: Note[];
  profile: UserProfile | null;
}

export default function Sidebar({ notes, profile }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-slate-700 bg-slate-900 h-screen flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-100 mb-4">My Notes</h2>
        <CreateNoteButton isActive={profile?.is_active || false} />
      </div>
      
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/?noteId=${note.id}`}
            className="block p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors truncate"
          >
            {note.title || 'Untitled Note'}
          </Link>
        ))}
      </nav>

      {profile && <UserInfoCard profile={profile} />}
    </aside>
  );
}
```

**Step 2: Commit**

Run:
```bash
git add src/components/Sidebar.tsx
git commit -m "feat: integrate UserInfoCard into Sidebar"
```

---

## Task 11: Update CreateNoteButton with Activation Guard

**Files:**
- Modify: `src/components/CreateNoteButton.tsx`

**Step 1: Add activation check to CreateNoteButton**

Modify `src/components/CreateNoteButton.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { createNote } from '@/utils/notes/queries';
import { useRouter } from 'next/navigation';
import ActivationDialog from './ActivationDialog';

interface CreateNoteButtonProps {
  isActive: boolean;
}

export default function CreateNoteButton({ isActive }: CreateNoteButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!isActive) {
      setShowActivationDialog(true);
      return;
    }

    setIsCreating(true);
    try {
      const newNote = await createNote('Untitled Note', '');
      router.push(`/?noteId=${newNote.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
      >
        {isCreating ? 'Creating...' : '+ New Note'}
      </button>

      {!isActive && (
        <ActivationDialog 
          open={showActivationDialog} 
          onOpenChange={setShowActivationDialog}
        />
      )}
    </>
  );
}
```

**Step 2: Commit**

Run:
```bash
git add src/components/CreateNoteButton.tsx
git commit -m "feat: add activation guard to create note button"
```

---

## Task 12: Update Editor with Activation Guard

**Files:**
- Modify: `src/components/Editor.tsx`

**Step 1: Add activation check to Editor**

Modify `src/components/Editor.tsx` - add props and guard logic:

Find the component definition line:
```typescript
export default function Editor({ note }: { note: Note }) {
```

Replace with:
```typescript
interface EditorProps {
  note: Note;
  isActive: boolean;
}

export default function Editor({ note, isActive }: EditorProps) {
```

Add state for activation dialog after existing useState hooks:
```typescript
const [showActivationDialog, setShowActivationDialog] = useState(false);
```

Import ActivationDialog at the top:
```typescript
import ActivationDialog from './ActivationDialog';
```

Replace the handleSave function:
```typescript
const handleSave = async () => {
  if (!isActive) {
    setShowActivationDialog(true);
    return;
  }
  
  setIsSaving(true);
  try {
    await updateNote(note.id, { title, content });
    setIsEditing(false);
  } catch (e) {
    console.error(e);
    alert('Failed to save');
  } finally {
    setIsSaving(false);
  }
};
```

Add activation dialog before the closing div:
```typescript
{!isActive && (
  <ActivationDialog 
    open={showActivationDialog} 
    onOpenChange={setShowActivationDialog}
  />
)}
```

**Step 2: Commit**

Run:
```bash
git add src/components/Editor.tsx
git commit -m "feat: add activation guard to editor component"
```

---

## Task 13: Update Main Page to Fetch and Pass Profile

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update page to fetch user profile**

Modify `src/app/page.tsx`:
```typescript
import { createServerClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/profile/queries';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerClient();

  // 1. Fetch User Profile
  const profile = await getUserProfile();

  // 2. Fetch Notes List
  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false });

  // 3. Determine Selected Note
  const resolvedSearchParams = await searchParams;
  const selectedNoteId = resolvedSearchParams?.noteId as string;
  let activeNote = null;

  if (selectedNoteId) {
    const { data: note } = await supabase
      .from('notes')
      .select('*')
      .eq('id', selectedNoteId)
      .single();
    activeNote = note;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar notes={notes || []} profile={profile} />
      
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeNote ? (
           <Editor note={activeNote} isActive={profile?.is_active || false} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Select a note to start practicing</p>
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Commit**

Run:
```bash
git add src/app/page.tsx
git commit -m "feat: integrate user profile into main page"
```

---

## Task 14: Create Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`

**Step 1: Implement settings page**

Create `src/app/settings/page.tsx`:
```typescript
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/utils/profile/queries';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/');
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">⚠️ 账户未激活</h1>
          <p className="text-slate-400">请先激活账户才能访问设置</p>
          <a 
            href="/" 
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div>
          <a 
            href="/" 
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
          >
            ← 返回笔记
          </a>
          <h1 className="text-3xl font-bold mt-4">⚙️ 账户设置</h1>
        </div>

        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
```

**Step 2: Create SettingsForm component**

Create `src/app/settings/SettingsForm.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, LANGUAGES } from '@/types/profile';
import { updateTargetLanguage } from '@/utils/profile/queries';
import { getCharacterLimit } from '@/utils/storage/limits';
import StorageIndicator from '@/components/StorageIndicator';

interface SettingsFormProps {
  profile: UserProfile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(profile.target_language || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const isLanguageLocked = profile.plan_type === 'free' && profile.target_language !== null;
  const characterLimit = getCharacterLimit(profile.plan_type);
  const usedCharacters = Math.floor(profile.storage_used / 2);

  const handleSave = async () => {
    if (!selectedLanguage) {
      alert('请选择一种语言');
      return;
    }

    setIsSaving(true);
    try {
      await updateTargetLanguage(selectedLanguage);
      alert('设置已保存');
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🌍 学习语言
        </h2>
        
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            目标语言
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isLanguageLocked}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">请选择语言</option>
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || isLanguageLocked || !selectedLanguage}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? '保存中...' : isLanguageLocked ? '已锁定' : '保存设置'}
        </button>
      </div>

      {/* Storage Usage */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📊 存储使用情况
        </h2>
        
        <div className="space-y-2">
          <p className="text-sm text-slate-400">
            已用: {usedCharacters.toLocaleString()} / {characterLimit.toLocaleString()} 字符
          </p>
          <StorageIndicator used={usedCharacters} limit={characterLimit} />
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

Run:
```bash
git add src/app/settings/
git commit -m "feat: add settings page with language selection"
```

---

## Task 15: Manual Integration Testing

**Goal:** Verify all features work end-to-end.

**Step 1: Start development server**

Run: `npm run dev`

**Step 2: Test inactive user flow**

1. Open `http://localhost:3000`
2. Verify: User info card shows "账户未激活" and "输入激活码" button
3. Click "New Note" → Activation dialog should appear
4. Enter invalid code "INVALID123" → Should show error
5. Enter valid code "HAILMARY" → Should activate successfully
6. Verify: Page refreshes, user info card shows active state

**Step 3: Test language selection**

1. Click "Settings" button in user info card
2. Select "Spanish" from dropdown
3. Click "保存设置"
4. Verify: Redirected to home, language shown in user info card
5. Return to settings → Verify dropdown is disabled (locked)

**Step 4: Test storage display**

1. Create a new note with some content
2. Check user info card → Storage indicator should update
3. Check settings page → Storage usage should match

**Step 5: Test permission guards**

1. Logout and login with new account (or manually set is_active = false in database)
2. Try to click "Edit" on existing note → Should show activation dialog
3. Try to create new note → Should show activation dialog

**Step 6: Document any issues**

If bugs found, create follow-up commits to fix.

---

## Task 16: Update Tests and Run Test Suite

**Files:**
- Update: `src/components/Sidebar.test.tsx`

**Step 1: Update Sidebar test to include profile prop**

Modify `src/components/Sidebar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sidebar from './Sidebar';

const mockProfile = {
  id: 'test-id',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: 'es',
  created_at: '2026-01-15T00:00:00Z'
};

describe('Sidebar', () => {
  it('renders correctly with notes', () => {
    const notes = [
      { id: '1', title: 'Test Note 1', updated_at: '2024-01-01' },
      { id: '2', title: 'Test Note 2', updated_at: '2024-01-02' },
    ];

    render(<Sidebar notes={notes} profile={mockProfile} />);

    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();
  });

  it('renders empty state when no notes', () => {
    render(<Sidebar notes={[]} profile={mockProfile} />);
    expect(screen.getByText('My Notes')).toBeInTheDocument();
  });
});
```

**Step 2: Run all tests**

Run: `npm test`  
Expected: All tests should pass

**Step 3: Commit**

Run:
```bash
git add src/components/Sidebar.test.tsx
git commit -m "test: update sidebar tests with profile prop"
```

---

## Task 17: Final Verification and Documentation

**Step 1: Run build to check for TypeScript errors**

Run: `npm run build`  
Expected: Build should succeed with no errors

**Step 2: Create verification checklist**

Create a file documenting completed features:

Create `docs/verification/2026-01-15-profile-features.md`:
```markdown
# User Profile Features Verification

## Completed Features

### 1. User Info Card
- [x] Shows inactive state with activation button
- [x] Shows active state with language, storage, and settings button
- [x] Displays correct user email
- [x] Fixed at bottom of sidebar

### 2. Activation Dialog
- [x] Appears when inactive user clicks "New Note"
- [x] Appears when inactive user clicks "Edit"
- [x] Appears when clicking activation button in user card
- [x] Validates activation codes correctly
- [x] Shows appropriate error messages
- [x] Refreshes page on success

### 3. Settings Page
- [x] Accessible only to active users
- [x] Language selection dropdown with 7 languages
- [x] Locks language selection for free users after first save
- [x] Displays storage usage with progress bar
- [x] Back button returns to home

### 4. Permission Guards
- [x] CreateNoteButton checks is_active before creating
- [x] Editor checks is_active before editing
- [x] Both show activation dialog when inactive

### 5. Storage Display
- [x] Character-based display (not KB)
- [x] Progress bar with color coding
- [x] Configurable via environment variables

## Test Activation Codes
- HAILMARY (10 uses available)
- VIP-ONLY-ONE (1 use)

## Environment Variables Added
- NEXT_PUBLIC_FREE_STORAGE_LIMIT=300000
- NEXT_PUBLIC_PRO_STORAGE_LIMIT=10000000
- NEXT_PUBLIC_FREE_LANGUAGE_LIMIT=1
```

**Step 3: Commit verification doc**

Run:
```bash
git add docs/verification/
git commit -m "docs: add verification checklist for profile features"
```

**Step 4: Final commit and push**

Run:
```bash
git push origin HEAD
```

---

## Completion

All tasks completed! The implementation includes:

1. ✅ Database verification
2. ✅ Type definitions
3. ✅ Utility functions with tests
4. ✅ UI components (UserInfoCard, ActivationDialog, StorageIndicator)
5. ✅ Permission guards on create/edit operations
6. ✅ Settings page with language selection
7. ✅ Environment variable configuration
8. ✅ Integration with existing components
9. ✅ Test coverage
10. ✅ Documentation

**Ready for review and testing!**
