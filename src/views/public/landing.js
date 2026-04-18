export function renderLanding(container) {
    container.innerHTML = `
        <header style="background: var(--white); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow); position: sticky; top: 0; z-index: 100;">
            <div class="logo">
                <h1 class="logo-text" style="font-size: 1.8rem;">G<span>SL</span></h1>
                <p style="font-size: 0.7rem; color: var(--gray); margin-top: -5px;">German School for Language</p>
            </div>
            <nav style="display: flex; gap: 2rem; align-items: center;">
                <a href="/test-dates" class="nav-link-public" style="text-decoration: none; color: var(--dark); font-weight: 500;">Exam Dates</a>
                <a href="/login" class="btn btn-secondary" style="width: auto; padding: 0.5rem 1.5rem;">Student Login</a>
                <a href="/signup" class="btn btn-primary" style="width: auto; padding: 0.5rem 1.5rem;">Join GSL</a>
            </nav>
        </header>

        <section class="hero" style="background: linear-gradient(rgba(27, 58, 107, 0.9), rgba(27, 58, 107, 0.9)), url('https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&q=80&w=2070') center/cover; padding: 8rem 2rem; text-align: center; color: var(--white);">
            <h1 style="font-size: 4rem; font-weight: 800; margin-bottom: 1.5rem;">Learn German. <br><span style="color: var(--secondary);">Change your life.</span></h1>
            <p style="font-size: 1.2rem; max-width: 700px; margin: 0 auto 3rem; opacity: 0.9;">Master German from zero to professional readiness with Algeria's premier language school.</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <a href="/signup" class="btn btn-secondary" style="width: auto; padding: 1rem 2.5rem; font-size: 1.1rem;">Start for Free</a>
                <a href="#levels" class="btn" style="width: auto; background: rgba(255,255,255,0.1); color: white; border: 1px solid white; padding: 1rem 2.5rem; font-size: 1.1rem;">Our Levels</a>
            </div>
        </section>

        <section id="levels" style="padding: 6rem 2rem; background: var(--light);">
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 4rem;">Comprehensive German Tracks</h2>
                <div class="stats-grid">
                    <div class="stat-card" style="border-left: 4px solid var(--secondary);">
                        <div style="background: var(--secondary); width: 40px; height: 40px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 1rem;">A1</div>
                        <h3>Beginner</h3>
                        <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.5rem;">Start your journey with essential vocabulary and grammar.</p>
                    </div>
                    <div class="stat-card">
                        <div style="background: var(--primary); color: white; width: 40px; height: 40px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 1rem;">B1</div>
                        <h3>Professional</h3>
                        <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.5rem;">Prepare for the German workplace with fluent communication.</p>
                    </div>
                    <div class="stat-card" style="border-left-color: var(--dark);">
                        <div style="background: var(--dark); color: white; width: 40px; height: 40px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 1rem;">C1</div>
                        <h3>Expert</h3>
                        <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.5rem;">Academic level German for university and high-level research.</p>
                    </div>
                </div>
            </div>
        </section>

        <footer style="background: var(--dark); color: white; padding: 4rem 2rem; text-align: center;">
            <h2 class="logo-text">G<span>SL</span></h2>
            <p style="margin-top: 1rem; opacity: 0.6;">&copy; 2026 German School for Language. Algeria.</p>
        </footer>
    `;

    container.querySelectorAll('a').forEach(link => {
        if (link.href.startsWith(window.location.origin) && !link.hash) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = new URL(link.href).pathname;
                window.history.pushState({}, '', path);
                window.dispatchEvent(new Event('popstate'));
            });
        }
    });
}
