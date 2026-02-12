'use client';

import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Note } from '@/types/note';
import { updateNote, deleteNote } from '@/utils/notes/queries';
import NotePlayer from './NotePlayer';
import { useRouter } from 'next/navigation';
import ActivationDialog from './ActivationDialog';
import ShareActions from './ShareActions';
import { ROUTES, UNTITLED_NOTE_TITLE } from '@/constants';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';

interface EditorProps {
  note: Note;
  isActive: boolean;
  targetLanguage: string | null;
  initialEditMode?: boolean;
}

export default function Editor({ note, isActive, targetLanguage, initialEditMode = false }: EditorProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const isFirstMount = useRef(true);

  // Sync state if note prop changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || '');

    // On initial component mount, the state is already correctly initialized
    // by useState. For all subsequent updates (e.g. navigating between notes),
    // we set the editing state based on the `initialEditMode` prop.
    if (!isFirstMount.current) {
      setIsEditing(initialEditMode);
    }

    isFirstMount.current = false;
  }, [note.id, initialEditMode]);

  const AUTO_TITLE_MAX_LENGTH = 60;

  const normalizeTitle = (value: string) => {
    return value
      .replace(/^\s{0,3}(#{1,6}|>|\*|-|\+|\d+\.)\s+/u, '')
      .replace(/[`*_]/g, '')
      .trim();
  };

  const buildAutoTitle = (value: string) => {
    const firstLine = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    if (!firstLine) {
      return null;
    }

    const cleanedLine = normalizeTitle(firstLine);
    if (!cleanedLine) {
      return null;
    }

    const words = cleanedLine.split(/\s+/);

    let result = '';
    for (const word of words) {
      const next = result ? `${result} ${word}` : word;
      if (next.length > AUTO_TITLE_MAX_LENGTH) {
        break;
      }
      result = next;
    }

    return result || cleanedLine;
  };

  const displayTitle = title && title !== UNTITLED_NOTE_TITLE
    ? title
    : t('notes.untitled');

  const handleSave = async () => {
    if (!isActive) {
      setShowActivationDialog(true);
      return;
    }

    setIsSaving(true);
    try {
      const trimmedTitle = title.trim();
      const isTitleEmpty = trimmedTitle.length === 0 || trimmedTitle === UNTITLED_NOTE_TITLE;
      const nextTitle = isTitleEmpty
        ? buildAutoTitle(content) ?? UNTITLED_NOTE_TITLE
        : trimmedTitle;

      await updateNote(note.id, { title: nextTitle, content });
      setTitle(nextTitle);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      toast({ title: t('editor.saveFailed'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(note.id);
      setShowDeleteDialog(false);
      router.push(ROUTES.app);
    } catch {
      toast({ title: t('editor.deleteFailed'), variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div
        data-testid="editor-surface"
        className="space-y-6 md:rounded-2xl md:border md:border-slate-200 bg-white p-2 md:p-6 text-slate-900 md:shadow-sm dark:md:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
      >
        {/* Header / Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-2xl md:text-3xl font-bold text-slate-900 border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white placeholder-slate-400 dark:text-slate-100 dark:placeholder-slate-500 dark:focus-visible:ring-offset-slate-900"
            placeholder={t('editor.noteTitlePlaceholder')}
          />
        ) : (
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex-1 truncate dark:text-slate-100">{displayTitle}</h1>
        )}

        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
            {isEditing && (
                <>
                <button 
                    onClick={async () => {
                        // 检查是否是新建且仍然为空的笔记
                        const wasNewNote = !note.content && note.title === UNTITLED_NOTE_TITLE;
                        const isStillEmpty = content.trim() === '' && title.trim() === UNTITLED_NOTE_TITLE;

                        if (wasNewNote && isStillEmpty) {
                            // 新笔记且用户没有输入任何内容，删除它
                            try {
                                await deleteNote(note.id);
                                router.push(ROUTES.app);
                            } catch (error) {
                                console.error('Failed to delete empty note:', error);
                                toast({ title: t('editor.deleteNoteFailed'), variant: 'destructive' });
                            }
                        } else {
                            // 恢复原内容
                            setIsEditing(false);
                            setTitle(note.title);
                            setContent(note.content || '');
                        }
                    }}
                    className="px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 dark:text-slate-400 dark:hover:text-slate-100"
                >
                    {t('editor.cancel')}
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                >
                    {isSaving ? t('editor.saving') : t('editor.save')}
                </button>
                </>
            )}
        </div>
      </div>

        {/* Content Area */}
        {isEditing ? (
          <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[calc(100vh-200px)] bg-white border border-slate-200 rounded-xl p-4 md:p-6 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white resize-none leading-relaxed dark:bg-slate-900/40 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus-visible:ring-offset-slate-900"
              placeholder={t('editor.placeholder')}
          />
        ) : (
          <NotePlayer content={content} targetLanguage={targetLanguage} />
        )}

        {!isActive && (
          <ActivationDialog 
            open={showActivationDialog} 
            onOpenChange={setShowActivationDialog}
          />
        )}

        {!isEditing && (
          <ShareActions
            noteId={note.id}
            onRequestEdit={() => setIsEditing(true)}
            onRequestDelete={() => setShowDeleteDialog(true)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 dark:bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm z-50 shadow-xl dark:bg-slate-800 dark:border-slate-700">
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t('notes.deleteTitle')}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t('notes.deleteDescription')}
              </Dialog.Description>
              <div className="mt-4 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                    {t('editor.cancel')}
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50"
                >
                  {isDeleting ? t('notes.deleting') : t('editor.delete')}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
