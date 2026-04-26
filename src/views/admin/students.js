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
                <option value="">All School Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="active">Active Students</option>
                <option value="suspended">Suspended</option>
                <option value="finished">Finished</option>
            </select>

            <select id="enrollment-filter" style="padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border);">
                <option value="">All Enrollment</option>
                <option value="enrolled">Has Enrollment</option>
                <option value="none">No Enrollment</option>
            </select>

            <select id="sort-by" style="padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border);">
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
            </select>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem; cursor: pointer;">Name</th>
                        <th style="padding: 1rem;">Email</th>
                        <th style="padding: 1rem;">School Status</th>
                        <th style="padding: 1rem;">Courses</th>
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
                    id,
                    status,
                    enrolled_at,
                    classes ( id, name, start_date )
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
            
            // School status check
            let matchesStatus = true
            if (statusFilter) {
                matchesStatus = s.status === statusFilter
            }

            // Enrollment check
            const enrollmentFilter = document.getElementById('enrollment-filter').value
            let matchesEnrollment = true
            if (enrollmentFilter === 'none') {
                matchesEnrollment = !s.enrollments || s.enrollments.length === 0
            } else if (enrollmentFilter === 'enrolled') {
                matchesEnrollment = s.enrollments && s.enrollments.length > 0
            }

            return matchesSearch && matchesStatus && matchesEnrollment
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
            const coursesCount = enrollments.length
            
            let statusBadge = ''
            switch (student.status) {
                case 'pending': 
                    statusBadge = '<span style="background: #fef3c7; color: #92400e; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">Pending Approval</span>'
                    break
                case 'active':
                    statusBadge = '<span style="background: #dcfce7; color: #166534; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">Active</span>'
                    break
                case 'suspended':
                    statusBadge = '<span style="background: #fee2e2; color: #991b1b; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">Suspended</span>'
                    break
                case 'finished':
                    statusBadge = '<span style="background: #f1f5f9; color: #475569; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">Finished</span>'
                    break
                default:
                    statusBadge = `<span style="background: #f1f5f9; color: #475569; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem;">${student.status}</span>`
            }

            return `
                <tr style="border-bottom: 1px solid var(--border); transition: var(--transition);" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                    <td style="padding: 1rem; font-weight: 600;">${student.full_name}</td>
                    <td style="padding: 1rem;">${student.email}</td>
                    <td style="padding: 1rem;">${statusBadge}</td>
                    <td style="padding: 1rem; font-size: 0.9rem;">${coursesCount} Course(s)</td>
                    <td style="padding: 1rem; font-size: 0.85rem; color: var(--gray);">${new Date(student.created_at).toLocaleDateString()}</td>
                    <td style="padding: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${student.status === 'pending' ? `
                            <button class="btn btn-primary btn-approve" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: var(--success);" data-id="${student.id}">Enroll / Approve</button>
                        ` : ''}
                        ${student.status === 'active' ? `
                            <button class="btn btn-secondary btn-suspend" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: #ea580c; color: white;" data-id="${student.id}">Suspend</button>
                            <button class="btn btn-secondary btn-finish" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: #64748b; color: white;" data-id="${student.id}">Mark Finished</button>
                        ` : ''}
                        ${student.status === 'suspended' || student.status === 'finished' ? `
                            <button class="btn btn-primary btn-re-enroll" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: var(--primary);" data-id="${student.id}">Re-Enroll</button>
                        ` : ''}
                        <button class="btn btn-secondary btn-view-profile" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: var(--secondary); color: white;" data-id="${student.id}">View</button>
                        <button class="btn btn-delete-student" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; background: var(--danger); color: white; border: none;" data-id="${student.id}" title="Delete Profile">×</button>
                    </td>
                </tr>
            `
        }).join('')

        // Add event listeners for view/edit/delete/status
        document.querySelectorAll('.btn-view-profile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const student = allStudents.find(s => s.id === e.target.dataset.id)
                openProfileModal(student)
            })
        })
        
        document.querySelectorAll('.btn-approve, .btn-re-enroll').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                await updateStudentStatus(e.target.dataset.id, 'active', 'Student enrolled successfully!')
            })
        })

        document.querySelectorAll('.btn-suspend').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to suspend this student?')) {
                    await updateStudentStatus(e.target.dataset.id, 'suspended', 'Student suspended.')
                }
            })
        })

        document.querySelectorAll('.btn-finish').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Mark this student as finished?')) {
                    await updateStudentStatus(e.target.dataset.id, 'finished', 'Student course path marked as finished.')
                }
            })
        })

        document.querySelectorAll('.btn-delete-student').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure? This will delete the student profile permanently.')) {
                    const id = e.currentTarget.dataset.id
                    const { error } = await supabase.from('profiles').delete().eq('id', id)
                    if (error) alert(error.message)
                    else loadStudents()
                }
            })
        })
    }

    async function updateStudentStatus(id, newStatus, successMsg) {
        const { error } = await supabase
            .from('profiles')
            .update({ 
                status: newStatus,
                is_approved: newStatus === 'active' 
            })
            .eq('id', id)

        if (error) alert(error.message)
        else {
            if (successMsg) alert(successMsg)
            loadStudents()
        }
    }

    // Attach search/filter listeners
    document.getElementById('student-search').addEventListener('input', applyFiltersAndSort)
    document.getElementById('status-filter').addEventListener('change', applyFiltersAndSort)
    document.getElementById('enrollment-filter').addEventListener('change', applyFiltersAndSort)
    document.getElementById('sort-by').addEventListener('change', applyFiltersAndSort)

    // Profile Modal Logic
    async function openProfileModal(student) {
        // Show loading state in modal or fetch first
        // For better UX, we'll fetch then show
        const [feesRes, attendanceRes] = await Promise.all([
            supabase.from('fees').select('*').eq('student_id', student.id),
            supabase.from('attendance').select('*, classes(name)').eq('student_id', student.id)
        ])

        const enrollments = student.enrollments || []
        const fees = feesRes.data || []
        const attendance = attendanceRes.data || []

        // Calculate age
        let ageStr = 'N/A'
        if (student.date_of_birth) {
            const birthDate = new Date(student.date_of_birth)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const m = today.getMonth() - birthDate.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            ageStr = age
        }

        const modalHtml = `
            <div id="student-profile-modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(8px); padding: 1rem;">
                <div style="background: white; border-radius: 1.5rem; width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
                    <div style="padding: 2.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                            <div style="display: flex; gap: 1.5rem; align-items: center;">
                                <div style="width: 80px; height: 80px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;">
                                    ${student.full_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h2 style="margin: 0; font-size: 1.8rem;">${student.full_name}</h2>
                                    <p style="margin: 0; color: var(--gray);">${student.email}</p>
                                </div>
                            </div>
                            <button class="btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray);" onclick="this.closest('#student-profile-modal').remove()">&times;</button>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                            <div style="background: #f8fafc; padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border);">
                                <p style="margin: 0; font-size: 0.8rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.05em;">Gender</p>
                                <p style="margin: 0.5rem 0 0 0; font-weight: 600; font-size: 1.1rem; color: var(--primary);">${student.gender ? (student.gender.charAt(0).toUpperCase() + student.gender.slice(1)) : 'Not Specified'}</p>
                            </div>
                            <div style="background: #f8fafc; padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border);">
                                <p style="margin: 0; font-size: 0.8rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.05em;">Age</p>
                                <p style="margin: 0.5rem 0 0 0; font-weight: 600; font-size: 1.1rem; color: var(--primary);">${ageStr} years</p>
                            </div>
                            <div style="background: #f8fafc; padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border);">
                                <p style="margin: 0; font-size: 0.8rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.05em;">Birth Date</p>
                                <p style="margin: 0.5rem 0 0 0; font-weight: 600; font-size: 1.1rem; color: var(--primary);">${student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div style="background: #f8fafc; padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border);">
                                <p style="margin: 0; font-size: 0.8rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.05em;">Phone</p>
                                <p style="margin: 0.5rem 0 0 0; font-weight: 600; font-size: 1.1rem; color: var(--primary);">${student.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">📚 Class Enrollments</h3>
                        ${enrollments.length === 0 ? '<p style="color: var(--gray); font-style: italic;">No active enrollments found.</p>' : `
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                                    <thead>
                                        <tr style="text-align: left; border-bottom: 2px solid #f1f5f9;">
                                            <th style="padding: 1rem 0.5rem;">Class Name</th>
                                            <th style="padding: 1rem 0.5rem;">Start Date</th>
                                            <th style="padding: 1rem 0.5rem;">Joined</th>
                                            <th style="padding: 1rem 0.5rem;">Payment</th>
                                            <th style="padding: 1rem 0.5rem;">Attendance</th>
                                            <th style="padding: 1rem 0.5rem;">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${enrollments.map(e => {
                                            const classFees = fees.filter(f => f.class_id === e.classes?.id)
                                            const isPaid = classFees.some(f => f.status === 'paid')
                                            
                                            const classAttendance = attendance.filter(a => a.class_id === e.classes?.id)
                                            const totalSessions = classAttendance.length
                                            const present = classAttendance.filter(a => a.status === 'present').length
                                            const attendanceRate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0

                                            return `
                                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                                    <td style="padding: 1rem 0.5rem; font-weight: 600;">${e.classes?.name || 'Unknown Class'}</td>
                                                    <td style="padding: 1rem 0.5rem;">${e.classes?.start_date ? new Date(e.classes.start_date).toLocaleDateString() : 'TBD'}</td>
                                                    <td style="padding: 1rem 0.5rem;">${new Date(e.enrolled_at).toLocaleDateString()}</td>
                                                    <td style="padding: 1rem 0.5rem;">
                                                        <span style="display: flex; align-items: center; gap: 0.4rem; color: ${isPaid ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                                                            ${isPaid ? '✅ Paid' : '❌ Not Paid'}
                                                        </span>
                                                    </td>
                                                    <td style="padding: 1rem 0.5rem;">
                                                        <div style="font-size: 0.85rem;">
                                                            <div style="font-weight: 600;">${attendanceRate}%</div>
                                                            <div style="color: var(--gray);">${present}/${totalSessions} sessions</div>
                                                        </div>
                                                    </td>
                                                    <td style="padding: 1rem 0.5rem;">
                                                        <span style="padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.8rem; background: ${e.status === 'active' ? '#dcfce7' : '#f1f5f9'}; color: ${e.status === 'active' ? '#166534' : 'var(--gray)'};">
                                                            ${e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `
        document.body.insertAdjacentHTML('beforeend', modalHtml)
    }

    // Edit Modal Logic
    function openEditModal(student) {
        const modalHtml = `
            <div id="edit-student-modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px);">
                <div style="background: white; padding: 2.5rem; border-radius: 1rem; width: 100%; max-width: 500px; box-shadow: var(--shadow-lg);">
                    <h2 style="margin-bottom: 2rem;">Edit Student Profile</h2>
                    <form id="edit-student-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="edit-name" class="form-input" value="${student.full_name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" id="edit-phone" class="form-input" value="${student.phone || ''}">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Gender</label>
                                <select id="edit-gender" class="form-input">
                                    <option value="" ${!student.gender ? 'selected' : ''}>Select Gender</option>
                                    <option value="male" ${student.gender === 'male' ? 'selected' : ''}>Male</option>
                                    <option value="female" ${student.gender === 'female' ? 'selected' : ''}>Female</option>
                                    <option value="other" ${student.gender === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Date of Birth</label>
                                <input type="date" id="edit-dob" class="form-input" value="${student.date_of_birth || ''}">
                            </div>
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
                    phone: document.getElementById('edit-phone').value,
                    gender: document.getElementById('edit-gender').value,
                    date_of_birth: document.getElementById('edit-dob').value || null
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
