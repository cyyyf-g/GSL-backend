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
    const inviteBtn = document.getElementById('add-teacher-btn')
    const inviteMsg = document.getElementById('teacher-invite-msg')

    inviteBtn.addEventListener('click', () => {
        inviteMsg.style.display = 'block'
    })

    loadTeachers()

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

        const teachers = allProfiles.filter(p => p.role === 'teacher')
        const unassigned = allProfiles.filter(p => p.role === 'student' && p.email !== 'admin@gsl.com') // Simple filter for demo

        if (teachers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No teachers assigned yet.</td></tr>'
        } else {
            tableBody.innerHTML = teachers.map(t => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600;">${t.full_name}</td>
                    <td style="padding: 1rem;">${t.email}</td>
                    <td style="padding: 1rem;">${t.phone || '--'}</td>
                    <td style="padding: 1rem;">${new Date(t.created_at).toLocaleDateString()}</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" onclick="alert('Manage teacher logic coming soon')">Manage</button>
                    </td>
                </tr>
            `).join('')
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
}
