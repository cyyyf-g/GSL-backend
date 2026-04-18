import { supabase } from '../../supabase.js'

export async function renderGrades(container, profile) {
    container.innerHTML = \`
        <h1>📝 Grades</h1>
        <p>Manage student assessments and scores.</p>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: var(--shadow);">
            <div style="flex: 1;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">Select Class</label>
                <select id="grade-class-select" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border);">
                    <option value="">Loading your classes...</option>
                </select>
            </div>
            <button class="btn btn-primary" style="width: auto; align-self: end;" id="load-history-btn">View Grade History</button>
            <button class="btn btn-secondary" style="width: auto; align-self: end;" id="new-assessment-btn">Add New Assessment</button>
        </div>

        <div id="assessment-form" style="display: none; background: white; padding: 2rem; border-radius: 1rem; box-shadow: var(--shadow-lg); margin-bottom: 2rem;">
            <h3>New Assessment</h3>
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Assessment Name</label>
                    <input type="text" id="assessment-name" placeholder="e.g. Midterm Exam">
                </div>
                <div class="form-group">
                    <label>Max Score</label>
                    <input type="number" id="assessment-max" value="100">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="assessment-date" value="\${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 1.5rem;">
                <thead>
                    <tr style="background: var(--light); text-align: left;">
                        <th style="padding: 0.75rem;">Student Name</th>
                        <th style="padding: 0.75rem;">Score</th>
                        <th style="padding: 0.75rem;">Notes</th>
                    </tr>
                </thead>
                <tbody id="grade-entry-body">
                    <!-- Students loaded here -->
                </tbody>
            </table>
            
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button class="btn btn-primary" style="width: auto;" id="save-grades-btn">Save Grades</button>
                <button class="btn btn-secondary" style="width: auto;" id="cancel-grades-btn">Cancel</button>
            </div>
        </div>

        <div id="grade-history" style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden; display: none;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--dark); color: white;">
                        <th style="padding: 1rem;">Assessment</th>
                        <th style="padding: 1rem;">Date</th>
                        <th style="padding: 1rem;">Average</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="history-table-body">
                    <!-- History loaded here -->
                </tbody>
            </table>
        </div>
    \`

    const classSelect = document.getElementById('grade-class-select')
    const historyBtn = document.getElementById('load-history-btn')
    const newBtn = document.getElementById('new-assessment-btn')
    const assessmentForm = document.getElementById('assessment-form')
    const historyView = document.getElementById('grade-history')
    const gradeEntryBody = document.getElementById('grade-entry-body')
    const saveBtn = document.getElementById('save-grades-btn')

    // Load teacher's classes
    const { data: classes } = await supabase.from('classes').select('id, name').eq('teacher_id', profile.id)
    if (classes) {
        classSelect.innerHTML = '<option value="">Select a class...</option>' + 
            classes.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('')
    }

    let currentRoster = []

    newBtn.addEventListener('click', async () => {
        const classId = classSelect.value
        if (!classId) return alert('Please select a class first')
        
        assessmentForm.style.display = 'block'
        historyView.style.display = 'none'
        gradeEntryBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 1rem;">Loading students...</td></tr>'

        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('student_id, profiles(full_name)')
            .eq('class_id', classId)
            .eq('status', 'active')

        if (!enrollments || enrollments.length === 0) {
            gradeEntryBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 1rem;">No students in class.</td></tr>'
            return
        }

        currentRoster = enrollments.map(e => ({
            student_id: e.student_id,
            full_name: e.profiles.full_name,
            score: '',
            notes: ''
        }))

        renderGradeEntry()
    })

    function renderGradeEntry() {
        gradeEntryBody.innerHTML = currentRoster.map((s, index) => \`
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.75rem; font-weight: 600;">\${s.full_name}</td>
                <td style="padding: 0.75rem;">
                    <input type="number" class="score-input" data-index="\${index}" value="\${s.score}" step="0.5" style="width: 80px; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border);">
                </td>
                <td style="padding: 0.75rem;">
                    <input type="text" class="grade-notes-input" data-index="\${index}" value="\${s.notes}" placeholder="Note..." style="width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border);">
                </td>
            </tr>
        \`).join('')

        document.querySelectorAll('.score-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                currentRoster[e.target.dataset.index].score = e.target.value
            })
        })
        document.querySelectorAll('.grade-notes-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                currentRoster[e.target.dataset.index].notes = e.target.value
            })
        })
    }

    saveBtn.addEventListener('click', async () => {
        const name = document.getElementById('assessment-name').value
        const max = document.getElementById('assessment-max').value
        const date = document.getElementById('assessment-date').value
        const classId = classSelect.value

        if (!name) return alert('Please enter assessment name')

        const gradesData = currentRoster
            .filter(s => s.score !== '')
            .map(s => ({
                student_id: s.student_id,
                class_id: classId,
                assessment_name: name,
                score: parseFloat(s.score),
                max_score: parseFloat(max),
                assessment_date: date,
                notes: s.notes,
                entered_by: profile.id
            }))

        if (gradesData.length === 0) return alert('No scores entered')

        const { error } = await supabase.from('grades').insert(gradesData)
        if (error) alert(error.message)
        else {
            alert('Grades saved successfully!')
            assessmentForm.style.display = 'none'
        }
    })

    historyBtn.addEventListener('click', async () => {
        const classId = classSelect.value
        if (!classId) return alert('Please select a class')

        historyView.style.display = 'block'
        assessmentForm.style.display = 'none'
        const historyTableBody = document.getElementById('history-table-body')
        historyTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">Loading history...</td></tr>'

        const { data: grades } = await supabase
            .from('grades')
            .select('*')
            .eq('class_id', classId)
            .order('assessment_date', { ascending: false })

        if (!grades || grades.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">No grade records found.</td></tr>'
            return
        }

        // Group by assessment name and date
        const groups = {}
        grades.forEach(g => {
            const key = \`\${g.assessment_name}|\${g.assessment_date}\`
            if (!groups[key]) groups[key] = { name: g.assessment_name, date: g.assessment_date, scores: [] }
            groups[key].scores.push(g.score)
        })

        historyTableBody.innerHTML = Object.values(groups).map(g => {
            const avg = (g.scores.reduce((a, b) => a + b, 0) / g.scores.length).toFixed(1)
            return \`
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600;">\${g.name}</td>
                    <td style="padding: 1rem;">\${new Date(g.date).toLocaleDateString()}</td>
                    <td style="padding: 1rem;">\${avg}</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; width: auto;" onclick="alert('Assessment edit not implemented in MVP')">Details</button>
                    </td>
                </tr>
            \`
        }).join('')
    })

    document.getElementById('cancel-grades-btn').addEventListener('click', () => {
        assessmentForm.style.display = 'none'
    })
}
