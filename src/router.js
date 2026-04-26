import { supabase } from './supabase.js'
import { renderLogin } from './views/auth/login.js'
import { renderSignup } from './views/auth/signup.js'
import { renderAdminDashboard } from './views/admin/dashboard.js'
import { renderTeacherDashboard } from './views/teacher/dashboard.js'
import { renderStudentDashboard } from './views/student/dashboard.js'

const mainContent = document.getElementById('main-content')

export async function router() {
    const path = window.location.pathname
    
    // Public routes (no auth needed)
    if (path === '/') {
        const { renderLanding } = await import('./views/public/landing.js')
        renderLanding(mainContent)
        return
    }
    if (path === '/signup') {
        renderSignup()
        return
    }
    if (path === '/login') {
        renderLogin()
        return
    }
    // Public test dates
    if (path === '/test-dates') {
        import('./views/public/test_dates.js').then(m => m.renderPublicTestDates(mainContent))
        return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        window.history.pushState({}, '', '/login')
        renderLogin()
        return
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        mainContent.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <h2>Setting up your profile...</h2>
                    <p>Please wait a moment while we finish setting up your account.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                    <button class="btn" style="margin-top:1rem" id="logout-setup">Logout</button>
                </div>
            </div>
        `
        document.getElementById('logout-setup')?.addEventListener('click', () => supabase.auth.signOut())
        return
    }

    // Check for approved/active status for non-admins
    if (profile.role !== 'admin' && profile.status !== 'active') {
        const statusMsg = profile.status === 'pending' 
            ? "Your account is currently pending administrative approval. Please check back later."
            : profile.status === 'suspended'
            ? "Your account has been suspended by an administrator. Please contact the school."
            : profile.status === 'finished'
            ? "Your course path has been marked as finished. Thank you for studying with us!"
            : "Your account is not currently active.";

        mainContent.innerHTML = `
            <div class="auth-container" style="background: var(--lp-bg); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
                <div class="auth-card" style="background: var(--lp-card-bg); padding: 3rem; border-radius: 4px; box-shadow: var(--shadow-lg); text-align: center; max-width: 500px; border: 1px solid var(--lp-border-accent);">
                    <h1 style="color: var(--lp-accent); margin-bottom: 1rem;">GSL</h1>
                    <h2 style="color: white; margin-bottom: 1.5rem;">Account Access Restricted</h2>
                    <p style="color: var(--lp-text-dim); margin-bottom: 2rem; line-height: 1.6;">${statusMsg}</p>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <button class="lp-btn lp-btn-accent" onclick="location.reload()">Refresh Status</button>
                        <button class="lp-btn" id="logout-restricted" style="background: transparent; border: 1px solid var(--lp-border-accent); color: white;">Logout</button>
                    </div>
                </div>
            </div>
        `
        document.getElementById('logout-restricted')?.addEventListener('click', async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
        })
        return
    }

    if (profile.role === 'admin') {
        renderAdminDashboard(profile)
    } else if (profile.role === 'teacher') {
        renderTeacherDashboard(profile)
    } else {
        renderStudentDashboard(profile)
    }
}

window.addEventListener('popstate', router)
