# 💬 Project Conversation History
**Date:** Jan 12, 2026
**Project:** Spanish Notes App (Web + Supabase)

## 1. Initial Requirement (需求分析)
*   **User Goal:** A simple tool to parse mixed Spanish/English notes.
*   **Key Feature:** Clicking on Spanish text should play audio (TTS).
*   **Input Format:** Markdown-style notes with headings (`##`) and tables.
*   **Target Audience:** Beginner Spanish learners (self-use).

## 2. Technical Decisions (技术选型)
*   **Architecture:** Static Web App (HTML/CSS/JS) - No backend server code required.
*   **Audio Engine:** **Web Speech API** (Browser Native).
    *   *Reason:* Free, zero-latency, good enough quality for learning.
    *   *Logic:* Auto-detects "Monica", "Google", or "Mexico" voices.
*   **Database & Auth:** **Supabase**.
    *   *Reason:* Firebase is blocked in China. Supabase (PostgreSQL) works globally and fits the structured data model.
    *   *Auth:* **Google OAuth** (to prevent spam registration).
*   **Hosting:** **Cloudflare Pages** (Planned).
    *   *Reason:* Free, fast global CDN.

## 3. Implementation Steps (实施过程)
### Phase 1: Prototype (Local)
*   Created `index.html`, `style.css`, `script.js`.
*   Implemented custom parser for:
    *   Headings (`## ① ...`) -> Clickable sentences.
    *   Tables (`| es | en |`) -> Clickable first column.
    *   Text Blocks -> Spanish line clickable.

### Phase 2: Cloud Integration (Supabase)
*   **User System:** Added Google Login overlay.
*   **Data Sync:**
    *   `loadNotesList()`: Fetches user's notes on login.
    *   `triggerSave()`: Auto-saves content to Supabase `notes` table (debounced).
    *   **RLS (Security):** Configured Row Level Security so users only see their own notes.

## 4. Key Configurations (关键配置代码)

### A. Supabase SQL Setup
(Run this in Supabase SQL Editor)
```sql
create extension if not exists "uuid-ossp";

create table if not exists notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notes enable row level security;

-- Policies
create policy "Users can see own notes" on notes for select using ( auth.uid() = user_id );
create policy "Users can insert own notes" on notes for insert with check ( auth.uid() = user_id );
create policy "Users can update own notes" on notes for update using ( auth.uid() = user_id );
create policy "Users can delete own notes" on notes for delete using ( auth.uid() = user_id );
```

### B. OAuth Configuration
*   **Supabase:** Enabled "Google" provider, added Client ID/Secret.
*   **Google Cloud:** Added `http://localhost:8000` to Authorized Redirect URIs.

## 5. Deployment Plan (部署计划)
1.  Upload project folder to **Cloudflare Pages**.
2.  Get the new domain (e.g., `https://spanish-app.pages.dev`).
3.  **CRITICAL:** Update Redirect URLs in **both** Google Cloud Console and Supabase Dashboard to match the new domain.

---
*Captured from OpenCode Session*
