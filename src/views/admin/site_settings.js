import { supabase } from '../../supabase.js'

export async function renderSiteSettings(container) {
    container.innerHTML = `
        <div class="view-header">
            <h1>Site Content Management</h1>
            <p>Update dynamic content on the front-end landing page and chatbot.</p>
        </div>

        <div class="settings-grid">
            <!-- Hero Note Section -->
            <div class="settings-card">
                <div class="card-header">
                    <h3>📢 Hero Announcement</h3>
                    <p>The rolling note displayed in the main hero section.</p>
                </div>
                <div class="card-body">
                    <form id="hero-note-form">
                        <div class="form-group">
                            <label>English</label>
                            <input type="text" name="en" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label>Arabic</label>
                            <input type="text" name="ar" class="form-input" required dir="rtl">
                        </div>
                        <div class="form-group">
                            <label>French</label>
                            <input type="text" name="fr" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label>German</label>
                            <input type="text" name="de" class="form-input" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Update Announcement</button>
                    </form>
                </div>
            </div>

            <!-- Chatbot QA Section -->
            <div class="settings-card full-width">
                <div class="card-header">
                    <h3>🤖 Chatbot Knowledge Base</h3>
                    <p>Manage common questions and answers for Greta.</p>
                    <div class="lang-tabs" id="qa-lang-tabs">
                        <button class="lang-tab active" data-lang="en">English</button>
                        <button class="lang-tab" data-lang="ar">العربية</button>
                        <button class="lang-tab" data-lang="fr">Français</button>
                        <button class="lang-tab" data-lang="de">Deutsch</button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="qa-list" class="qa-list">
                        <!-- QA items will be injected here -->
                    </div>
                    <button id="add-qa-btn" class="btn btn-outline" style="margin-top: 1rem;">+ Add New Question Pair</button>
                    <div style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                        <button id="save-qa-btn" class="btn btn-primary">Save All Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const heroForm = document.getElementById('hero-note-form');
    const qaList = document.getElementById('qa-list');
    const addQaBtn = document.getElementById('add-qa-btn');
    const saveQaBtn = document.getElementById('save-qa-btn');
    const langTabs = document.querySelectorAll('.lang-tab');

    let currentConfig = {};
    let activeLang = 'en';

    // Load Data
    async function loadSettings() {
        const { data, error } = await supabase.from('site_config').select('*');
        if (error) {
            console.error(error);
            return;
        }

        data.forEach(item => {
            currentConfig[item.key] = item.value;
        });

        // Fill Hero Form
        const heroNote = currentConfig['hero_note'] || {};
        heroForm.en.value = heroNote.en || '';
        heroForm.ar.value = heroNote.ar || '';
        heroForm.fr.value = heroNote.fr || '';
        heroForm.de.value = heroNote.de || '';

        renderQaList();
    }

    function renderQaList() {
        const qaData = currentConfig['chatbot_qa'] || {};
        const langData = qaData[activeLang] || [];
        
        qaList.innerHTML = langData.map((item, index) => `
            <div class="qa-item" data-index="${index}">
                <div class="qa-inputs">
                    <div class="form-group">
                        <label>Keywords (comma separated)</label>
                        <input type="text" class="qa-keywords form-input" value="${item.keywords.join(', ')}" placeholder="e.g. price, cost, fees">
                    </div>
                    <div class="form-group">
                        <label>Answer</label>
                        <textarea class="qa-answer form-input" rows="2">${item.answer}</textarea>
                    </div>
                </div>
                <button class="delete-qa btn-icon" title="Delete Pair">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </div>
        `).join('');

        // Event listeners for delete
        qaList.querySelectorAll('.delete-qa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.closest('.qa-item').dataset.index);
                currentConfig['chatbot_qa'][activeLang].splice(index, 1);
                renderQaList();
            });
        });
    }

    // Tab Logic
    langTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            langTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeLang = tab.dataset.lang;
            renderQaList();
        });
    });

    // Add QA Pair
    addQaBtn.addEventListener('click', () => {
        if (!currentConfig['chatbot_qa']) currentConfig['chatbot_qa'] = {};
        if (!currentConfig['chatbot_qa'][activeLang]) currentConfig['chatbot_qa'][activeLang] = [];
        
        currentConfig['chatbot_qa'][activeLang].push({ keywords: [], answer: '' });
        renderQaList();
    });

    // Save Hero Note
    heroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedHero = {
            en: heroForm.en.value,
            ar: heroForm.ar.value,
            fr: heroForm.fr.value,
            de: heroForm.de.value
        };

        const { error } = await supabase
            .from('site_config')
            .upsert({ key: 'hero_note', value: updatedHero, updated_at: new Date() });

        if (error) alert('Error saving: ' + error.message);
        else alert('Hero announcement updated successfully!');
    });

    // Save QA Data
    saveQaBtn.addEventListener('click', async () => {
        // Collect current list data first for active tab
        const items = qaList.querySelectorAll('.qa-item');
        const updatedLangData = [];
        items.forEach(item => {
            const keywords = item.querySelector('.qa-keywords').value.split(',').map(k => k.trim()).filter(k => k);
            const answer = item.querySelector('.qa-answer').value.trim();
            if (keywords.length && answer) {
                updatedLangData.push({ keywords, answer });
            }
        });

        currentConfig['chatbot_qa'][activeLang] = updatedLangData;

        const { error } = await supabase
            .from('site_config')
            .upsert({ key: 'chatbot_qa', value: currentConfig['chatbot_qa'], updated_at: new Date() });

        if (error) alert('Error saving: ' + error.message);
        else alert('Chatbot knowledge base saved successfully!');
    });

    loadSettings();
}
