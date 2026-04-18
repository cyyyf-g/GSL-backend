import { supabase } from '../../supabase.js'

export async function renderAttendance(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>✅ My Attendance</h1>
        </div>
        <div id="student-attendance-container"><p>Loading attendance records...</p></div>
    `;

    const attContainer = document.getElementById('student-attendance-container')

    const { data: attendance, error } = await supabase
        .from('attendance')
        .select(`
            session_date,
            status,
            notes,
            classes ( name )
        `)
        .eq('student_id', profile.id)
        .order('session_date', { ascending: false })

    if (error) {
        attContainer.innerHTML = `<p style="color: var(--danger)">Error: ${error.message}</p>`
        return
    }

    if (!attendance || attendance.length === 0) {
        attContainer.innerHTML = '<div class="stat-card"><p>No attendance records found.</p></div>'
        return
    }

    // Group by class if desired, or just show a table
    const getStatusColor = (status) => {
        switch(status) {
            case 'present': return 'var(--success)'
            case 'absent': return 'var(--danger)'
            case 'late': return 'var(--warning)'
            case 'excused': return 'var(--secondary)'
            default: return 'var(--gray)'
        }
    }

    attContainer.innerHTML = `
        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: var(--primary); color: white;">
                    <tr>
                        <th style="padding: 1rem;">Date</th>
                        <th style="padding: 1rem;">Class</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem;">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${attendance.map(a => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 1rem;">${new Date(a.session_date).toLocaleDateString()}</td>
                            <td style="padding: 1rem; font-weight: 500;">${a.classes?.name || 'Unknown Class'}</td>
                            <td style="padding: 1rem;">
                                <span style="background: ${getStatusColor(a.status)}20; color: ${getStatusColor(a.status)}; padding: 0.3rem 0.6rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 600; text-transform: capitalize;">
                                    ${a.status}
                                </span>
                            </td>
                            <td style="padding: 1rem; color: var(--gray); font-size: 0.9rem;">${a.notes || '--'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
