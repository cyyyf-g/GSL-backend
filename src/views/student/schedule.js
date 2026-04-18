import { supabase } from '../../supabase.js'

export async function renderSchedule(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📅 My Schedule</h1>
        </div>
        <div id="student-schedule-container"><p>Loading schedule...</p></div>
    `;

    const scheduleContainer = document.getElementById('student-schedule-container')

    const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
            classes (
                name,
                schedule,
                profiles ( full_name )
            )
        `)
        .eq('student_id', profile.id)
        .eq('status', 'active')

    if (error) {
        scheduleContainer.innerHTML = `<p style="color: var(--danger)">Error: ${error.message}</p>`
        return
    }

    if (!enrollments || enrollments.length === 0) {
        scheduleContainer.innerHTML = '<div class="stat-card"><p>You are not enrolled in any active classes.</p></div>'
        return
    }

    let scheduleHtml = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">`
    
    enrollments.forEach(e => {
        const c = e.classes
        const teacherName = c.profiles ? c.profiles.full_name : 'No teacher assigned'
        const scheduleDays = c.schedule?.days?.join(', ') || 'TBD'
        const scheduleTime = c.schedule?.time || 'TBD'
        const room = c.schedule?.room || 'TBD'

        scheduleHtml += `
            <div class="stat-card" style="border-left-color: var(--primary);">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">${c.name}</h3>
                <p style="margin-bottom: 0.5rem"><strong>👩‍🏫 Teacher:</strong> ${teacherName}</p>
                <p style="margin-bottom: 0.5rem"><strong>🗓️ Days:</strong> ${scheduleDays}</p>
                <p style="margin-bottom: 0.5rem"><strong>⏰ Time:</strong> ${scheduleTime}</p>
                <p style="margin-bottom: 0.5rem"><strong>🚪 Room:</strong> ${room}</p>
            </div>
        `
    })

    scheduleHtml += `</div>`
    scheduleContainer.innerHTML = scheduleHtml
}
