import { supabase } from '../../supabase.js'

export async function renderTestDates(container, profile) {
    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📅 Exam Test Dates</h1>
            <button class="btn btn-primary" style="width: auto;" id="add-test-date-btn">Add New Test Date</button>
        </div>

        <div id="test-date-form" style="display: none; background: white; padding: 2rem; border-radius: 1rem; box-shadow: var(--shadow-lg); margin-bottom: 2rem;">
            <h3>New Test Date</h3>
            <form id="new-test-date-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Exam Name</label>
                    <input type="text" name="exam_name" required placeholder="e.g. Goethe B1">
                </div>
                <div class="form-group">
                    <label>Level</label>
                    <input type="text" name="exam_level" required placeholder="B1">
                </div>
                <div class="form-group">
                    <label>Exam Date</label>
                    <input type="date" name="exam_date" required>
                </div>
                <div class="form-group">
                    <label>Registration Deadline</label>
                    <input type="date" name="registration_deadline">
                </div>
                <div class="form-group" style="grid-column: span 2;">
                    <label>Location</label>
                    <input type="text" name="location" placeholder="e.g. Main Hall / Online">
                </div>
                <div style="grid-column: span 2; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Save date</button>
                    <button type="button" class="btn btn-secondary" id="cancel-test-date">Cancel</button>
                </div>
            </form>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem;">Exam</th>
                        <th style="padding: 1rem;">Level</th>
                        <th style="padding: 1rem;">Date</th>
                        <th style="padding: 1rem;">Deadline</th>
                        <th style="padding: 1rem;">Location</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="test-dates-table-body">
                    <!-- Loaded here -->
                </tbody>
            </table>
        </div>
    \`

    const list = document.getElementById('test-dates-table-body')
    const addBtn = document.getElementById('add-test-date-btn')
    const form = document.getElementById('test-date-form')
    const cancelBtn = document.getElementById('cancel-test-date')

    addBtn.addEventListener('click', () => {
        form.style.display = 'block'
    })

    cancelBtn.addEventListener('click', () => {
        form.style.display = 'none'
    })

    loadTestDates()

    async function loadTestDates() {
        list.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading...</td></tr>'
        const { data, error } = await supabase.from('test_dates').select('*').order('exam_date', { ascending: true })

        if (error) {
            list.innerHTML = \`<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">\${error.message}</td></tr>\`
            return
        }

        if (data.length === 0) {
            list.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No upcoming test dates.</td></tr>'
        } else {
            list.innerHTML = data.map(d => \`
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600;">\${d.exam_name}</td>
                    <td style="padding: 1rem;">\${d.exam_level}</td>
                    <td style="padding: 1rem;">\${new Date(d.exam_date).toLocaleDateString()}</td>
                    <td style="padding: 1rem; color: \${new Date(d.registration_deadline) < new Date() ? 'var(--danger)' : 'inherit'}">\${d.registration_deadline ? new Date(d.registration_deadline).toLocaleDateString() : '--'}</td>
                    <td style="padding: 1rem;">\${d.location || '--'}</td>
                    <td style="padding: 1rem;">
                        <button style="color: var(--danger); background: none; border: none; cursor: pointer; font-size: 0.8rem;" id="del-\${d.id}">Delete</button>
                    </td>
                </tr>
            \`).join('')

            data.forEach(d => {
                document.getElementById(\`del-\${d.id}\`).addEventListener('click', async () => {
                    if (confirm('Delete this test date?')) {
                        await supabase.from('test_dates').delete().eq('id', d.id)
                        loadTestDates()
                    }
                })
            })
        }
    }

    document.getElementById('new-test-date-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newDate = {
            exam_name: formData.get('exam_name'),
            exam_level: formData.get('exam_level'),
            exam_date: formData.get('exam_date'),
            registration_deadline: formData.get('registration_deadline') || null,
            location: formData.get('location'),
            created_by: profile.id
        }

        const { error } = await supabase.from('test_dates').insert(newDate)
        if (error) alert(error.message)
        else {
            alert('Test date saved!')
            form.style.display = 'none'
            loadTestDates()
        }
    })
}
