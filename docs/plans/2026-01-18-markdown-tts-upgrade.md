# Markdown & TTS Engine Upgrade Plan

**Goal:** Replace custom parser with standard Markdown rendering (`react-markdown`) and ensure click-to-speak reads only the user’s target language.

**Reason:** Current parser fails on standard Markdown (lists, bolding, headings) and TTS reads formatting symbols/non-target language content.

---

## Part 1: Architecture & Data Flow

### Display Flow
- **Current:** `NotePlayer → useAudioParser → blocks`
- **Target:** `NotePlayer → MarkdownRenderer → react-markdown → HTML`
- Use `react-markdown + remark-gfm` to render Markdown so users see clean formatted content (no `**`, `#`, `-`).

### Speech Flow
- User clicks a rendered block → `speak(rawText)`
- `speak` internally calls `extractTargetText(rawText, targetLanguage)`
- Only target-language text is spoken; other languages are stripped

---

## Part 2: Component Structure & Multi-language Filtering

### Components
**`MarkdownRenderer` (new)**
- Props: `content: string`, `targetLanguage: string | null`
- Uses `react-markdown` with `remark-gfm`
- Overrides renderers for: `p`, `li`, `h1`-`h6`, `td`
- Each block becomes clickable only if `extractTargetText(...)` returns non-empty text

**`NotePlayer` (update)**
- Replace `useAudioParser` usage
- Render `<MarkdownRenderer content={content} targetLanguage={profile?.target_language} />`

### Multi-language Filter (`extractTargetText`)
- Central utility: `src/utils/language/extractor.ts`
- Uses language-specific regex based on user `target_language`
- If result is empty → no speech and no hover state

**Supported languages (initial)**
- `es`, `fr`, `de`, `en`, `pt`, `it`, `nl`

**Example behavior**
- `"**Soy** (我是)"` → speaks `"Soy"`
- `"我是一个好奇的人"` → no speech
- Spanish paragraph → reads full sentence

---

## Implementation Steps

1. **Install Dependencies**
   - `npm install react-markdown remark-gfm`
2. **Create Language Filter**
   - `src/utils/language/extractor.ts`
   - Regex sets per language (Spanish includes áéíóúñü + ¿¡)
3. **Create MarkdownRenderer**
   - Custom renderers for `p`, `li`, `h1-h6`, `td`
   - Hover UI for clickable blocks
4. **Update useTTS**
   - Apply `extractTargetText` before speech
5. **Integrate in NotePlayer**
   - Replace custom parser flow

---

## Verification
- [ ] Markdown renders without raw symbols (`**`, `#`, `-`).
- [ ] Clicking Spanish text reads only Spanish.
- [ ] Mixed-language lines read only target language.
- [ ] Pure Chinese blocks do not trigger speech.
