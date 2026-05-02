import { supabase } from '../../supabase.js'
import { router } from '../../router.js'

export function renderLogin() {
    const mainContent = document.getElementById('main-content')
    mainContent.innerHTML = `
        <div class="auth-container" style="background: var(--lp-bg); min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif;">
            <div class="auth-card" style="position: relative; background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 3rem; border-radius: 2px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); width: 100%; max-width: 400px; animation: slideUp 0.5s ease;">
                <a href="https://gsl-front-end.vercel.app" style="position: absolute; top: 1.5rem; left: 1.5rem; color: var(--lp-text-dim); text-decoration: none; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; gap: 0.5rem; transition: color 0.3s ease; z-index: 10;" onmouseover="this.style.color='var(--lp-accent)'" onmouseout="this.style.color='var(--lp-text-dim)'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Site
                </a>
                <div class="auth-header" style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 class="font-serif" style="font-size: 3rem; color: var(--lp-accent); margin-bottom: 0.5rem;">GSL</h1>
                    <p class="tagline" style="color: var(--lp-text-dim); text-transform: uppercase; font-size: 0.6rem; letter-spacing: 0.21em;">Berlin · Paris · London</p>
                </div>
                <form id="login-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="form-group">
                        <label for="email" style="font-size: 0.6rem; font-weight: bold; color: var(--lp-accent); text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-bottom: 0.5rem;">Email Address</label>
                        <input type="email" id="email" required placeholder="name@example.com" style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; border-radius: 2px; outline: none; transition: border-color 0.3s ease;">
                    </div>
                    <div class="form-group">
                        <label for="password" style="font-size: 0.6rem; font-weight: bold; color: var(--lp-accent); text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-bottom: 0.5rem;">Password</label>
                        <input type="password" id="password" required placeholder="••••••••" style="width: 100%; background: #0A0A0A; border: 1px solid var(--lp-border-accent); padding: 1rem; color: white; border-radius: 2px; outline: none; transition: border-color 0.3s ease;">
                    </div>
                    <button type="submit" class="lp-btn lp-btn-accent" style="width: 100%; padding: 1rem; margin-top: 1rem;">Login</button>
                </form>
                <div style="margin-top: 2rem; text-align: center; font-size: 0.8rem; color: var(--lp-text-dim);">
                    Don't have an account? <a href="#" id="to-signup" style="color: var(--lp-accent); font-weight: bold; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.3s ease;">Sign up as a Student</a>
                </div>
            </div>
        </div>
    `

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            alert(error.message)
        } else {
            if (authData.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single()
                
                if (profile) {
                    window.history.pushState({}, '', `/${profile.role}/overview`)
                } else {
                    window.history.pushState({}, '', `/`)
                }
            }
            router()
        }
    })

    document.getElementById('to-signup').addEventListener('click', (e) => {
        e.preventDefault()
        window.history.pushState({}, '', '/signup')
        router()
    })
}
