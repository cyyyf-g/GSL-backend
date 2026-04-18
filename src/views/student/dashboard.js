import { supabase } from '../../supabase.js'

export async function renderStudentDashboard(profile) {
    const mainContent = document.getElementById('main-content')
    mainContent.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2 class="logo-text" style="font-size: 1.5rem; color: var(--secondary);">G<span>SL</span> Student</h2>
                    <p style="font-size: 0.8rem; color: var(--gray); font-style: italic;">Welcome, ${profile.full_name}</p>
                </div>
                <nav class="nav-links">
                    <a href="/student/home" class="nav-link" data-view="home">🏠 Home</a>
                    <a href="/student/schedule" class="nav-link" data-view="schedule">📅 My Schedule</a>
                    <a href="/student/grades" class="nav-link" data-view="grades">📊 My Grades</a>
                    <a href="/student/attendance" class="nav-link" data-view="attendance">✅ My Attendance</a>
                    <a href="/student/fees" class="nav-link" data-view="fees">💳 My Fees</a>
                    <a href="/student/announcements" class="nav-link" data-view="announcements">📢 Announcements</a>
                    <a href="/student/placement-test" class="nav-link" data-view="placement-test">📝 Take Placement Test</a>
                    <a href="/student/exam-dates" class="nav-link" data-view="exam-dates">📅 Exam Dates</a>
                    <a href="/student/profile" class="nav-link" data-view="profile">👤 My Profile</a>
                    <a href="/login" id="logout-btn" class="nav-link">🚪 Logout</a>
                </nav>
            </aside>
            <main class="content" id="student-main">
                <!-- Content here -->
            </main>
        </div>
    `;

    const loadView = (view) => loadStudentView(view, profile)

    const navLinks = document.querySelectorAll('.nav-link[data-view]')
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const view = e.currentTarget.dataset.view
            window.history.pushState({}, '', '/student/' + view)
            loadView(view)
            navLinks.forEach(l => l.classList.remove('active'))
            e.currentTarget.classList.add('active')
        })
    })

    const view = window.location.pathname.split('/')[2] || 'home'
    loadView(view)
    const activeLink = document.querySelector('.nav-link[data-view="' + view + '"]')
    if (activeLink) activeLink.classList.add('active')

    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault()
        await supabase.auth.signOut()
        window.location.href = '/login'
    })
}

async function loadStudentView(view, profile) {
    const container = document.getElementById('student-main')
    if (!container) return
    container.innerHTML = '<div class="loader-container"><div class="loader"></div></div>'

    switch (view) {
        case 'home':
            renderHome(container, profile)
            break
        case 'schedule':
            import('./schedule.js').then(m => m.renderSchedule(container, profile))
            break
        case 'grades':
            renderStudentGrades(container, profile)
            break
        case 'attendance':
            import('./attendance.js').then(m => m.renderAttendance(container, profile))
            break
        case 'fees':
            import('./fees.js').then(m => m.renderFees(container, profile))
            break
        case 'announcements':
            import('../shared/announcements.js').then(m => m.renderAnnouncements(container, profile))
            break
        case 'placement-test':
            renderPlacementTestTaking(container, profile)
            break
        case 'exam-dates':
            import('./exam_dates.js').then(m => m.renderExamDates(container, profile))
            break
        case 'profile':
            import('../shared/profile.js').then(m => m.renderProfile(container, profile))
            break
        default:
            container.innerHTML = '<h1>' + view + '</h1><p>Module coming soon.</p>'
    }
}

async function renderHome(container, profile) {
    const [{ data: enrollments }, { data: announcements }] = await Promise.all([
        supabase.from('enrollments').select('*, classes(name, start_date)').eq('student_id', profile.id),
        supabase.from('announcements').select('*').in('audience', ['all', 'students']).order('published_at', { ascending: false }).limit(3)
    ])

    let classesHtml = '';
    if (enrollments && enrollments.length > 0) {
        enrollments.forEach(e => {
            classesHtml += '<p style="margin-top: 0.5rem;"><strong>' + e.classes.name + '</strong></p>';
        });
    } else {
        classesHtml = '<p>Not enrolled yet.</p>';
    }

    let annHtml = '';
    if (announcements && announcements.length > 0) {
        announcements.forEach(a => {
            annHtml += '<p style="margin-top: 0.5rem; font-size: 0.9rem;">' + a.title + '</p>';
        });
    } else {
        annHtml = '<p>No new messages.</p>';
    }

    container.innerHTML = `
        <h1>Welcome, ${profile.full_name}!</h1>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
            <section class="stat-card">
                <h3>My Classes</h3>
                ${classesHtml}
            </section>
            <section class="stat-card" style="border-left-color: var(--secondary);">
                <h3>Latest Announcements</h3>
                ${annHtml}
            </section>
        </div>
    `;
}

async function renderStudentGrades(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📊 My Grades</h1>
        </div>
        <div id="student-grades-container"><p>Loading grades...</p></div>
    `;

    const { data: grades, error } = await supabase
        .from('grades')
        .select('*, classes(name)')
        .eq('student_id', profile.id)
        .order('assessment_date', { ascending: false })

    const gradesContainer = document.getElementById('student-grades-container')

    if (error) {
        gradesContainer.innerHTML = `<p style="color: var(--danger)">Error: ${error.message}</p>`
        return
    }

    if (!grades || grades.length === 0) {
        gradesContainer.innerHTML = '<div class="stat-card"><p>No grades have been posted yet.</p></div>'
        return
    }

    gradesContainer.innerHTML = `
        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: var(--primary); color: white;">
                    <tr>
                        <th style="padding: 1rem;">Date</th>
                        <th style="padding: 1rem;">Class</th>
                        <th style="padding: 1rem;">Assessment</th>
                        <th style="padding: 1rem;">Score</th>
                        <th style="padding: 1rem;">Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${grades.map(g => {
                        const pct = g.score != null && g.max_score ? ((g.score / g.max_score) * 100).toFixed(1) : 0;
                        const pctColor = pct >= 80 ? 'var(--success)' : (pct >= 60 ? 'var(--warning)' : 'var(--danger)');
                        return `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 1rem;">${g.assessment_date ? new Date(g.assessment_date).toLocaleDateString() : '--'}</td>
                            <td style="padding: 1rem; font-weight: 500;">${g.classes?.name || 'Unknown Class'}</td>
                            <td style="padding: 1rem;">${g.assessment_name}</td>
                            <td style="padding: 1rem;"><strong>${g.score}</strong> / ${g.max_score}</td>
                            <td style="padding: 1rem; color: ${pctColor}; font-weight: bold;">${pct}%</td>
                        </tr>
                        `
                    }).join('')}
                </tbody>
            </table>
        </div>
    `
}

async function renderPlacementTestTaking(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📝 Placement Test</h1>
        </div>
        <div id="student-placement-container"><p>Loading placement tests...</p></div>
    `;

    const ptContainer = document.getElementById('student-placement-container')

    const [{ data: tests, error: testsErr }, { data: results, error: resultsErr }] = await Promise.all([
        supabase.from('placement_tests').select('*'),
        supabase.from('placement_test_results').select('*').eq('student_id', profile.id)
    ])

    if (testsErr || resultsErr) {
        ptContainer.innerHTML = `<p style="color: var(--danger)">Error loading tests.</p>`
        return
    }

    if (!tests || tests.length === 0) {
        ptContainer.innerHTML = '<div class="stat-card"><p>No placement tests are currently available.</p></div>'
        return
    }

    const takenTestIds = results ? results.map(r => r.test_id) : []

    ptContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${tests.map(t => {
                const hasTaken = takenTestIds.includes(t.id)
                const result = hasTaken ? results.find(r => r.test_id === t.id) : null
                
                return `
                <div class="stat-card" style="border-left-color: ${hasTaken ? 'var(--success)' : 'var(--primary)'};">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem">${t.title}</h3>
                    <p style="margin-bottom: 1rem; color: var(--gray); font-size: 0.9rem;">${t.description || 'Test your current German level.'}</p>
                    
                    ${hasTaken ? `
                        <div style="background: var(--success)20; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                            <p style="color: var(--success); font-weight: bold; margin-bottom: 0.5rem;">✅ Test Completed</p>
                            <p style="margin-bottom: 0.25rem;"><strong>Score:</strong> ${result.score}%</p>
                            <p><strong>Recommended Level:</strong> ${result.recommended_level}</p>
                        </div>
                    ` : `
                        <button class="btn btn-primary start-test-btn" style="width: 100%;" data-test-id="${t.id}">Start Test</button>
                    `}
                </div>
                `
            }).join('')}
        </div>
    `;

    document.querySelectorAll('.start-test-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const testId = Number(btn.dataset.testId)
            const test = tests.find(t => t.id === testId)
            if (test) {
                const { renderTestSession } = await import('./placement_test_session.js')
                renderTestSession(container, profile, test)
            }
        })
    })
}
