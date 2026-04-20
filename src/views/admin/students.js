import { supabase } from '../../supabase.js'

export async function renderStudents(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>👨‍🎓 Students</h1>
            <button class="btn btn-primary" style="width: auto;" id="add-student" onclick="window.openAdminAddUserModal('student')">Add New Student</button>
        </div>

        <!-- Pending Approvals Section -->
        <div id="pending-approvals-section" style="margin-bottom: 3rem; display: none;">
            <h2 style="color: var(--warning); margin-bottom: 1rem;">⚠️ Pending Email Confirmations</h2>
            <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--warning);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: var(--warning); color: white;">
                            <th style="padding: 1rem;">Name</th>
                            <th style="padding: 1rem;">Email</th>
                            <th style="padding: 1rem;">Role</th>
                            <th style="padding: 1rem;">Sign Up Date</th>
                            <th style="padding: 1rem;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="unconfirmed-users-table-body">
                    </tbody>
                </table>
            </div>
        </div>

        <div class="search-bar" style="margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
            <input type="text" id="student-search" placeholder="Search by name or email..." style="flex: 1; min-width: 250px; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border);">
            
            <select id="status-filter" style="padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border);">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="none">No Enrollment</option>
            </select>

            <select id="sort-by" style="padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border);">
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
            </select>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem; cursor: pointer;">Name</th>
                        <th style="padding: 1rem;">Email</th>
                        <th style="padding: 1rem;">Registered Courses</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem;">Joined Date</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="students-table-body">
                    <!-- Students will be loaded here -->
                </tbody>
            </table>
        </div>
    `

    const tableBody = document.getElementById('students-table-body')
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading students...</td></tr>'

    let allStudents = []

    async function loadStudents() {
        // Fetch profiles with their enrollments and the class details
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                enrollments!left (
                    status,
                    classes ( name )
                )
            `)
            .eq('role', 'student')

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">Error: ${error.message}</td></tr>`
            return
        }

        allStudents = data
        applyFiltersAndSort()
    }

    function applyFiltersAndSort() {
        const searchTerm = document.getElementById('student-search').value.toLowerCase()
        const statusFilter = document.getElementById('status-filter').value
        const sortBy = document.getElementById('sort-by').value

        let filtered = allStudents.filter(s => {
            const matchesSearch = s.full_name?.toLowerCase().includes(searchTerm) || s.email?.toLowerCase().includes(searchTerm)
            
            // Enrollment status check
            let matchesStatus = true
            if (statusFilter) {
                if (statusFilter === 'none') {
                    matchesStatus = !s.enrollments || s.enrollments.length === 0
                } else {
                    matchesStatus = s.enrollments?.some(e => e.status === statusFilter)
                }
            }

            return matchesSearch && matchesStatus
        })

        // Sort logic
        filtered.sort((a, b) => {
            if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '')
            if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '')
            if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at)
            if (sortBy === 'date_asc') return new Date(a.created_at) - new Date(b.created_at)
            return 0
        })

        renderTable(filtered)
    }

    function renderTable(dataList) {
        if (dataList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No students found matching your criteria.</td></tr>'
            return
        }

        tableBody.innerHTML = dataList.map(student => {
            const enrollments = student.enrollments || []
            const courses = enrollments.map(e => e.classes?.name).filter(Boolean).join(', ') || '<span style="color: var(--gray); font-style: italic;">Not Enrolled</span>'
            
            // Determine a "Summary" status
            let statusHtml = '<span style="color: var(--gray);">Inactive</span>'
            if (enrollments.some(e => e.status === 'active')) {
                statusHtml = '<span style="color: var(--success); font-weight: 600;">Active</span>'
            } else if (enrollments.some(e => e.status === 'completed')) {
                statusHtml = '<span style="color: var(--primary);">Completed</span>'
            } else if (enrollments.some(e => e.status === 'dropped')) {
                statusHtml = '<span style="color: var(--danger);">Dropped</span>'
            }

            return `
                <tr style="border-bottom: 1px solid var(--border); transition: var(--transition);" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                    <td style="padding: 1rem; font-weight: 600;">${student.full_name}</td>
                    <td style="padding: 1rem;">${student.email}</td>
                    <td style="padding: 1rem; font-size: 0.9rem;">${courses}</td>
                    <td style="padding: 1rem;">${statusHtml}</td>
                    <td style="padding: 1rem; font-size: 0.85rem; color: var(--gray);">${new Date(student.created_at).toLocaleDateString()}</td>
                    <td style="padding: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-edit-student" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" data-id="${student.id}">Edit</button>
                        <button class="btn btn-delete-student" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: var(--danger); color: white; border: none;" data-id="${student.id}">Delete</button>
                    </td>
                </tr>
            `
        }).join('')

        // Add event listeners for edit/delete
        document.querySelectorAll('.btn-edit-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const student = allStudents.find(s => s.id === e.target.dataset.id)
                openEditModal(student)
            })
        })

        document.querySelectorAll('.btn-delete-student').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure? This will delete the student profile permanently. (The auth account will still exist in Supabase Dashboard)')) {
                    const id = e.target.dataset.id
                    const { error } = await supabase.from('profiles').delete().eq('id', id)
                    if (error) alert(error.message)
                    else loadStudents()
                }
            })
        })
    }

    // Attach search/filter listeners
    document.getElementById('student-search').addEventListener('input', applyFiltersAndSort)
    document.getElementById('status-filter').addEventListener('change', applyFiltersAndSort)
    document.getElementById('sort-by').addEventListener('change', applyFiltersAndSort)

    // Edit Modal Logic
    function openEditModal(student) {
        const modalHtml = `
            <div id="edit-student-modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px);">
                <div style="background: white; padding: 2.5rem; border-radius: 1rem; width: 100%; max-width: 450px; box-shadow: var(--shadow-lg);">
                    <h2 style="margin-bottom: 2rem;">Edit Student</h2>
                    <form id="edit-student-form" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="edit-name" class="form-input" value="${student.full_name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" id="edit-phone" class="form-input" value="${student.phone || ''}">
                        </div>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('#edit-student-modal').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `
        document.body.insertAdjacentHTML('beforeend', modalHtml)
        
        document.getElementById('edit-student-form').addEventListener('submit', async (e) => {
            e.preventDefault()
            const btn = e.target.querySelector('button[type="submit"]')
            btn.disabled = true; btn.textContent = 'Updating...';

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: document.getElementById('edit-name').value,
                    phone: document.getElementById('edit-phone').value
                })
                .eq('id', student.id)

            if (error) alert(error.message)
            else {
                alert('Student updated successfully!')
                document.getElementById('edit-student-modal').remove()
                loadStudents()
            }
        })
    }

    // Fetch Unconfirmed Users via RPC
    async function checkUnconfirmed() {
        const { data: unconfirmedUsers, error: rpcError } = await supabase.rpc('admin_get_unconfirmed_users')
        if (!rpcError && unconfirmedUsers && unconfirmedUsers.length > 0) {
            const section = document.getElementById('pending-approvals-section')
            section.style.display = 'block';
            document.getElementById('unconfirmed-users-table-body').innerHTML = unconfirmedUsers.map(u => `
                <tr style="border-bottom: 1px solid var(--border); transition: var(--transition);" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='white'">
                    <td style="padding: 1rem; font-weight: 600;">${u.full_name}</td>
                    <td style="padding: 1rem;">${u.email}</td>
                    <td style="padding: 1rem;"><span style="background: var(--gray); color: white; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.8rem;">${u.role}</span></td>
                    <td style="padding: 1rem;">${new Date(u.created_at).toLocaleDateString()}</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-primary confirm-btn" data-id="${u.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: var(--success);">
                            ✅ Confirm Email
                        </button>
                    </td>
                </tr>
            `).join('')

            document.querySelectorAll('.confirm-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = e.currentTarget.dataset.id;
                    e.currentTarget.disabled = true;
                    e.currentTarget.textContent = 'Confirming...';
                    
                    const { error } = await supabase.rpc('admin_confirm_user', { target_user_id: userId });
                    if (error) {
                        alert('Failed: ' + error.message);
                        e.currentTarget.disabled = false;
                        e.currentTarget.textContent = '✅ Confirm Email';
                    } else {
                        alert('User confirmed!');
                        checkUnconfirmed();
                        loadStudents();
                    }
                })
            })
        } else {
            document.getElementById('pending-approvals-section').style.display = 'none';
        }
    }

    loadStudents()
    checkUnconfirmed()
}
