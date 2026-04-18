import { supabase } from '../../supabase.js'

export async function renderAdminDashboard(profile) {
    const mainContent = document.getElementById('main-content')
    mainContent.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2 class="logo-text" style="font-size: 1.5rem; color: var(--secondary);">G<span>SL</span> Admin</h2>
                    <p style="font-size: 0.8rem; color: var(--gray); font-style: italic;">${profile.full_name}</p>
                </div>
                <nav class="nav-links">
                    <a href="/admin/overview" class="nav-link" data-view="overview">📊 Overview</a>
                    <a href="/admin/students" class="nav-link" data-view="students">👨‍🎓 Students</a>
                    <a href="/admin/teachers" class="nav-link" data-view="teachers">👩‍🏫 Teachers</a>
                    <a href="/admin/classes" class="nav-link" data-view="classes">📚 Classes</a>
                    <a href="/admin/fees" class="nav-link" data-view="fees">💰 Fees</a>
                    <a href="/admin/announcements" class="nav-link" data-view="announcements">📢 Announcements</a>
                    <a href="/admin/test-dates" class="nav-link" data-view="test-dates">📅 Test Dates</a>
                    <a href="/admin/placement-tests" class="nav-link" data-view="placement-tests">📝 Placement Tests</a>
                    <a href="/login" id="logout-btn" class="nav-link">🚪 Logout</a>
                </nav>
            </aside>
            <main class="content" id="admin-main">
                <!-- Content here -->
            </main>
        </div>
    `;

    const loadView = (view) => loadAdminView(view, profile)

    const navLinks = document.querySelectorAll('.nav-link[data-view]')
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const view = e.currentTarget.dataset.view
            window.history.pushState({}, '', '/admin/' + view)
            loadView(view)
            navLinks.forEach(l => l.classList.remove('active'))
            e.currentTarget.classList.add('active')
        })
    })

    const currentView = window.location.pathname.split('/')[2] || 'overview'
    loadView(currentView)
    const activeLink = document.querySelector('.nav-link[data-view="' + currentView + '"]')
    if (activeLink) activeLink.classList.add('active')

    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault()
        await supabase.auth.signOut()
        window.location.href = '/login'
    })
}

async function loadAdminView(view, profile) {
    const container = document.getElementById('admin-main')
    if (!container) return
    container.innerHTML = '<div class="loader-container"><div class="loader"></div></div>'

    switch (view) {
        case 'overview':
            renderOverview(container)
            break
        case 'students':
            import('./students.js').then(m => m.renderStudents(container))
            break
        case 'classes':
            import('./classes.js').then(m => m.renderClasses(container))
            break
        case 'announcements':
            import('../shared/announcements.js').then(m => m.renderAnnouncements(container, profile))
            break
        case 'test-dates':
            import('./test_dates.js').then(m => m.renderTestDates(container, profile))
            break
        case 'teachers':
            import('./teachers.js').then(m => m.renderTeachers(container))
            break
        case 'fees':
            import('./fees.js').then(m => m.renderFees(container))
            break
        case 'placement-tests':
            import('./placement_tests.js').then(m => m.renderPlacementTests(container, profile))
            break
        default:
            container.innerHTML = '<h1>' + view + '</h1><p>Module coming soon.</p>'
    }
}

async function renderOverview(container) {
    const [{ count: studentCount }, { count: classCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('is_active', true)
    ])

    container.innerHTML = `
        <h1>Admin Overview</h1>
        <div class="stats-grid">
            <div class="stat-card">
                <h3 style="color: var(--gray); font-size: 0.9rem;">Total Students</h3>
                <p style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${studentCount || 0}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--secondary);">
                <h3 style="color: var(--gray); font-size: 0.9rem;">Active Classes</h3>
                <p style="font-size: 2.5rem; font-weight: 800; color: var(--secondary);">${classCount || 0}</p>
            </div>
        </div>
    `;
}
