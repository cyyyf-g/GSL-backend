import { supabase } from '../../supabase.js'

export async function renderAttendance(container, profile) {
    container.innerHTML = \`
        <h1>📋 Attendance</h1>
        <p>Select a class and date to mark attendance.</p>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: var(--shadow);">
            <div style="flex: 1;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">Select Class</label>
                <select id="attendance-class-select" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border);">
                    <option value="">Loading your classes...</option>
                </select>
            </div>
            <div style="width: 200px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">Session Date</label>
                <input type="date" id="attendance-date" value="\${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border);">
            </div>
            <button class="btn btn-primary" style="width: auto; align-self: end;" id="load-attendance-btn">Load Roster</button>
        </div>

        <div id="attendance-sheet" style="display: none; background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--dark); color: white;">
                        <th style="padding: 1rem;">Student Name</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem;">Notes</th>
                    </tr>
                </thead>
                <tbody id="attendance-table-body">
                    <!-- Students loaded here -->
                </tbody>
            </table>
            <div style="padding: 1.5rem; text-align: right; border-top: 1px solid var(--border);">
                <button class="btn btn-primary" style="width: auto;" id="save-attendance-btn">Save Attendance</button>
            </div>
        </div>
    \`

    const classSelect = document.getElementById('attendance-class-select')
    const dateInput = document.getElementById('attendance-date')
    const loadBtn = document.getElementById('load-attendance-btn')
    const sheet = document.getElementById('attendance-sheet')
    const tableBody = document.getElementById('attendance-table-body')
    const saveBtn = document.getElementById('save-attendance-btn')

    // Load teacher's classes
    const { data: classes } = await supabase.from('classes').select('id, name').eq('teacher_id', profile.id)
    if (classes) {
        classSelect.innerHTML = '<option value="">Select a class...</option>' + 
            classes.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('')
    }

    let roster = []

    loadBtn.addEventListener('click', async () => {
        const classId = classSelect.value
        const date = dateInput.value
        if (!classId) return alert('Please select a class')

        sheet.style.display = 'block'
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">Loading roster...</td></tr>'

        // Get enrolled students
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('student_id, profiles(full_name)')
            .eq('class_id', classId)
            .eq('status', 'active')

        if (!enrollments || enrollments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">No active students in this class.</td></tr>'
            return
        }

        // Check if attendance already exists for this date
        const { data: existing } = await supabase
            .from('attendance')
            .select('*')
            .eq('class_id', classId)
            .eq('session_date', date)

        roster = enrollments.map(e => ({
            student_id: e.student_id,
            full_name: e.profiles.full_name,
            status: existing?.find(a => a.student_id === e.student_id)?.status || 'present',
            notes: existing?.find(a => a.student_id === e.student_id)?.notes || ''
        }))

        renderRoster()
    })

    function renderRoster() {
        tableBody.innerHTML = roster.map((s, index) => \`
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem; font-weight: 600;">\${s.full_name}</td>
                <td style="padding: 1rem;">
                    <select class="status-select" data-index="\${index}" style="padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border);">
                        <option value="present" \${s.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" \${s.status === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" \${s.status === 'late' ? 'selected' : ''}>Late</option>
                        <option value="excused" \${s.status === 'excused' ? 'selected' : ''}>Excused</option>
                    </select>
                </td>
                <td style="padding: 1rem;">
                    <input type="text" class="notes-input" data-index="\${index}" value="\${s.notes}" placeholder="Optional note..." style="width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border);">
                </td>
            </tr>
        \`).join('')

        document.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                roster[e.target.dataset.index].status = e.target.value
            })
        })

        document.querySelectorAll('.notes-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                roster[e.target.dataset.index].notes = e.target.value
            })
        })
    }

    saveBtn.addEventListener('click', async () => {
        const classId = classSelect.value
        const date = dateInput.value

        const attendanceData = roster.map(s => ({
            class_id: classId,
            student_id: s.student_id,
            session_date: date,
            status: s.status,
            notes: s.notes,
            marked_by: profile.id
        }))

        // Upsert logic (Delete existing if any, then insert)
        // Note: For simplicity, we'll just insert and rely on DB constraints or use a more complex query.
        // Supabase upsert requires a unique constraint. Let's assume we have one or just use a delete-then-insert.
        
        const { error: delErr } = await supabase
            .from('attendance')
            .delete()
            .eq('class_id', classId)
            .eq('session_date', date)

        if (delErr) {
            alert('Error clearing old records: ' + delErr.message)
            return
        }

        const { error: insErr } = await supabase.from('attendance').insert(attendanceData)
        if (insErr) alert(insErr.message)
        else alert('Attendance saved successfully!')
    })
}
