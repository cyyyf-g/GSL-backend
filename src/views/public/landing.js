import { supabase } from '../../supabase.js'
import { translations } from './translations.js'
import { placementQuestions } from '../../data/placement_questions.js'
import { initChatbot } from './chatbot.js'

export async function renderLanding(container) {
    let currentLang = localStorage.getItem('gsl_lang') || 'en';
    let isScrolled = false;
    let isPlacementTestOpen = false;

    // Fetch dynamic content
    const { data: configData } = await supabase.from('site_config').select('*');
    const config = {};
    configData?.forEach(item => config[item.key] = item.value);

    const render = () => {
        if (isPlacementTestOpen) {
            renderPlacementTest(container, currentLang, () => {
                isPlacementTestOpen = false;
                render();
            });
            return;
        }

        const t = translations[currentLang];
        const isRtl = currentLang === 'ar';

        // Override dynamic note if available
        const dynamicNote = config['hero_note'] ? config['hero_note'][currentLang] : t.hero.note;

        container.innerHTML = `
            <div class="lp-body lp-custom-scroll" dir="${isRtl ? 'rtl' : 'ltr'}" style="min-height: 100vh; background: var(--lp-bg); color: var(--lp-text-main); font-family: 'DM Sans', sans-serif;">
                <!-- Navbar -->
                <nav id="lp-nav" class="lp-nav fixed top-0 left-0 w-full z-[100] py-8 transition-all duration-300">
                    <div style="max-width: 1400px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center;">
                        <!-- Logo -->
                        <div class="flex items-center cursor-pointer" onclick="window.scrollTo(0,0)" style="display: flex; align-items: center; gap: 1rem;">
                            <div style="border-left: 4px solid var(--lp-accent); padding-left: 1rem; ${isRtl ? 'border-left: none; border-right: 4px solid var(--lp-accent); padding-right: 1rem;' : ''}">
                                <h1 class="font-serif tracking-wider text-accent uppercase" style="font-size: 2rem; color: var(--lp-accent); margin: 0; line-height: 1;">GSL</h1>
                                <p class="text-[10px] text-text-dim uppercase tracking-widest" style="font-size: 0.6rem; color: var(--lp-text-dim); margin: 0; margin-top: 0.2rem;">Language School</p>
                            </div>
                        </div>

                        <!-- Desktop Nav -->
                        <div class="hidden lg:flex" style="display: flex; align-items: center; gap: 2rem;">
                            <a href="#about" class="text-text-main hover:text-accent transition-colors uppercase font-bold tracking-widest text-[0.7rem]" style="text-decoration: none; color: white;">${t.nav.about}</a>
                            <a href="#courses" class="text-text-main hover:text-accent transition-colors uppercase font-bold tracking-widest text-[0.7rem]" style="text-decoration: none; color: white;">${t.nav.courses}</a>
                            <a href="#contact" class="text-text-main hover:text-accent transition-colors uppercase font-bold tracking-widest text-[0.7rem]" style="text-decoration: none; color: white;">${t.nav.contact}</a>
                            <button id="nav-pt-btn" class="text-accent hover:text-white transition-colors uppercase font-bold tracking-widest text-[0.7rem]" style="background: none; border: none; color: var(--lp-accent); cursor: pointer;">${t.nav.placement_test}</button>
                            
                            <div style="width: 1px; height: 20px; background: var(--lp-border-accent); margin: 0 1rem;"></div>
                            
                            <div style="display: flex; gap: 0.5rem;">
                                ${['en', 'ar', 'fr', 'de'].map(l => `
                                    <button class="lang-btn ${l === currentLang ? 'bg-accent text-bg' : 'text-text-dim'}" data-lang="${l}" style="border: none; background: ${l === currentLang ? 'var(--lp-accent)' : 'transparent'}; color: ${l === currentLang ? '#0A0A0A' : 'var(--lp-text-dim)'}; padding: 0.2rem 0.5rem; border-radius: 2px; font-weight: bold; cursor: pointer; font-size: 0.7rem;">${l.toUpperCase()}</button>
                                `).join('')}
                            </div>
                            
                            <a href="/login" class="lp-btn lp-btn-outline-accent" style="padding: 0.5rem 1.5rem; font-size: 0.7rem; border: 1px solid var(--lp-accent); color: var(--lp-accent); text-decoration: none; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; transition: all 0.3s ease;">${t.nav.login}</a>
                        </div>

                        <!-- Mobile Hamburger -->
                        <button id="lp-hamburger" class="lg:hidden lp-hamburger" style="display: none; background: none; border: none; color: var(--lp-accent); cursor: pointer;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                    </div>
                </nav>

                <!-- Mobile Menu -->
                <div id="lp-mobile-menu" class="lp-mobile-menu">
                    <button id="lp-close-menu" style="position: absolute; top: 2rem; right: 2rem; background: none; border: none; color: var(--lp-accent); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div style="display: flex; flex-direction: column; gap: 2rem; text-align: center;">
                        <a href="#about" class="text-text-main hover:text-accent transition-colors uppercase font-bold tracking-widest text-lg" style="text-decoration: none; color: white;">${t.nav.about}</a>
                        <a href="#courses" class="text-text-main hover:text-accent transition-colors uppercase font-bold tracking-widest text-lg" style="text-decoration: none; color: white;">${t.nav.courses}</a>
                        <a href="#contact" class="text-text-main hover:text-accent transition-colors uppercase font-bold tracking-widest text-lg" style="text-decoration: none; color: white;">${t.nav.contact}</a>
                        <button id="mobile-pt-btn" class="text-accent hover:text-white transition-colors uppercase font-bold tracking-widest text-lg" style="background: none; border: none; color: var(--lp-accent); cursor: pointer;">${t.nav.placement_test}</button>
                        
                        <div style="height: 1px; background: var(--lp-border-accent); margin: 1rem 0;"></div>
                        
                        <div style="display: flex; justify-content: center; gap: 1rem;">
                            ${['en', 'ar', 'fr', 'de'].map(l => `
                                <button class="lang-btn ${l === currentLang ? 'bg-accent text-bg' : 'text-text-dim'}" data-lang="${l}" style="border: none; background: ${l === currentLang ? 'var(--lp-accent)' : 'transparent'}; color: ${l === currentLang ? '#0A0A0A' : 'var(--lp-text-dim)'}; padding: 0.5rem 1rem; border-radius: 2px; font-weight: bold; cursor: pointer;">${l.toUpperCase()}</button>
                            `).join('')}
                        </div>
                        
                        <a href="/login" class="lp-btn lp-btn-accent" style="margin-top: 2rem;">${t.nav.login}</a>
                    </div>
                </div>

                <!-- Hero Section -->
                <section id="home" class="relative h-screen flex items-center justify-center overflow-hidden" style="display: flex; align-items: center; justify-content: center; height: 100vh; position: relative;">
                    <canvas id="particle-canvas" class="absolute inset-0 pointer-events-none z-0"></canvas>
                    
                    <!-- Decor -->
                    <div style="position: absolute; left: 0; top: 0; width: 4px; height: 100%; display: flex; flex-direction: column;">
                        <div style="flex: 1; background: #000;"></div>
                        <div style="flex: 1; background: #E30010;"></div>
                        <div style="flex: 1; background: #FFCE00;"></div>
                    </div>

                    <div style="position: relative; z-10; text-align: center; max-width: 900px; padding: 0 2rem;">
                        <div class="inline-block mb-8 py-2 px-6 border border-accent-subtle rounded-full bg-accent/5 animate-pulse-lp" style="display: inline-block; padding: 0.5rem 1.5rem; border: 1px solid var(--lp-border-accent); border-radius: 999px; background: rgba(197, 160, 89, 0.05); margin-bottom: 2rem;">
                            <span class="text-accent text-[0.7rem] font-bold tracking-[0.4em] uppercase" style="color: var(--lp-accent);">${t.hero.location}</span>
                        </div>

                        <div style="min-height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem;">
                            <h1 id="typewriter" class="font-display" style="font-size: 5rem; line-height: 1; letter-spacing: 0.05em; color: white;"></h1>
                            <span style="width: 4px; height: 4rem; background: var(--lp-accent); margin-left: 0.5rem; animation: lp-pulse 1s infinite;"></span>
                        </div>

                        <p class="text-lg md:text-xl text-text-dim mb-12" style="color: var(--lp-text-dim); font-size: 1.25rem; margin-bottom: 3rem; line-height: 1.6;">${t.hero.subtext}</p>

                        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center;">
                            <button id="hero-signup-btn" class="lp-btn lp-btn-accent" style="background: var(--lp-accent); color: #0A0A0A; border: none; padding: 1rem 2.5rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.8rem; cursor: pointer;">${t.hero.cta_primary}</button>
                            <button id="hero-pt-btn" class="lp-btn lp-btn-outline-dim" style="background: transparent; color: var(--lp-text-dim); border: 1px solid var(--lp-text-dim); padding: 1rem 2.5rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.8rem; cursor: pointer;">${t.hero.cta_secondary}</button>
                        </div>

                        <div style="margin-top: 4rem; display: flex; justify-content: center;">
                             <div style="background: var(--lp-red-accent); color: white; padding: 0.5rem 1rem; border-radius: 2px; font-size: 0.6rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.21em; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 0 15px rgba(204,0,0,0.3);">
                                <span style="width: 6px; height: 6px; background: white; border-radius: 50%; display: inline-block;"></span>
                                ${dynamicNote}
                             </div>
                        </div>
                    </div>
                </section>

                <!-- Stats -->
                <section style="background: #0A0A0A; border-top: 1px solid var(--lp-border-accent); border-bottom: 1px solid var(--lp-border-accent); padding: 4rem 0;">
                    <div class="res-gap-4" style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center;">
                        <div style="text-align: center;">
                            <div id="counter-students" class="font-display text-accent" style="font-size: 4rem; color: var(--lp-accent); line-height: 1;">0</div>
                            <div class="text-[0.8rem] text-text-main uppercase tracking-widest mt-2" style="color: white; font-size: 0.7rem; letter-spacing: 0.2em;">${t.stats.students_label}</div>
                        </div>
                        <div style="text-align: center;">
                            <div id="counter-levels" class="font-display text-accent" style="font-size: 4rem; color: var(--lp-accent); line-height: 1;">0</div>
                            <div class="text-[0.8rem] text-text-main uppercase tracking-widest mt-2" style="color: white; font-size: 0.7rem; letter-spacing: 0.2em;">${t.stats.levels_label}</div>
                        </div>
                        <div style="text-align: center;">
                            <div id="counter-years" class="font-display text-accent" style="font-size: 4rem; color: var(--lp-accent); line-height: 1;">0</div>
                            <div class="text-[0.8rem] text-text-main uppercase tracking-widest mt-2" style="color: white; font-size: 0.7rem; letter-spacing: 0.2em;">${t.stats.years_label}</div>
                        </div>
                    </div>
                </section>

                <!-- About Section -->
                <section id="about" class="res-p-8">
                    <div class="res-grid-cols" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; align-items: center;">
                        <div>
                            <div class="text-accent font-bold" style="color: var(--lp-accent); font-size: 0.9rem; letter-spacing: 0.21em; margin-bottom: 1rem; text-transform: uppercase;">[ ${t.about.label} ]</div>
                            <h2 class="font-serif mb-8" style="font-size: 4rem; color: white; line-height: 1; margin-bottom: 2rem;">${t.about.headline}</h2>
                            <div class="text-text-dim space-y-6" style="color: var(--lp-text-dim); line-height: 1.8; font-size: 1.1rem; display: flex; flex-direction: column; gap: 1.5rem;">
                                <p>${t.about.p1}</p>
                                <p>${t.about.p2}</p>
                                <p>${t.about.p3}</p>
                            </div>
                        </div>
                        <div class="relative" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 1px; border-radius: 2px;">
                            <div class="accent-gradient" style="height: 150px; display: flex; align-items: center; justify-content: center; flex-direction: column; background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);">
                                <div style="width: 50px; height: 1px; background: var(--lp-accent); margin-bottom: 1rem;"></div>
                                <div class="font-serif italic text-accent" style="color: var(--lp-accent); font-size: 1.5rem;">Since 2018</div>
                            </div>
                            <div style="background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(10px); margin: -3rem 1.5rem 1.5rem; padding: 2rem; border: 1px solid var(--lp-border-accent);">
                                <div style="background: var(--lp-red-accent); color: white; display: inline-block; padding: 0.2rem 0.5rem; font-size: 0.5rem; font-weight: bold; letter-spacing: 0.2em; margin-bottom: 1rem;">OFFICIAL NOTICE</div>
                                <h3 class="font-serif italic text-accent" style="font-size: 2rem; color: var(--lp-accent); margin-bottom: 0.5rem;">"${t.about.tagline}"</h3>
                                <p class="text-text-dim uppercase tracking-widest" style="font-size: 0.6rem; color: var(--lp-text-dim); letter-spacing: 0.2em; margin-bottom: 2rem;">${t.about.tagline_sub}</p>
                                
                                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--lp-border-accent); display: flex; align-items: center; justify-content: center; color: var(--lp-accent);">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.33 3 6.67 3 10 0v-5"/></svg>
                                        </div>
                                        <span style="font-weight: 500; font-size: 1.1rem;">${t.about.feature1}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--lp-border-accent); display: flex; align-items: center; justify-content: center; color: var(--lp-accent);">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                                        </div>
                                        <span style="font-weight: 500; font-size: 1.1rem;">${t.about.feature2}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Courses Section -->
                <section id="courses" class="res-p-8" style="background: #0A0A0A; border-top: 1px solid var(--lp-border-accent);">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; text-align: center;">
                        <div class="text-accent font-bold" style="color: var(--lp-accent); font-size: 0.9rem; letter-spacing: 0.21em; margin-bottom: 1rem; text-transform: uppercase;">[ ${t.courses.label} ]</div>
                        <h2 class="font-serif mb-4" style="font-size: 4rem; color: white;">${t.courses.headline}</h2>
                        <p class="text-text-dim max-w-2xl mx-auto mb-16" style="color: var(--lp-text-dim); margin-bottom: 4rem;">${t.courses.subtext}</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                            ${t.courses.list.map((c, i) => `
                                <div class="bg-card-bg res-p-4 border border-accent-subtle hover:border-accent transition-all duration-500 group" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); text-align: left; border-left: 3px solid var(--lp-accent); cursor: pointer;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                                        <span style="font-size: 3rem; opacity: 0.6;">${c.icon}</span>
                                        <span style="background: rgba(197, 160, 89, 0.05); color: var(--lp-accent); border: 1px solid var(--lp-border-accent); padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.6rem; font-weight: bold; letter-spacing: 0.1em;">${c.level}</span>
                                    </div>
                                    <h3 class="font-serif text-2xl mb-4 group-hover:text-accent transition-colors" style="font-size: 1.75rem; color: white; margin-bottom: 1rem;">${c.title}</h3>
                                    <p class="text-text-dim text-sm" style="color: var(--lp-text-dim); font-size: 0.9rem; line-height: 1.6;">${c.desc}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>

                <!-- Contact Section -->
                <section id="contact" class="res-p-8" style="background: #0A0A0A; border-top: 1px solid var(--lp-border-accent);">
                    <div class="res-gap-4" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));">
                        <div>
                             <h2 class="font-serif uppercase tracking-widest text-text-main" style="font-size: 4rem; color: white; margin-bottom: 3rem; letter-spacing: 0.1em;">${t.contact.headline}</h2>
                             
                             <div style="display: flex; flex-direction: column; gap: 2.5rem;">
                                <div style="display: flex; gap: 1.5rem;">
                                     <div style="width: 60px; height: 60px; background: rgba(197, 160, 89, 0.05); border: 1px solid var(--lp-border-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--lp-accent); flex-shrink: 0;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                     </div>
                                     <div>
                                        <p class="text-accent font-bold uppercase tracking-widest" style="font-size: 0.7rem; color: var(--lp-accent); margin-bottom: 0.5rem; letter-spacing: 0.1em;">Address</p>
                                        <p class="text-text-dim text-lg" style="color: var(--lp-text-dim); font-size: 1.1rem;">${t.contact.address}</p>
                                     </div>
                                </div>
                                <div style="display: flex; gap: 1.5rem;">
                                     <div style="width: 60px; height: 60px; background: rgba(197, 160, 89, 0.05); border: 1px solid var(--lp-border-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--lp-accent); flex-shrink: 0;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                     </div>
                                     <div>
                                        <p class="text-accent font-bold uppercase tracking-widest" style="font-size: 0.7rem; color: var(--lp-accent); margin-bottom: 0.5rem; letter-spacing: 0.1em;">Phones</p>
                                        <p class="text-text-dim text-lg" style="color: var(--lp-text-dim); font-size: 1.1rem;">0673 93 76 33</p>
                                        <p class="text-text-dim text-lg" style="color: var(--lp-text-dim); font-size: 1.1rem;">0671 13 21 53</p>
                                     </div>
                                </div>
                             </div>
                        </div>
                        <div class="res-p-4" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); border-radius: 2px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                            <form id="contact-form" class="space-y-6" style="display: flex; flex-direction: column; gap: 1.5rem;">
                                <div>
                                    <label style="display: block; font-size: 0.6rem; font-weight: bold; color: var(--lp-text-dim); text-transform: uppercase; letter-spacing: 0.21em; margin-bottom: 0.75rem;">${t.contact.form.name}</label>
                                    <input type="text" name="name" required style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; border-radius: 2px; outline: none;">
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                    <div>
                                        <label style="display: block; font-size: 0.6rem; font-weight: bold; color: var(--lp-text-dim); text-transform: uppercase; letter-spacing: 0.21em; margin-bottom: 0.75rem;">${t.contact.form.phone}</label>
                                        <input type="tel" name="phone" required style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; border-radius: 2px; outline: none;">
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 0.6rem; font-weight: bold; color: var(--lp-text-dim); text-transform: uppercase; letter-spacing: 0.21em; margin-bottom: 0.75rem;">${t.contact.form.email}</label>
                                        <input type="email" name="email" style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; border-radius: 2px; outline: none;">
                                    </div>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.6rem; font-weight: bold; color: var(--lp-text-dim); text-transform: uppercase; letter-spacing: 0.21em; margin-bottom: 0.75rem;">${t.contact.form.interest}</label>
                                    <select name="interest" style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; border-radius: 2px; outline: none;">
                                        <option value="">Select a course...</option>
                                        <option value="German">German</option>
                                        <option value="French">French</option>
                                        <option value="English">English</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.6rem; font-weight: bold; color: var(--lp-text-dim); text-transform: uppercase; letter-spacing: 0.21em; margin-bottom: 0.75rem;">${t.contact.form.message}</label>
                                    <textarea name="message" rows="4" style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; border-radius: 2px; outline: none; resize: none;"></textarea>
                                </div>
                                <button type="submit" class="lp-btn lp-btn-accent" style="width: 100%;">${t.contact.form.submit}</button>
                            </form>
                            <p id="form-msg" style="margin-top: 1rem; font-size: 0.8rem; text-align: center; display: none;"></p>
                        </div>
                    </div>
                </section>

                <!-- Footer -->
                <footer style="padding: 4rem 2rem; background: #0A0A0A; border-top: 1px solid var(--lp-border-accent); text-align: center;">
                    <div style="border-left: 2px solid var(--lp-accent); display: inline-block; padding-left: 1rem; margin-bottom: 2rem;">
                         <h1 class="font-serif tracking-wider text-accent uppercase" style="font-size: 2.5rem; color: var(--lp-accent);">GSL</h1>
                    </div>
                    <p style="color: var(--lp-text-dim); font-size: 0.8rem; letter-spacing: 0.1em; margin-bottom: 1rem;">${t.footer.tagline}</p>
                    <div style="display: flex; justify-content: center; gap: 1.5rem; margin: 2rem 0;">
                        <a href="https://instagram.com/gsl.off" target="_blank" style="color: var(--lp-text-dim);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
                        <a href="https://facebook.com/share/1RHJpRbSKc/" target="_blank" style="color: var(--lp-text-dim);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                    </div>
                    <p style="color: var(--lp-text-dim); font-size: 0.6rem; opacity: 0.5;">${t.footer.copyright}</p>
                </footer>
            </div>
        `;

        // --- Logic ---
        const nav = document.getElementById('lp-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                nav.classList.add('lp-nav-scrolled');
            } else {
                nav.classList.remove('lp-nav-scrolled');
            }
        });

        // Mobile Menu Logic
        const mobileMenu = document.getElementById('lp-mobile-menu');
        const lp_hamburger = document.getElementById('lp-hamburger');
        const closeMenu = document.getElementById('lp-close-menu');

        const toggleMenu = () => {
            mobileMenu.classList.toggle('active');
        };

        lp_hamburger?.addEventListener('click', toggleMenu);
        closeMenu?.addEventListener('click', toggleMenu);

        mobileMenu.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });

        // Typewriter
        initTypewriter(t.hero.headline, isRtl);

        // Lang buttons
        container.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentLang = btn.dataset.lang;
                localStorage.setItem('gsl_lang', currentLang);
                render();
            });
        });

        // Placement Test buttons
        document.getElementById('nav-pt-btn')?.addEventListener('click', () => {
            isPlacementTestOpen = true;
            render();
        });
        document.getElementById('hero-pt-btn')?.addEventListener('click', () => {
            isPlacementTestOpen = true;
            render();
        });

        document.getElementById('hero-signup-btn')?.addEventListener('click', () => {
            window.history.pushState({}, '', '/signup');
            window.dispatchEvent(new Event('popstate'));
        });

        // SPA Navigation for internal links
        document.querySelectorAll('a[href^="/"]:not(#hero-signup-btn)').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('/') && !href.startsWith('/#')) {
                    e.preventDefault();
                    window.history.pushState({}, '', href);
                    window.dispatchEvent(new Event('popstate'));
                }
            });
        });

        // Contact Form
        document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const msg = document.getElementById('form-msg');
            btn.disabled = true;
            btn.innerText = 'Sending...';

            const formData = new FormData(e.target);
            const { error } = await supabase.from('contact_submissions').insert({
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email') || null,
                interest: formData.get('interest') || null,
                message: formData.get('message') || null
            });

            if (error) {
                msg.innerText = 'Error: ' + error.message;
                msg.style.color = 'var(--lp-red-accent)';
                msg.style.display = 'block';
                btn.disabled = false;
                btn.innerText = t.contact.form.submit;
            } else {
                msg.innerText = t.contact.form.success;
                msg.style.color = 'var(--lp-accent)';
                msg.style.display = 'block';
                e.target.reset();
                setTimeout(() => {
                    msg.style.display = 'none';
                    btn.disabled = false;
                    btn.innerText = t.contact.form.submit;
                }, 5000);
            }
        });

        initParticles();
        initStatsCounters();
        await initChatbot();

        // Handle internal links for GSL main app (popstate triggers router)
        container.querySelectorAll('a[href^="/"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = new URL(link.href).pathname;
                window.history.pushState({}, '', path);
                window.dispatchEvent(new Event('popstate'));
            });
        });
    };

    render();
}

function initTypewriter(text, isRtl) {
    const el = document.getElementById('typewriter');
    if (!el) return;
    let i = 0;
    el.innerText = '';
    const type = () => {
        if (i < text.length) {
            el.innerText = text.substring(0, i + 1);
            i++;
            setTimeout(type, 80);
        }
    };
    type();
}

function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * -1 - 0.5,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.2 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#C5A059';
            ctx.globalAlpha = p.opacity;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function initStatsCounters() {
    const counters = [
        { id: 'counter-students', target: 500, suffix: '+' },
        { id: 'counter-levels', target: 6, suffix: '' },
        { id: 'counter-years', target: 5, suffix: '+' }
    ];

    counters.forEach(c => {
        const el = document.getElementById(c.id);
        if (!el) return;
        let count = 0;
        const duration = 2000;
        const step = Math.ceil(c.target / (duration / 16));
        const timer = setInterval(() => {
            count += step;
            if (count >= c.target) {
                count = c.target;
                clearInterval(timer);
            }
            el.innerText = count + c.suffix;
        }, 16);
    });
}

async function renderPlacementTest(container, lang, onBack) {
    let state = 'SELECT'; // SELECT, TEST, INFO, RESULTS
    let selectedLang = null;
    let currentIdx = 0;
    let score = 0;
    let feedback = null;
    let userInfo = { name: '', phone: '' };

    const t = translations[lang];

    const render = () => {
        container.innerHTML = `
            <div class="lp-body" style="min-height: 100vh; background: var(--lp-bg); color: var(--lp-text-main); font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div style="max-width: 800px; width: 100%; position: relative; z-10;">
                    ${state === 'SELECT' ? `
                        <div style="text-align: center; animation: slideUp 0.5s ease;">
                            <button id="pt-back" style="background: none; border: none; color: var(--lp-text-dim); font-weight: bold; font-size: 0.7rem; letter-spacing: 0.2em; cursor: pointer; margin-bottom: 3rem; display: flex; align-items: center; gap: 0.5rem; justify-content: center; width: 100%;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                BACK TO WEBSITE
                            </button>
                            <h1 class="font-serif" style="font-size: 4rem; margin-bottom: 3rem;">Placement Test</h1>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                                <button class="pt-start-btn" data-lang="English" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 3rem; border-radius: 2px; cursor: pointer; transition: all 0.3s ease;">
                                    <span style="font-size: 4rem; display: block; margin-bottom: 1rem;">🇬🇧</span>
                                    <span class="font-serif" style="font-size: 1.5rem; color: white;">English</span>
                                </button>
                                <button class="pt-start-btn" data-lang="French" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 3rem; border-radius: 2px; cursor: pointer; transition: all 0.3s ease;">
                                    <span style="font-size: 4rem; display: block; margin-bottom: 1rem;">🇫🇷</span>
                                    <span class="font-serif" style="font-size: 1.5rem; color: white;">French</span>
                                </button>
                                <button class="pt-start-btn" data-lang="German" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 3rem; border-radius: 2px; cursor: pointer; transition: all 0.3s ease;">
                                    <span style="font-size: 4rem; display: block; margin-bottom: 1rem;">🇩🇪</span>
                                    <span class="font-serif" style="font-size: 1.5rem; color: white;">German</span>
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    ${state === 'TEST' ? `
                        <div class="res-p-4" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 4rem; border-radius: 2px; animation: fadeIn 0.5s ease;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; gap: 1rem;">
                                <div>
                                    <p style="font-size: 0.6rem; color: var(--lp-text-dim); font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase;">Question ${currentIdx + 1} of 12</p>
                                    <h3 class="font-serif italic text-accent" style="color: var(--lp-accent);">${selectedLang} Assessment</h3>
                                </div>
                                <div style="width: 150px; height: 4px; background: #0A0A0A; border-radius: 2px; position: relative;">
                                    <div style="position: absolute; left: 0; top: 0; height: 100%; background: var(--lp-accent); width: ${((currentIdx + 1) / 12) * 100}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>

                            <h2 style="font-size: 2rem; color: white; text-align: center; margin-bottom: 3rem;">${placementQuestions[selectedLang][currentIdx].text}</h2>

                            <div style="display: grid; gap: 1rem;">
                                ${placementQuestions[selectedLang][currentIdx].type === 'mc' ? 
                                    placementQuestions[selectedLang][currentIdx].options.map(opt => `
                                        <button class="pt-ans-btn" data-ans="${opt}" style="background: transparent; border: 1px solid var(--lp-border-accent); padding: 1.25rem; text-align: left; color: white; cursor: pointer; transition: all 0.2s ease;">${opt}</button>
                                    `).join('') :
                                    `<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                        <input id="pt-fill-ans" type="text" placeholder="Your answer..." style="flex: 1; min-width: 200px; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; outline: none;">
                                        <button id="pt-fill-btn" class="lp-btn lp-btn-accent" style="width: auto;">Submit</button>
                                    </div>`
                                }
                            </div>

                            ${feedback ? `
                                <div style="margin-top: 2rem; text-align: center; animation: slideUp 0.3s ease;">
                                    <p style="color: ${feedback.correct ? 'var(--lp-accent)' : '#ff4444'}; font-weight: bold; font-size: 1.25rem; margin-bottom: 1.5rem;">
                                        ${feedback.correct ? '✨ Correct!' : `❌ Incorrect. The answer is: ${feedback.answer}`}
                                    </p>
                                    <button id="pt-next" class="lp-btn lp-btn-accent" style="width: auto;">${currentIdx < 11 ? 'Next Question' : 'View Results'}</button>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${state === 'INFO' ? `
                         <div class="res-p-4" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 4rem; border-radius: 2px; text-align: center; animation: fadeIn 0.5s ease;">
                            <h2 class="font-serif" style="font-size: 2.5rem; color: white; margin-bottom: 1rem;">Assessment Complete</h2>
                            <p style="color: var(--lp-text-dim); margin-bottom: 3rem;">Enter your details to reveal your final level.</p>
                            
                            <form id="pt-info-form" style="max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; text-align: left;">
                                <div>
                                    <label style="font-size: 0.6rem; font-weight: bold; color: var(--lp-accent); text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-bottom: 0.5rem;">Full Name</label>
                                    <input type="text" name="name" required style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; outline: none;">
                                </div>
                                <div>
                                    <label style="font-size: 0.6rem; font-weight: bold; color: var(--lp-accent); text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-bottom: 0.5rem;">Phone Number</label>
                                    <input type="tel" name="phone" required style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; outline: none;">
                                </div>
                                <button type="submit" class="lp-btn lp-btn-accent">Reveal Result</button>
                            </form>
                         </div>
                    ` : ''}

                    ${state === 'RESULTS' ? `
                        <div class="res-p-4" style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 4rem; border-radius: 2px; text-align: center; animation: slideUp 0.5s ease;">
                            <div style="font-size: 5rem; margin-bottom: 2rem;">🏆</div>
                            <h2 class="font-serif" style="font-size: 3rem; color: white; line-height: 1;">Congratulations, ${userInfo.name}!</h2>
                            <p style="color: var(--lp-accent); font-size: 1.5rem; margin-top: 1rem; letter-spacing: 0.2em; font-weight: bold;">YOUR LEVEL IS ${getCEFRLevel(score)}</p>
                            
                            <div style="background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 2rem; margin: 3rem 0; border-radius: 2px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: bold; color: var(--lp-text-dim); margin-bottom: 1rem;">
                                    <span>SCORE: ${score} / 12</span>
                                    <span>ACCURACY: ${Math.round((score / 12) * 100)}%</span>
                                </div>
                                <div style="display: flex; height: 10px; background: #141414; gap: 2px;">
                                    ${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => `
                                        <div style="flex: 1; background: ${getCEFRLevel(score) === lvl ? 'var(--lp-accent)' : '#1a1a1a'}"></div>
                                    `).join('')}
                                </div>
                            </div>

                            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                                <button id="pt-restart" class="lp-btn lp-btn-outline-accent">Retake Test</button>
                                <button id="pt-website" class="lp-btn lp-btn-accent">Back to Website</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // --- PT Events ---
        document.getElementById('pt-back')?.addEventListener('click', onBack);
        document.getElementById('pt-website')?.addEventListener('click', onBack);

        container.querySelectorAll('.pt-start-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedLang = btn.dataset.lang;
                state = 'TEST';
                currentIdx = 0;
                score = 0;
                feedback = null;
                render();
            });
        });

        container.querySelectorAll('.pt-ans-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (feedback) return;
                const ans = btn.dataset.ans;
                const correct = ans === placementQuestions[selectedLang][currentIdx].answer;
                if (correct) score++;
                feedback = { correct, answer: placementQuestions[selectedLang][currentIdx].answer };
                render();
            });
        });

        document.getElementById('pt-fill-btn')?.addEventListener('click', () => {
             if (feedback) return;
             const input = document.getElementById('pt-fill-ans');
             const ans = input.value.trim().toLowerCase();
             const correctAns = placementQuestions[selectedLang][currentIdx].answer.toLowerCase();
             const correct = ans === correctAns;
             if (correct) score++;
             feedback = { correct, answer: placementQuestions[selectedLang][currentIdx].answer };
             render();
        });

        document.getElementById('pt-next')?.addEventListener('click', () => {
            if (currentIdx < 11) {
                currentIdx++;
                feedback = null;
                render();
            } else {
                state = 'INFO';
                render();
            }
        });

        document.getElementById('pt-info-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            userInfo = { name: formData.get('name'), phone: formData.get('phone') };
            
            await supabase.from('public_test_results').insert({
                name: userInfo.name,
                phone: userInfo.phone,
                language: selectedLang,
                score: score,
                total: 12,
                cefr_level: getCEFRLevel(score)
            });

            state = 'RESULTS';
            render();
        });

        document.getElementById('pt-restart')?.addEventListener('click', () => {
            state = 'SELECT';
            render();
        });
    };

    const getCEFRLevel = (s) => {
        if (s <= 2) return 'A1';
        if (s <= 4) return 'A2';
        if (s <= 6) return 'B1';
        if (s <= 8) return 'B2';
        if (s <= 10) return 'C1';
        return 'C2';
    };

    render();
}
