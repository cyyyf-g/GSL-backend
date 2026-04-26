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

    if (profile.role === 'admin') {
        renderAdminDashboard(profile)
    } else if (profile.role === 'teacher') {
        renderTeacherDashboard(profile)
    } else {
        renderStudentDashboard(profile)
    }
}

window.addEventListener('popstate', router)
