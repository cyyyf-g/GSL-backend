import { supabase } from '../../supabase.js'

export async function renderAdminDashboard(profile) {
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
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 class="logo-text" style="font-size: 1.5rem; color: var(--secondary);">G<span>SL</span> Admin</h2>
                        <button id="sidebar-close" class="lg:hidden" style="background: none; border: none; color: white; cursor: pointer; display: none;">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
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
                    <a href="/admin/test-results" class="nav-link" data-view="test-results">📊 Test Results</a>
                    <a href="/admin/contact-submissions" class="nav-link" data-view="contact-submissions">📋 Contact Submissions</a>
                    <a href="/admin/site-settings" class="nav-link" data-view="site-settings">🌐 Site Content</a>
                    <a href="/admin/profile" class="nav-link" data-view="profile">👤 My Profile</a>
                    <a href="/login" id="logout-btn" class="nav-link">🚪 Logout</a>
                </nav>
            </aside>
            <main class="content" id="admin-main">
                <!-- Content here -->
            </main>
        </div>

        <!-- Universal Add User Modal -->
        <div id="admin-add-user-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 2.5rem; border-radius: 1rem; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 id="admin-add-user-title">Add User</h2>
                    <button id="admin-add-user-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray);">&times;</button>
                </div>
                <form id="admin-add-user-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <input type="hidden" id="add-user-role" value="student">
                    
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="add-user-name" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="add-user-email" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="add-user-password" class="form-input" required minlength="6">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Gender (Optional)</label>
                            <select id="add-user-gender" class="form-input">
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">DOB (Optional)</label>
                            <input type="date" id="add-user-dob" class="form-input">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" id="add-user-submit" style="margin-top: 1rem;">Create Account</button>
                    <p id="add-user-error" style="color: var(--danger); font-size: 0.8rem; text-align: center; display: none;"></p>
                </form>
            </div>
        </div>
    `;

    // Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebarClose = document.getElementById('sidebar-close');

    const toggleSidebar = () => {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    };

    hamburger?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', toggleSidebar);
    sidebarClose?.addEventListener('click', toggleSidebar);

    // Modal Logic
    const modal = document.getElementById('admin-add-user-modal');
    const closeBtn = document.getElementById('admin-add-user-close');
    const form = document.getElementById('admin-add-user-form');
    const submitBtn = document.getElementById('add-user-submit');
    const errorMsg = document.getElementById('add-user-error');

    window.openAdminAddUserModal = (role) => {
        document.getElementById('add-user-role').value = role;
        document.getElementById('admin-add-user-title').textContent = role === 'teacher' ? 'Add New Teacher' : 'Add New Student';
        form.reset();
        errorMsg.style.display = 'none';
        modal.style.display = 'flex';
    };

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        errorMsg.style.display = 'none';

        const role = document.getElementById('add-user-role').value;
        const fullName = document.getElementById('add-user-name').value;
        const email = document.getElementById('add-user-email').value;
        const password = document.getElementById('add-user-password').value;

        const { data, error } = await supabase.rpc('admin_create_user', {
            new_email: email,
            new_password: password,
            new_role: role,
            new_full_name: fullName
        });

        if (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        } else {
            // Update additional profile info
            const gender = document.getElementById('add-user-gender').value;
            const dob = document.getElementById('add-user-dob').value;
            
            if (gender || dob) {
                await supabase
                    .from('profiles')
                    .update({ 
                        gender: gender || null, 
                        date_of_birth: dob || null 
                    })
                    .eq('id', data);
            }

            alert(fullName + ' successfully created and auto-approved!');
            modal.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            
            // Refresh view based on role
            const currentView = window.location.pathname.split('/')[2];
            if ((role === 'student' && currentView === 'students') || (role === 'teacher' && currentView === 'teachers')) {
                loadAdminView(currentView, profile);
            }
        }
    });

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
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            }
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
        case 'test-results':
            import('./test_results.js').then(m => m.renderTestResults(container))
            break
        case 'contact-submissions':
            import('./contact_submissions.js').then(m => m.renderContactSubmissions(container))
            break
        case 'site-settings':
            import('./site_settings.js').then(m => m.renderSiteSettings(container))
            break
        case 'profile':
            import('../shared/profile.js').then(m => m.renderProfile(container, profile))
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
