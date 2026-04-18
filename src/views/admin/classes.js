import { supabase } from '../../supabase.js'

export async function renderClasses(container) {
    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📚 Classes</h1>
            <button class="btn btn-primary" style="width: auto;" id="add-class">Create New Class</button>
        </div>

        <div id="class-form-container" style="display: none; background: white; padding: 2rem; border-radius: 1rem; box-shadow: var(--shadow-lg); margin-bottom: 2rem;">
            <h3>Create New Class</h3>
            <form id="new-class-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                <div class="form-group" style="grid-column: span 2;">
                    <label>Class Name</label>
                    <input type="text" name="name" required placeholder="e.g. A1 Morning Group">
                </div>
                <div class="form-group">
                    <label>Level</label>
                    <select name="level_id" required id="level-select">
                        <option value="">Loading levels...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Teacher</label>
                    <select name="teacher_id" required id="teacher-select">
                        <option value="">Loading teachers...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" name="start_date" required>
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="date" name="end_date">
                </div>
                <div style="grid-column: span 2; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Save Class</button>
                    <button type="button" class="btn btn-secondary" id="cancel-class">Cancel</button>
                </div>
            </form>
        </div>

        <div id="roster-container" style="display: none; background: #f1f5f9; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem; border: 1px dashed var(--gray);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                <div>
                    <h3 id="roster-title">Class Roster</h3>
                    <p id="roster-subtitle" style="color: var(--gray); font-size: 0.9rem;">Manage students in this class.</p>
                </div>
                <button class="btn" style="width: auto; background: none; border: 1px solid var(--gray); font-size: 0.8rem;" id="close-roster">Close Roster</button>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: var(--shadow);">
                <div style="flex: 1;">
                    <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">Enroll Student</label>
                    <select id="student-to-enroll" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border);">
                        <option value="">Select a student...</option>
                    </select>
                </div>
                <button class="btn btn-primary" style="width: auto; align-self: end;" id="enroll-btn">Enroll</button>
            </div>

            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: var(--shadow);">
                <thead>
                    <tr style="background: var(--dark); color: white; font-size: 0.85rem;">
                        <th style="padding: 0.75rem 1rem;">Student Name</th>
                        <th style="padding: 0.75rem 1rem;">Enrolled At</th>
                        <th style="padding: 0.75rem 1rem;">Status</th>
                        <th style="padding: 0.75rem 1rem; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody id="roster-table-body">
                    <!-- Roster items -->
                </tbody>
            </table>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem;">Class Name</th>
                        <th style="padding: 1rem;">Level</th>
                        <th style="padding: 1rem;">Teacher</th>
                        <th style="padding: 1rem;">Dates</th>
                        <th style="padding: 1rem;">Students</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="classes-table-body">
                    <!-- Classes loaded here -->
                </tbody>
            </table>
        </div>
    \`

    const tableBody = document.getElementById('classes-table-body')
    const addBtn = document.getElementById('add-class')
    const formContainer = document.getElementById('class-form-container')
    const cancelBtn = document.getElementById('cancel-class')
    const rosterContainer = document.getElementById('roster-container')
    const closeRosterBtn = document.getElementById('close-roster')
    const enrollBtn = document.getElementById('enroll-btn')

    let currentClassId = null

    addBtn.addEventListener('click', () => {
        formContainer.style.display = 'block'
        rosterContainer.style.display = 'none'
        loadFormOptions()
    })

    cancelBtn.addEventListener('click', () => {
        formContainer.style.display = 'none'
    })

    closeRosterBtn.addEventListener('click', () => {
        rosterContainer.style.display = 'none'
    })

    loadClasses()

    async function loadClasses() {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading classes...</td></tr>'
        
        // Fetch classes with enrollment counts
        const { data: classes, error } = await supabase
            .from('classes')
            .select(\`
                *,
                levels(name),
                profiles(full_name),
                enrollments(count)
            \`)
            .order('created_at', { ascending: false })

        if (error) {
            tableBody.innerHTML = \`<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">Error: \${error.message}</td></tr>\`
            return
        }

        tableBody.innerHTML = classes.map(c => \`
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem; font-weight: 600;">\${c.name}</td>
                <td style="padding: 1rem;">\${c.levels?.name || '--'}</td>
                <td style="padding: 1rem;">\${c.profiles?.full_name || 'Unassigned'}</td>
                <td style="padding: 1rem; font-size: 0.85rem;">\${new Date(c.start_date).toLocaleDateString()} - \${c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Ongoing'}</td>
                <td style="padding: 1rem;">\${c.enrollments[0]?.count || 0} / \${c.max_students}</td>
                <td style="padding: 1rem;">
                    <button class="btn btn-secondary roster-btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" data-id="\${c.id}" data-name="\${c.name}">Manage Roster</button>
                </td>
            </tr>
        \`).join('')

        document.querySelectorAll('.roster-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id
                const name = e.target.dataset.name
                openRoster(id, name)
            })
        })
    }

    async function openRoster(classId, className) {
        currentClassId = classId
        document.getElementById('roster-title').textContent = \`Roster for \${className}\`
        rosterContainer.style.display = 'block'
        formContainer.style.display = 'none'
        
        loadRoster(classId)
        loadStudentsSelect(classId)
    }

    async function loadRoster(classId) {
        const rosterBody = document.getElementById('roster-table-body')
        rosterBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">Loading...</td></tr>'

        const { data: enrollments, error } = await supabase
            .from('enrollments')
            .select(\`
                *,
                profiles(full_name)
            \`)
            .eq('class_id', classId)

        if (error) {
            rosterBody.innerHTML = \`<tr><td colspan="4" style="text-align: center; padding: 1rem; color: var(--danger);">\${error.message}</td></tr>\`
            return
        }

        if (enrollments.length === 0) {
            rosterBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">No students enrolled yet.</td></tr>'
        } else {
            rosterBody.innerHTML = enrollments.map(e => \`
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 0.75rem 1rem; font-weight: 500;">\${e.profiles?.full_name}</td>
                    <td style="padding: 0.75rem 1rem; font-size: 0.85rem;">\${new Date(e.enrolled_at).toLocaleDateString()}</td>
                    <td style="padding: 0.75rem 1rem;">
                        <span style="font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.5rem; background: #fef9c3; color: #854d0e;">\${e.status}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem; text-align: right;">
                        <button style="color: var(--danger); background: none; border: none; cursor: pointer; font-size: 0.8rem;" onclick="unenrollStudent('\${e.id}')">Remove</button>
                    </td>
                </tr>
            \`).join('')
        }
    }

    async function loadStudentsSelect(classId) {
        const select = document.getElementById('student-to-enroll')
        // Get all students who are NOT already in this class
        const { data: enrolledStudents } = await supabase.from('enrollments').select('student_id').eq('class_id', classId)
        const enrolledIds = enrolledStudents ? enrolledStudents.map(e => e.student_id) : []

        const { data: allStudents } = await supabase.from('profiles').select('*').eq('role', 'student')
        
        if (allStudents) {
            const available = allStudents.filter(s => !enrolledIds.includes(s.id))
            select.innerHTML = '<option value="">Select a student...</option>' + 
                available.map(s => \`<option value="\${s.id}">\${s.full_name} (\${s.email})</option>\`).join('')
        }
    }

    enrollBtn.addEventListener('click', async () => {
        const studentId = document.getElementById('student-to-enroll').value
        if (!studentId) return alert('Please select a student')

        const { error } = await supabase.from('enrollments').insert({
            student_id: studentId,
            class_id: currentClassId
        })

        if (error) alert(error.message)
        else {
            openRoster(currentClassId, document.getElementById('roster-title').textContent.replace('Roster for ', ''))
            loadClasses() // Refresh count in main table
        }
    })

    // Inline unenroll logic (simplified for SPA)
    window.unenrollStudent = async (enrollmentId) => {
        if (confirm('Are you sure you want to remove this student?')) {
            const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId)
            if (error) alert(error.message)
            else {
                const classId = currentClassId
                const className = document.getElementById('roster-title').textContent.replace('Roster for ', '')
                openRoster(classId, className)
                loadClasses()
            }
        }
    }

    async function loadFormOptions() {
        const levelSelect = document.getElementById('level-select')
        const teacherSelect = document.getElementById('teacher-select')

        const [levelsRes, teachersRes] = await Promise.all([
            supabase.from('levels').select('*'),
            supabase.from('profiles').select('*').eq('role', 'teacher')
        ])

        if (levelsRes.data) {
            levelSelect.innerHTML = '<option value="">Select Level</option>' + 
                levelsRes.data.map(l => \`<option value="\${l.id}">\${l.name}</option>\`).join('')
        }
        
        if (teachersRes.data) {
            teacherSelect.innerHTML = '<option value="">Select Teacher</option>' + 
                teachersRes.data.map(t => \`<option value="\${t.id}">\${t.full_name}</option>\`).join('')
        }
    }

    document.getElementById('new-class-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newClass = {
            name: formData.get('name'),
            level_id: formData.get('level_id'),
            teacher_id: formData.get('teacher_id'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date') || null,
            is_active: true
        }

        const { error } = await supabase.from('classes').insert(newClass)
        if (error) alert(error.message)
        else {
            alert('Class created successfully!')
            formContainer.style.display = 'none'
            loadClasses()
        }
    })
}
