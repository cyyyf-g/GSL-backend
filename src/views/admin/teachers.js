import { supabase } from '../../supabase.js'

export async function renderTeachers(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>👩‍🏫 Teachers</h1>
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-primary" style="width: auto;" id="add-teacher" onclick="window.openAdminAddUserModal('teacher')">Add New Teacher</button>
            </div>
        </div>

        <div id="teacher-invite-msg" style="display: none; background: #e0f2fe; padding: 1.5rem; border-radius: 1rem; border-left: 4px solid var(--primary); margin-bottom: 2rem;">
            <p><strong>Note:</strong> To add a teacher, first <strong>Invite User</strong> via Supabase Dashboard (Authentication). Once they sign up, you can promote their profile to 'teacher' here.</p>
            <button class="btn btn-secondary" style="margin-top: 1rem; width: auto;" onclick="this.parentElement.style.display='none'">Got it</button>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem;">Name</th>
                        <th style="padding: 1rem;">Email</th>
                        <th style="padding: 1rem;">Phone</th>
                        <th style="padding: 1rem;">Joined Date</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="teachers-table-body">
                    <!-- Teachers will be loaded here -->
                </tbody>
            </table>
        </div>

        <div style="margin-top: 3rem;">
            <h2>Unassigned Staff / New Users</h2>
            <p style="color: var(--gray); font-size: 0.9rem;">Users who haven't been assigned a specific role (still students by default).</p>
            <div style="background: white; margin-top: 1rem; border-radius: 1rem; padding: 1rem; box-shadow: var(--shadow);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr>
                            <th style="padding: 1rem;">Name</th>
                            <th style="padding: 1rem;">Email</th>
                            <th style="padding: 1rem;">Action</th>
                        </tr>
                    </thead>
                    <tbody id="unassigned-table-body">
                        <!-- Potential teachers will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>
    `

    const tableBody = document.getElementById('teachers-table-body')
    const unassignedBody = document.getElementById('unassigned-table-body')
    const addTeacherBtn = document.getElementById('add-teacher')
    const inviteMsg = document.getElementById('teacher-invite-msg')

    addTeacherBtn.addEventListener('click', () => {
        // Since we have window.openAdminAddUserModal, we use that, but we can also show the manual invite msg
        inviteMsg.style.display = 'block'
    })

    let allTeachers = []

    async function loadTeachers() {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading teachers...</td></tr>'
        unassignedBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 1rem;">Loading...</td></tr>'

        const { data: allProfiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger);">Error: ${error.message}</td></tr>`
            return
        }

        allTeachers = allProfiles.filter(p => p.role === 'teacher')
        const unassigned = allProfiles.filter(p => p.role === 'student' && !p.email.includes('admin'))

        if (allTeachers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No teachers assigned yet.</td></tr>'
        } else {
            tableBody.innerHTML = allTeachers.map(t => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600;">${t.full_name}</td>
                    <td style="padding: 1rem;">${t.email}</td>
                    <td style="padding: 1rem;">${t.phone || '--'}</td>
                    <td style="padding: 1rem;">${new Date(t.created_at).toLocaleDateString()}</td>
                    <td style="padding: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-edit-teacher" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" data-id="${t.id}">Edit</button>
                        <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; color: var(--danger);" id="demote-${t.id}">Demote</button>
                    </td>
                </tr>
            `).join('')

            document.querySelectorAll('.btn-edit-teacher').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const teacher = allTeachers.find(t => t.id === e.target.dataset.id)
                    openEditTeacherModal(teacher)
                })
            })

            allTeachers.forEach(t => {
                document.getElementById(`demote-${t.id}`).addEventListener('click', async () => {
                    if (confirm(`Demote ${t.full_name} back to Student?`)) {
                        const { error } = await supabase.from('profiles').update({ role: 'student' }).eq('id', t.id)
                        if (error) alert(error.message)
                        else loadTeachers()
                    }
                })
            })
        }

        if (unassigned.length === 0) {
            unassignedBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 1rem;">No unassigned users.</td></tr>'
        } else {
            unassignedBody.innerHTML = unassigned.map(p => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem;">${p.full_name}</td>
                    <td style="padding: 1rem;">${p.email}</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" id="promote-${p.id}">Promote to Teacher</button>
                    </td>
                </tr>
            `).join('')

            unassigned.forEach(p => {
                document.getElementById(`promote-${p.id}`).addEventListener('click', async () => {
                    if (confirm(`Promote ${p.full_name} to Teacher?`)) {
                        const { error: upErr } = await supabase
                            .from('profiles')
                            .update({ role: 'teacher' })
                            .eq('id', p.id)
                        
                        if (upErr) alert(upErr.message)
                        else loadTeachers()
                    }
                })
            })
        }
    }

    function openEditTeacherModal(teacher) {
        const modalHtml = `
            <div id="edit-teacher-modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px);">
                <div style="background: white; padding: 2.5rem; border-radius: 1rem; width: 100%; max-width: 450px; box-shadow: var(--shadow-lg);">
                    <h2 style="margin-bottom: 2rem; color: var(--primary);">Edit Teacher Profile</h2>
                    <form id="edit-teacher-form" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="edit-t-name" class="form-input" value="${teacher.full_name}" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" id="edit-t-phone" class="form-input" value="${teacher.phone || ''}">
                        </div>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('#edit-teacher-modal').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `
        document.body.insertAdjacentHTML('beforeend', modalHtml)
        
        document.getElementById('edit-teacher-form').addEventListener('submit', async (e) => {
            e.preventDefault()
            const btn = e.target.querySelector('button[type="submit"]')
            btn.disabled = true; btn.textContent = 'Updating...';

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: document.getElementById('edit-t-name').value,
                    phone: document.getElementById('edit-t-phone').value
                })
                .eq('id', teacher.id)

            if (error) alert(error.message)
            else {
                alert('Teacher updated!')
                document.getElementById('edit-teacher-modal').remove()
                loadTeachers()
            }
        })
    }

    loadTeachers()
}
