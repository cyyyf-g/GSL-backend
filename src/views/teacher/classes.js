import { supabase } from '../../supabase.js'

export async function renderTeacherClasses(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📚 My Classes</h1>
        </div>
        <div id="teacher-classes-list"></div>
    `;

    const listContainer = document.getElementById('teacher-classes-list')
    listContainer.innerHTML = '<p>Loading your classes...</p>'

    const { data: myClasses, error } = await supabase
        .from('classes')
        .select(`
            *,
            levels ( name ),
            enrollments ( count )
        `)
        .eq('teacher_id', profile.id)

    if (error) {
        listContainer.innerHTML = `<p style="color: var(--danger)">Error: ${error.message}</p>`
        return
    }

    if (!myClasses || myClasses.length === 0) {
        listContainer.innerHTML = '<p>You have no assigned classes.</p>'
        return
    }

    listContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${myClasses.map(c => `
                <div class="stat-card">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem">${c.name}</h3>
                    <p style="font-size: 0.9rem; color: var(--gray);"><strong>Level:</strong> ${c.levels?.name || 'Unknown'}</p>
                    <p style="font-size: 0.9rem; color: var(--gray);"><strong>Students:</strong> ${c.enrollments[0]?.count || 0}</p>
                    <p style="font-size: 0.9rem; color: var(--gray); margin-bottom: 1rem;"><strong>Schedule:</strong> 
                        ${c.schedule ? `${c.schedule.days?.join(', ')} at ${c.schedule.time}` : 'Not set'}
                    </p>
                    <button class="btn btn-secondary" style="width: 100%; padding: 0.5rem;" onclick="viewTeacherClassDetails(${c.id}, '${c.name.replace(/'/g, "\\'")}')">View Class Roster</button>
                    <div id="teacher-class-details-${c.id}" style="margin-top: 1rem; display: none;"></div>
                </div>
            `).join('')}
        </div>
    `;

    window.viewTeacherClassDetails = async (classId, className) => {
        const detailContainer = document.getElementById(`teacher-class-details-${classId}`)
        if (detailContainer.style.display === 'block') {
            detailContainer.style.display = 'none'
            return
        }

        detailContainer.style.display = 'block'
        detailContainer.innerHTML = '<p style="font-size: 0.8rem">Loading roster...</p>'

        const { data: roster, error: rosterErr } = await supabase
            .from('enrollments')
            .select(`
                profiles ( id, full_name, email, phone )
            `)
            .eq('class_id', classId)
            .eq('status', 'active')

        if (rosterErr) {
            detailContainer.innerHTML = `<p style="color: var(--danger); font-size: 0.8rem">Error: ${rosterErr.message}</p>`
            return
        }

        if (!roster || roster.length === 0) {
            detailContainer.innerHTML = '<p style="font-size: 0.85rem">No students enrolled yet.</p>'
            return
        }

        detailContainer.innerHTML = `
            <div style="background: var(--bg-color); border-radius: 0.5rem; padding: 1rem; margin-top: 0.5rem;">
                <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem">Roster:</h4>
                <ul style="list-style: none; padding: 0; font-size: 0.85rem;">
                    ${roster.map(r => `
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
                            <div><strong>${r.profiles.full_name}</strong> <br> <span style="color: var(--gray)">${r.profiles.email}</span></div>
                            <div style="text-align: right; color: var(--gray)">${r.profiles.phone || '--'}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `
    }
}
