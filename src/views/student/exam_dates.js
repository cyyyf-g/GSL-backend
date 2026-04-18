import { supabase } from '../../supabase.js'

export async function renderExamDates(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📅 Exam Dates</h1>
        </div>
        <div id="student-exams-container"><p>Loading upcoming exam dates...</p></div>
    `;

    const examContainer = document.getElementById('student-exams-container')

    const { data: exams, error } = await supabase
        .from('test_dates')
        .select('*')
        .order('exam_date', { ascending: true })

    if (error) {
        examContainer.innerHTML = `<p style="color: var(--danger)">Error: ${error.message}</p>`
        return
    }

    if (!exams || exams.length === 0) {
        examContainer.innerHTML = '<div class="stat-card"><p>No upcoming exams scheduled.</p></div>'
        return
    }

    examContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${exams.map(e => `
                <div class="stat-card" style="border-left-color: var(--secondary);">
                    <h3 style="color: var(--secondary); margin-bottom: 0.5rem">${e.exam_name} (${e.exam_level})</h3>
                    <p style="margin-bottom: 0.5rem"><strong>🗓️ Date:</strong> ${new Date(e.exam_date).toLocaleDateString()}</p>
                    <p style="margin-bottom: 0.5rem"><strong>📍 Location:</strong> ${e.location || 'TBD'}</p>
                    <p style="margin-bottom: 0.5rem; color: var(--danger);"><strong>⏳ Register By:</strong> ${e.registration_deadline ? new Date(e.registration_deadline).toLocaleDateString() : 'N/A'}</p>
                    <p style="margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--gray);">${e.notes ? `<em>Notes: ${e.notes}</em>` : ''}</p>
                </div>
            `).join('')}
        </div>
    `;
}
