import { supabase } from '../../supabase.js'

export async function renderTeacherDashboard(profile) {
    const mainContent = document.getElementById('main-content')
    mainContent.innerHTML = `
        <div class="dashboard-layout">
            <header class="mobile-header">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h2 class="logo-text" style="font-size: 1.2rem; color: var(--secondary); margin: 0;">G<span>SL</span></h2>
                </div>
                <button id="hamburger" class="hamburger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </header>

            <div id="sidebar-overlay" class="sidebar-overlay"></div>

            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h2 class="logo-text" style="font-size: 1.5rem; color: var(--secondary);">G<span>SL</span> Teacher</h2>
                    <p style="font-size: 0.8rem; color: var(--gray); font-style: italic;">Welcome, ${profile.full_name}</p>
                </div>
                <nav class="nav-links">
                    <a href="/teacher/overview" class="nav-link" data-view="overview">📊 My Overview</a>
                    <a href="/teacher/classes" class="nav-link" data-view="classes">📚 My Classes</a>
                    <a href="/teacher/attendance" class="nav-link" data-view="attendance">📋 Attendance</a>
                    <a href="/teacher/grades" class="nav-link" data-view="grades">📝 Grades</a>
                    <a href="/teacher/announcements" class="nav-link" data-view="announcements">📢 Announcements</a>
                    <a href="/teacher/profile" class="nav-link" data-view="profile">👤 My Profile</a>
                    <a href="/login" id="logout-btn" class="nav-link">🚪 Logout</a>
                </nav>
            </aside>
            <main class="content" id="teacher-main">
                <!-- Content here -->
            </main>
        </div>
    `;

    // Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebar-overlay');

    const toggleSidebar = () => {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    };

    hamburger?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', toggleSidebar);

    const loadView = (view) => loadTeacherView(view, profile)

    const navLinks = document.querySelectorAll('.nav-link[data-view]')
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const view = e.currentTarget.dataset.view
            window.history.pushState({}, '', '/teacher/' + view)
            loadView(view)
            navLinks.forEach(l => l.classList.remove('active'))
            e.currentTarget.classList.add('active')

            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            }
        })
    })

    const view = window.location.pathname.split('/')[2] || 'overview'
    loadView(view)
    const activeLink = document.querySelector('.nav-link[data-view="' + view + '"]')
    if (activeLink) activeLink.classList.add('active')

    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault()
        await supabase.auth.signOut()
        window.location.href = '/login'
    })
}

async function loadTeacherView(view, profile) {
    const container = document.getElementById('teacher-main')
    if (!container) return
    container.innerHTML = '<div class="loader-container"><div class="loader"></div></div>'

    switch (view) {
        case 'overview':
            renderOverview(container, profile)
            break
        case 'classes':
            import('./classes.js').then(m => m.renderTeacherClasses(container, profile))
            break
        case 'attendance':
            import('./attendance.js').then(m => m.renderAttendance(container, profile))
            break
        case 'grades':
            import('./grades.js').then(m => m.renderGrades(container, profile))
            break
        case 'announcements':
            import('../shared/announcements.js').then(m => m.renderAnnouncements(container, profile))
            break
        case 'profile':
            import('../shared/profile.js').then(m => m.renderProfile(container, profile))
            break
        default:
            container.innerHTML = '<h1>' + view + '</h1><p>Module coming soon.</p>'
    }
}

async function renderOverview(container, profile) {
    const { data: myClasses } = await supabase.from('classes').select('*, levels(name)').eq('teacher_id', profile.id)

    let classesHtml = '';
    if (myClasses && myClasses.length > 0) {
        myClasses.forEach(c => {
            const levelName = c.levels ? c.levels.name : 'Unknown';
            classesHtml += '<div class="stat-card" style="border-bottom: 4px solid var(--secondary); border-left: none;"><h3 style="color: var(--primary);">' + c.name + '</h3><p style="color: var(--gray); font-size: 0.9rem;">Level: ' + levelName + '</p></div>';
        });
    } else {
        classesHtml = '<p>No classes assigned.</p>';
    }

    container.innerHTML = `
        <h1>My Overview</h1>
        <div style="margin-top: 2rem;">
            <h2>My Active Classes</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
                ${classesHtml}
            </div>
        </div>
    `;
}
