import { supabase } from '../../supabase.js'
import { router } from '../../router.js'

export function renderLogin() {
    const mainContent = document.getElementById('main-content')
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1 class="logo-text">G<span>SL</span></h1>
                    <p class="tagline">Learn German. Change your life.</p>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" required placeholder="name@example.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn btn-primary">Login</button>
                </form>
                <div style="margin-top: 1.5rem; text-align: center; font-size: 0.9rem;">
                    Don't have an account? <a href="#" id="to-signup" style="color: var(--primary); font-weight: 600;">Sign up as a Student</a>
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
