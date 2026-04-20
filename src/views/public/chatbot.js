export function initChatbot() {
    const existing = document.getElementById('greta-chatbot');
    if (existing) existing.remove();

    const chatbotHtml = `
        <div id="greta-chatbot" class="fixed bottom-6 right-6 z-[100] font-sans">
            <div id="chatbot-window" class="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-card-bg border border-accent-subtle rounded-sm shadow-2xl flex flex-col overflow-hidden" style="display: none;">
                <!-- Header -->
                <div class="bg-accent-subtle p-4 border-b border-accent-subtle flex justify-between items-center" style="background: rgba(197, 160, 89, 0.1);">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-bg shadow-lg" style="background: var(--lp-accent); width: 40px; height: 40px; border-radius: 50%; color: #0A0A0A; display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        </div>
                        <div>
                            <h3 class="text-text-main font-bold text-sm tracking-widest uppercase" style="color: var(--lp-text-main); font-size: 0.8rem; letter-spacing: 0.1em;">Greta</h3>
                            <p class="text-accent font-bold uppercase tracking-widest" style="color: var(--lp-accent); font-size: 0.6rem; letter-spacing: 0.2em;">Virtual Assistant</p>
                        </div>
                    </div>
                    <button id="close-chat" class="text-text-dim hover:text-text-main transition-colors p-1" style="background: none; border: none; color: var(--lp-text-dim); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <!-- Chat Content -->
                <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/50 lp-custom-scroll" style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; overflow-y: auto; flex: 1; background: rgba(10, 10, 10, 0.5);">
                    <!-- Lang Selection initially -->
                    <div id="lang-selection" class="h-full flex flex-col items-center justify-center text-center space-y-6" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 1.5rem;">
                        <div class="space-y-2">
                             <p class="text-text-main font-serif text-lg leading-relaxed" style="color: var(--lp-text-main); font-size: 1.1rem; line-height: 1.6;">
                                👋 Welcome to GSL!<br/>
                                مرحباً بك في GSL!<br/>
                                Bienvenue chez GSL !<br/>
                                Willkommen bei GSL!
                            </p>
                            <p class="text-text-dim text-xs uppercase tracking-widest pt-2" style="color: var(--lp-text-dim); font-size: 0.7rem; letter-spacing: 0.1em; margin-top: 0.5rem;">Choose your language / اختر لغتك</p>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; width: 100%; padding: 0 1rem;">
                            <button class="chat-lang-btn" data-lang="en" style="background: #0A0A0A; border: 1px solid var(--lp-border-accent); color: var(--lp-text-dim); padding: 0.75rem; border-radius: 2px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">🇬🇧</span>
                                <span style="font-size: 0.7rem; font-weight: bold; letter-spacing: 0.1em;">ENGLISH</span>
                            </button>
                            <button class="chat-lang-btn" data-lang="ar" style="background: #0A0A0A; border: 1px solid var(--lp-border-accent); color: var(--lp-text-dim); padding: 0.75rem; border-radius: 2px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">🇩🇿</span>
                                <span style="font-size: 0.7rem; font-weight: bold; letter-spacing: 0.1em;">العربية</span>
                            </button>
                            <button class="chat-lang-btn" data-lang="fr" style="background: #0A0A0A; border: 1px solid var(--lp-border-accent); color: var(--lp-text-dim); padding: 0.75rem; border-radius: 2px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">🇫🇷</span>
                                <span style="font-size: 0.7rem; font-weight: bold; letter-spacing: 0.1em;">FRANÇAIS</span>
                            </button>
                            <button class="chat-lang-btn" data-lang="de" style="background: #0A0A0A; border: 1px solid var(--lp-border-accent); color: var(--lp-text-dim); padding: 0.75rem; border-radius: 2px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">🇩🇪</span>
                                <span style="font-size: 0.7rem; font-weight: bold; letter-spacing: 0.1em;">DEUTSCH</span>
                            </button>
                        </div>
                    </div>
                    <div id="actual-chat" style="display: none; width: 100%;"></div>
                </div>

                <!-- Input Area -->
                <div id="chat-input-area" class="p-4 bg-bg border-t border-accent-subtle" style="display: none; padding: 1rem; background: #0A0A0A; border-top: 1px solid var(--lp-border-accent);">
                    <div class="flex gap-2" style="display: flex; gap: 0.5rem;">
                        <input id="chat-input" type="text" placeholder="Type your message..." style="flex: 1; background: #141414; border: 1px solid var(--lp-border-accent); padding: 0.5rem 1rem; color: white; outline: none; border-radius: 2px;">
                        <button id="send-chat" class="bg-accent text-bg p-2 rounded-sm" style="background: var(--lp-accent); border: none; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Toggle Button -->
            <button id="chat-toggle" class="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300" style="width: 56px; height: 56px; border-radius: 50%; border: none; background: var(--lp-red-accent); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(204,0,0,0.5);">
                <svg id="chat-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                <svg id="chat-close-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHtml);

    const toggleBtn = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('close-chat');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('chat-close-icon');
    const langBtns = document.querySelectorAll('.chat-lang-btn');
    const langSelection = document.getElementById('lang-selection');
    const actualChat = document.getElementById('actual-chat');
    const inputArea = document.getElementById('chat-input-area');
    const sendBtn = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('actual-chat');

    let currentLang = 'en';

    toggleBtn.addEventListener('click', () => {
        const isOpen = chatWindow.style.display === 'flex';
        chatWindow.style.display = isOpen ? 'none' : 'flex';
        chatIcon.style.display = isOpen ? 'block' : 'none';
        closeIcon.style.display = isOpen ? 'none' : 'block';
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
        chatIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    });

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            langSelection.style.display = 'none';
            actualChat.style.display = 'block';
            inputArea.style.display = 'block';
            appendMessage(' Greta', welcomeMessages[currentLang], 'model');
        });
    });

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage(' You', text, 'user');
        chatInput.value = '';

        // Thinking simulation
        const loadingId = 'loading-' + Date.now();
        const loadingHtml = `<div id="${loadingId}" style="display: flex; justify-content: flex-start; margin-bottom: 1rem;"><div style="background: #141414; border: 1px solid var(--lp-border-accent); padding: 0.5rem 1rem; border-radius: 2px; color: var(--lp-accent);">Greta is typing...</div></div>`;
        actualChat.insertAdjacentHTML('beforeend', loadingHtml);
        
        setTimeout(() => {
            document.getElementById(loadingId)?.remove();
            const answer = findBestMatch(text, currentLang);
            appendMessage(' Greta', answer, 'model');
        }, 1000);
    }

    function appendMessage(sender, text, role) {
        const msgHtml = `
            <div style="display: flex; justify-content: ${role === 'user' ? 'flex-end' : 'flex-start'}; margin-bottom: 1rem; animation: fadeIn 0.3s ease;">
                <div style="max-width: 85%; padding: 0.75rem; border-radius: 2px; font-size: 0.85rem; line-height: 1.5; ${role === 'user' ? 'background: rgba(197, 160, 89, 0.1); border: 1px solid rgba(197, 160, 89, 0.2); color: white;' : 'background: #141414; border: 1px solid var(--lp-border-accent); color: var(--lp-text-main);'}">
                    ${text}
                </div>
            </div>
        `;
        actualChat.insertAdjacentHTML('beforeend', msgHtml);
        const container = document.getElementById('chat-messages');
        container.scrollTop = container.scrollHeight;
    }

    const welcomeMessages = {
        en: "Hello! 😊 I'm Greta, GSL's virtual assistant. I'm here to help you with our courses in German, French, and English, as well as enrollment, placement tests, and more. What would you like to know?",
        ar: "مرحباً! 😊 أنا غريتا، المساعدة الافتراضية لمدرسة GSL. أنا هنا لمساعدتك في كل ما يخص دوراتنا في اللغات الألمانية، الفرنسية، والإنجليزية، بالإضافة إلى التسجيل، اختبارات التحديد، وأكثر. بماذا يمكنني مساعدتك؟",
        fr: "Bonjour ! 😊 Je suis Greta, l'assistante virtuelle de GSL. Je suis là pour vous aider avec nos cours d'allemand, de français et d'anglais, ainsi que pour l'inscription, les tests de niveau, et plus encore. Comment puis-je vous aider ?",
        de: "Hallo! 😊 Ich bin Greta, die virtuelle Assistentin von GSL. Ich helfe Ihnen gerne bei Fragen zu unseren Deutsch-, Französisch- und Englischkursen sowie zur Anmeldung, den Einstufungstests und mehr. Wie kann ich Ihnen helfen?"
    };

    const qaData = {
        en: [
            { keywords: ['course', 'level', 'classes', 'offer', 'learn'], answer: "GSL offers high-quality courses in German (A1-C2), French, and English. We specialize in General Language, Business Language, and Exam Preparation." },
            { keywords: ['price', 'cost', 'fee', 'how much'], answer: "Fees vary depending on the course. Please contact us at 0673 93 76 33 for the current price list." },
            { keywords: ['location', 'address', 'batna', 'where'], answer: "We are located at: Hai Kammouni, Batna, Algeria (Opposite foreigners residence)." },
            { keywords: ['enroll', 'register', 'sign up'], answer: "To enroll, first take our free online placement test. Then visit us in Batna to confirm your spot!" }
        ],
        ar: [
            { keywords: ['دورة', 'دروس', 'تعلم', 'مستوى'], answer: "تقدم مدرسة GSL دورات عالية الجودة في اللغات الألمانية (A1-C2)، الفرنسية، والإنجليزية." },
            { keywords: ['سعر', 'تكلفة', 'كم'], answer: "تختلف الرسوم حسب اللغة وكثافة الدورة. يرجى الاتصال بنا على 0673 93 76 33." },
            { keywords: ['مكان', 'عنوان', 'باتنة'], answer: "حي كموني، مقابل إقامة الأجانب، باتنة، الجزائر." }
        ],
        fr: [
            { keywords: ['cours', 'apprendre', 'niveau'], answer: "GSL propose des cours d'Allemand (A1-C2), Français et Anglais." },
            { keywords: ['prix', 'combien', 'tarif'], answer: "Les tarifs varient. Contactez-nous au 0673 93 76 33 pour plus de détails." }
        ],
        de: [
            { keywords: ['kurs', 'lernen', 'niveau'], answer: "GSL bietet hochwertige Kurse in Deutsch (A1-C2), Französisch und Englisch an." }
        ]
    };

    function findBestMatch(input, lang) {
        input = input.toLowerCase();
        const data = qaData[lang] || qaData.en;
        for (const item of data) {
            for (const kw of item.keywords) {
                if (input.includes(kw)) return item.answer;
            }
        }
        return lang === 'ar' ? "لست متأكداً من ذلك. يرجى الاتصال بنا على 0673 93 76 33!" : "I'm not sure about that. Please contact us at 0673 93 76 33 for more details!";
    }
}
