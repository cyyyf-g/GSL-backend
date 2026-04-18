import { supabase } from '../../supabase.js'

export async function renderStudents(container) {
    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>👨‍🎓 Students</h1>
            <button class="btn btn-primary" style="width: auto;" id="add-student">Add New Student</button>
        </div>

        <div class="search-bar" style="margin-bottom: 2rem; display: flex; gap: 1rem;">
            <input type="text" id="student-search" placeholder="Search by name or email..." style="flex: 1; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border);">
            <select id="level-filter" style="padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border);">
                <option value="">All Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
            </select>
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
                <tbody id="students-table-body">
                    <!-- Students will be loaded here -->
                </tbody>
            </table>
        </div>
    \`

    const tableBody = document.getElementById('students-table-body')
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading students...</td></tr>'

    const { data: students, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

    if (error) {
        tableBody.innerHTML = \`<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger);">Error: \${error.message}</td></tr>\`
        return
    }

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No students found.</td></tr>'
    } else {
        tableBody.innerHTML = students.map(student => \`
            <tr style="border-bottom: 1px solid var(--border); transition: var(--transition);" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                <td style="padding: 1rem; font-weight: 600;">\${student.full_name}</td>
                <td style="padding: 1rem;">\${student.email}</td>
                <td style="padding: 1rem;">\${student.phone || '--'}</td>
                <td style="padding: 1rem;">\${new Date(student.created_at).toLocaleDateString()}</td>
                <td style="padding: 1rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" onclick="alert('Student detail view coming soon')">View Details</button>
                </td>
            </tr>
        \`).join('')
    }
}
