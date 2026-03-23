import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import LandingAuthDialog from '@/components/LandingAuthDialog';
import { createServerClient } from '@/utils/supabase/server';
import { ROUTES } from '@/constants';
import { PenTool, Mic, Globe2, Share2, BookOpen, Folder, FileText, ChevronRight } from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ROUTES.app);
  }

  const locale = await getServerLocale();
  const t = createTranslator(locale);

  return (
    <div className="min-h-screen bg-[#060608] text-slate-300 font-sans selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden">
      
      {/* Immersive Background Effects */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="absolute top-[-10%] h-[40rem] w-[60rem] animate-pulse rounded-[100%] bg-blue-600/10 blur-[150px] opacity-70" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <BookOpen className="h-6 w-6 text-blue-500" />
          <span>Viva<span className="text-blue-500">Note</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 rounded-sm">Features</Link>
          <Link href={ROUTES.faq} className="hover:text-white transition-colors cursor-pointer">FAQ</Link>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <LandingAuthDialog triggerLabel={t('landing.startWriting')} />
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-24 md:pt-24 md:px-8">
        
        {/* Hero Section */}
        <section className="mb-20 flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl md:leading-[1.1]">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-400 sm:text-xl">
             {t('landing.heroSubtitle')}
          </p>
        </section>

        {/* Feature Preview Window (The center piece from the mockup) */}
        <section className="relative mx-auto max-w-5xl mb-32 group">
          {/* Subtle Outer Glow for the Window */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-600/30 via-transparent to-blue-900/30 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="relative flex min-h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0A0A0C] shadow-2xl backdrop-blur-xl sm:flex-row">
            
            {/* Sidebar (Folders) */}
            <aside className="w-full border-b border-slate-800/60 bg-[#111115]/50 p-4 sm:w-64 sm:border-b-0 sm:border-r">
               <div className="mb-6 flex items-center gap-2 font-bold text-lg tracking-tight text-white px-2">
                  <span>Viva<span className="text-blue-500">Note</span></span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <Folder className="h-3.5 w-3.5" />
                  Notebooks
                </div>
                <div className="mt-2 space-y-1 pl-4 text-sm font-medium text-slate-400">
                  <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800/50 hover:text-white transition-colors">
                    <FileText className="h-4 w-4" /> Grammar Notes
                  </div>
                  <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800/50 hover:text-white transition-colors">
                    <FileText className="h-4 w-4" /> Travel Phrases
                  </div>
                  <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800/50 hover:text-white transition-colors">
                    <FileText className="h-4 w-4" /> Reading Practice
                  </div>
                  <div className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg bg-blue-500/10 px-2 py-1.5 text-blue-400">
                    <ChevronRight className="h-4 w-4" /> Diario de Viaje
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Editor Area */}
            <div className="flex flex-1 flex-col">
              {/* Editor Header */}
              <header className="flex h-14 items-center justify-between border-b border-slate-800/60 px-6">
                <div className="text-sm font-medium text-slate-300">Diario de Viaje - Madrid</div>
                <div className="rounded-md bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-400">Note Editor</div>
              </header>

              {/* Editor Content (Markdown Syntax Highlighted) */}
              <div className="flex-1 p-6 md:p-8 font-mono text-sm leading-relaxed text-slate-300">
                <div className="space-y-4">
                   <div className="font-bold text-white text-base">
                    <span className="text-blue-500">#</span> Diario de Viaje - Madrid
                   </div>

                   <div className="pt-2 text-slate-400">
                     <span className="text-purple-400 font-semibold">##</span> <span className="text-pink-400">Vocabulario Nuevo</span> (New Vocabulary)
                   </div>

                   <div className="pt-2 pl-4">
                    <span className="text-blue-400">-</span> **el amanecer**: <span className="text-slate-500 italic">the sunrise</span><br/>
                    <span className="text-blue-400">-</span> **la callejuela**: <span className="text-slate-500 italic">the narrow street</span><br/>
                    <span className="text-blue-400">-</span> **disfrutar**: <span className="text-slate-500 italic">to enjoy</span>
                   </div>

                   <div className="pt-4 text-slate-400">
                     <span className="text-purple-400 font-semibold">##</span> <span className="text-pink-400">Práctica de Frases</span> (Sentence Practice)
                   </div>

                   <div className="pt-2 pl-4">
                     <span className="text-green-400">&quot;Me encanta caminar por las <span className="underline decoration-green-400/50 underline-offset-4 cursor-pointer hover:bg-green-400/20 rounded">callejuelas</span> de Madrid al <span className="underline decoration-green-400/50 underline-offset-4 cursor-pointer hover:bg-green-400/20 rounded">amanecer</span>.&quot;</span><br/>
                     <span className="text-slate-500 italic">I love walking through the narrow streets of Madrid at sunrise. </span>
                     <span className="inline-flex items-center justify-center rounded bg-slate-800 px-1 py-0.5 mt-1">
                       <Mic className="h-3 w-3 text-blue-400" />
                     </span>
                   </div>
                   
                   <div className="pt-6">
                     <span className="text-yellow-400">tag:</span> <span className="text-cyan-400">#travel</span> <span className="text-cyan-400">#spanish</span> <span className="text-cyan-400">#b2_level</span>
                   </div>

                   {/* Simulated Blinking Cursor */}
                    <div className="mt-4 flex items-center">
                      <div className="h-5 w-2 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-blue-500/80" />
                    </div>
                </div>
              </div>

              {/* Editor Footer */}
              <footer className="flex h-10 items-center justify-between border-t border-slate-800/60 px-6 text-xs text-slate-500">
                <div>2,143 words</div>
                <div className="flex gap-4">
                  <span>Last sync: 1 min ago</span>
                  <span>Dark Mode</span>
                </div>
              </footer>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-3">
          {[
            { icon: PenTool, title: 'Rich Text & Syntax', desc: t('landing.featureWrite') },
            { icon: Globe2, title: 'Organized Structure', desc: t('landing.featureLanguage') },
            { icon: Share2, title: 'Seamless Sync', desc: t('landing.featureShare') },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-inner">
                <Icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-200">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {desc}
              </p>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}
