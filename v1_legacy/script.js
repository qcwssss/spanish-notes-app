// --- CONFIGURATION ---
// NOTE: This is legacy code. These keys are removed for security.
// If you need to run this legacy version, replace these placeholders with your actual keys.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; 

// Check if Supabase SDK is loaded
if (typeof supabase === 'undefined') {
    alert('Critical Error: Supabase SDK failed to load. Please check your internet connection or try a VPN.');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATE ---
let currentUser = null;
let currentNoteId = null;
let saveTimeout = null;
let voices = [];

// --- DOM ELEMENTS ---
const loginOverlay = document.getElementById('loginOverlay');
const mainApp = document.getElementById('mainApp');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');
const userEmail = document.getElementById('userEmail');
const notesList = document.getElementById('notesList');
const newNoteBtn = document.getElementById('newNoteBtn');

const noteTitle = document.getElementById('noteTitle');
const noteInput = document.getElementById('noteInput');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const saveStatus = document.getElementById('saveStatus');

const editModeBtn = document.getElementById('editModeBtn');
const viewModeBtn = document.getElementById('viewModeBtn');
const editView = document.getElementById('editView');
const playView = document.getElementById('playView');
const contentDisplay = document.getElementById('contentDisplay');
const voiceSelect = document.getElementById('voiceSelect');

// --- AUTHENTICATION ---
async function checkUser() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        
        if (session) {
            console.log('Session found:', session.user.email);
            handleLoginSuccess(session.user);
        } else {
            console.log('No active session.');
            loginOverlay.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }

        supabaseClient.auth.onAuthStateChange((_event, session) => {
            if (session) handleLoginSuccess(session.user);
        });
    } catch (err) {
        console.error('Auth Check Error:', err);
        alert('Auth Check Error: ' + err.message);
    }
}

function handleLoginSuccess(user) {
    currentUser = user;
    loginOverlay.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    userEmail.textContent = user.email;
    if (user.user_metadata && user.user_metadata.avatar_url) {
        userAvatar.src = user.user_metadata.avatar_url;
    }
    
    loadNotesList();
}

// DEBUG: Enhanced Login Handler
googleLoginBtn.addEventListener('click', async () => {
    console.log('Button clicked! Attempting Google Login...');
    googleLoginBtn.textContent = 'Connecting to Google...';
    googleLoginBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.href, // Redirect back to localhost
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            throw error;
        }
        
        console.log('OAuth initiated:', data);
        // Note: The page should redirect now.
        
    } catch (err) {
        console.error('Login Error:', err);
        alert('Login Failed: ' + err.message);
        googleLoginBtn.textContent = 'Sign in with Google';
        googleLoginBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.reload();
});

// --- DATABASE OPERATIONS ---
async function loadNotesList() {
    notesList.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    const { data, error } = await supabaseClient
        .from('notes')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error loading notes:', error);
        notesList.innerHTML = '<div style="padding:1rem; color:red">Error loading notes</div>';
        return;
    }

    renderNotesList(data || []);
    
    if (data && data.length > 0 && !currentNoteId) {
        loadNoteContent(data[0].id);
    } else if (!data || data.length === 0) {
        createNewNote();
    }
}

function renderNotesList(notes) {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const div = document.createElement('div');
        div.className = `note-item ${note.id === currentNoteId ? 'active' : ''}`;
        div.textContent = note.title || 'Untitled Note';
        div.onclick = () => loadNoteContent(note.id);
        notesList.appendChild(div);
    });
}

async function loadNoteContent(id) {
    currentNoteId = id;
    // Update visual active state
    Array.from(notesList.children).forEach((child, index) => {
        // Simple visual update logic - for robust app use data-id
        child.classList.remove('active');
        // This matching logic is imperfect but sufficient for MVP
    });

    const { data, error } = await supabaseClient
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
        
    if (data) {
        noteTitle.value = data.title || '';
        noteInput.value = data.content || '';
        saveStatus.textContent = 'Synced';
        
        if (!playView.classList.contains('hidden')) {
            renderParsedContent();
        }
    }
}

function triggerSave() {
    saveStatus.textContent = 'Saving...';
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(async () => {
        if (!currentNoteId || !currentUser) return;

        const updates = {
            id: currentNoteId,
            user_id: currentUser.id,
            title: noteTitle.value,
            content: noteInput.value,
            updated_at: new Date()
        };

        const { error } = await supabaseClient
            .from('notes')
            .upsert(updates);

        if (error) {
            console.error('Save failed:', error);
            saveStatus.textContent = 'Error saving';
        } else {
            saveStatus.textContent = 'Saved';
            loadNotesList(); // Refresh list to update titles
        }
    }, 1000);
}

async function createNewNote() {
    if (!currentUser) return;
    
    const { data, error } = await supabaseClient
        .from('notes')
        .insert([{ 
            user_id: currentUser.id, 
            title: '', 
            content: '' 
        }])
        .select()
        .single();
        
    if (data) {
        loadNotesList();
        loadNoteContent(data.id);
        editModeBtn.click();
    }
}

async function deleteCurrentNote() {
    if (!currentNoteId) return;

    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
        return;
    }

    saveStatus.textContent = 'Deleting...';

    const { error } = await supabaseClient
        .from('notes')
        .delete()
        .eq('id', currentNoteId);

    if (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note: ' + error.message);
        saveStatus.textContent = 'Error';
    } else {
        currentNoteId = null;
        noteTitle.value = '';
        noteInput.value = '';
        saveStatus.textContent = 'Deleted';
        loadNotesList();
    }
}

newNoteBtn.addEventListener('click', createNewNote);
deleteNoteBtn.addEventListener('click', deleteCurrentNote);
noteTitle.addEventListener('input', triggerSave);
noteInput.addEventListener('input', triggerSave);

// --- PARSER & TTS ---
function populateVoices() {
    voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    voiceSelect.innerHTML = '';
    if (voices.length === 0) {
        const option = document.createElement('option');
        option.textContent = "Default Spanish";
        voiceSelect.appendChild(option);
        return;
    }
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.name.includes('Monica') || voice.name.includes('Google') || voice.lang === 'es-MX') {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });
}
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
}
populateVoices();

function speak(text, element) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voices.length > 0) utterance.voice = voices[voiceSelect.value || 0];
    else utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    
    element.classList.add('playing');
    utterance.onend = () => element.classList.remove('playing');
    window.speechSynthesis.speak(utterance);
}

function renderParsedContent() {
    contentDisplay.innerHTML = '';
    const text = noteInput.value;
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
        let line = lines[i].trim();
        if (!line) { i++; continue; }

        if (line.startsWith('##')) {
            const cleanText = line.replace(/^##\s*[①-⑩0-9.]+\s*/, '').replace(/^##\s*/, '').trim();
            const div = document.createElement('div');
            div.className = 'parsed-heading';
            div.textContent = line.replace(/^##\s*/, '');
            div.onclick = (e) => speak(cleanText, e.target);
            contentDisplay.appendChild(div);
            i++;
        } else if (line.startsWith('|')) {
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-container';
            const table = document.createElement('table');
            const headerRow = document.createElement('tr');
            line.split('|').filter(c => c.trim()).forEach(h => {
                const th = document.createElement('th');
                th.textContent = h.trim();
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            i++;
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                const rowLine = lines[i].trim();
                if (rowLine.includes('---')) { i++; continue; }
                const tr = document.createElement('tr');
                const cells = rowLine.split('|').map(c => c.trim()).filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1);
                cells.forEach((cellText, colIndex) => {
                    const td = document.createElement('td');
                    td.textContent = cellText;
                    if (colIndex === 0) {
                        td.className = 'playable-cell';
                        td.onclick = (e) => speak(cellText, e.target);
                    }
                    tr.appendChild(td);
                });
                table.appendChild(tr);
                i++;
            }
            tableContainer.appendChild(table);
            contentDisplay.appendChild(tableContainer);
        } else {
             const hasChinese = /[\u4e00-\u9fa5]/.test(line);
             if (!hasChinese && i + 1 < lines.length && /[\u4e00-\u9fa5]/.test(lines[i+1])) {
                 const div = document.createElement('div');
                 div.className = 'text-block';
                 div.innerHTML = `<div class="spanish-line" onclick="speak('${line.replace(/'/g, "\\'")}', this)">${line}</div><div class="chinese-line">${lines[i+1]}</div>`;
                 contentDisplay.appendChild(div);
                 i += 2;
             } else {
                 const p = document.createElement('p');
                 p.style.padding = '0.5rem';
                 p.style.color = '#94a3b8';
                 p.textContent = line;
                 contentDisplay.appendChild(p);
                 i++;
             }
        }
    }
}

// UI Switchers
editModeBtn.addEventListener('click', () => {
    editModeBtn.classList.add('active');
    viewModeBtn.classList.remove('active');
    editView.classList.remove('hidden');
    playView.classList.add('hidden');
});
viewModeBtn.addEventListener('click', () => {
    viewModeBtn.classList.add('active');
    editModeBtn.classList.remove('active');
    playView.classList.remove('hidden');
    editView.classList.add('hidden');
    renderParsedContent();
});

// Start
checkUser();
