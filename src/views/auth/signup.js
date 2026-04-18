import { supabase } from '../../supabase.js'
import { router } from '../../router.js'

export function renderSignup() {
    const mainContent = document.getElementById('main-content')
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1 class="logo-text">G<span>SL</span></h1>
                    <p class="tagline">Start your German journey today</p>
                </div>
                <form id="signup-form">
                    <div class="form-group">
                        <label for="full_name">Full Name</label>
                        <input type="text" id="full_name" required placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" required placeholder="name@example.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required minlength="6" placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn btn-secondary">Create Student Account</button>
                </form>
                <div style="margin-top: 1.5rem; text-align: center; font-size: 0.9rem;">
                    Already have an account? <a href="#" id="to-login" style="color: var(--primary); font-weight: 600;">Back to Login</a>
                </div>
            </div>
        </div>
    `

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value
        const full_name = e.target.full_name.value
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name }
            }
        })
        if (error) alert(error.message)
        else {
            alert('Signup successful! Please check your email for confirmation (if enabled) or login.')
            window.history.pushState({}, '', '/login')
            router()
        }
    })

    document.getElementById('to-login').addEventListener('click', (e) => {
        e.preventDefault()
        window.history.pushState({}, '', '/login')
        router()
    })
}
