import { supabase } from '../../supabase.js'

export async function renderPublicTestDates(container) {
    container.innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto; padding: 4rem 2rem; animation: fadeIn 0.8s ease-out;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h1 style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;">Exam Dates</h1>
                <p style="color: var(--gray); font-size: 1.2rem;">Official dates for Goethe-Zertifikat, TestDaF and ÖSD.</p>
                <div style="width: 80px; height: 4px; background: var(--secondary); margin: 2rem auto;"></div>
            </div>

            <div id="public-dates-container">
                <div class="loader-container"><div class="loader"></div></div>
            </div>

            <div style="margin-top: 5rem; background: var(--primary); color: white; padding: 3rem; border-radius: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 2rem;">
                <div>
                    <h2 style="color: var(--secondary); margin-bottom: 0.5rem;">Ready for your exam?</h2>
                    <p style="opacity: 0.9;">Sign up now and prepare with our experts.</p>
                </div>
                <a href="/login" class="btn btn-secondary" style="width: auto; padding: 1rem 3.5rem;">Login Now</a>
            </div>
        </div>
    `

    const datesContainer = document.getElementById('public-dates-container')
    const { data: dates, error } = await supabase
        .from('test_dates')
        .select('*')
        .gte('exam_date', new Date().toISOString().split('T')[0])
        .order('exam_date', { ascending: true })

    if (error) {
        datesContainer.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading dates.</p>`
        return
    }

    if (!dates || dates.length === 0) {
        datesContainer.innerHTML = `
            <div class="stat-card" style="text-align: center; padding: 4rem;">
                <h3 style="color: var(--gray);">No dates available at the moment.</h3>
                <p>Please check back later or contact us directly.</p>
            </div>
        `
        return
    }

    datesContainer.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            ${dates.map(d => `
                <div class="stat-card" style="display: flex; align-items: center; gap: 2rem; padding: 2rem; border-left-width: 8px; flex-wrap: wrap;">
                    <div style="text-align: center; min-width: 100px; border-right: 1px solid var(--border); padding-right: 2rem;">
                        <span style="display: block; font-size: 0.8rem; text-transform: uppercase; color: var(--gray); font-weight: bold;">
                            ${new Date(d.exam_date).toLocaleString('en-US', { month: 'short' })}
                        </span>
                        <span style="display: block; font-size: 2rem; font-weight: 800; color: var(--primary); line-height: 1;">
                            ${new Date(d.exam_date).getDate()}
                        </span>
                        <span style="display: block; font-size: 0.9rem; color: var(--gray);">
                            ${new Date(d.exam_date).getFullYear()}
                        </span>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.4rem; color: var(--primary); margin-bottom: 0.25rem;">${d.exam_name}</h3>
                        <p style="color: var(--gray); font-weight: 600;">Level: ${d.exam_level || 'All'}</p>
                        <div style="display: flex; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap;">
                            <span style="font-size: 0.9rem; color: var(--gray);">📍 ${d.location || 'GSL School'}</span>
                            <span style="font-size: 0.9rem; color: var(--danger); font-weight: bold;">📝 Deadline: ${d.registration_deadline ? new Date(d.registration_deadline).toLocaleDateString() : '--'}</span>
                        </div>
                    </div>
                    <div>
                        <a href="/login" class="btn btn-primary" style="width: auto; padding: 0.75rem 1.5rem;">Reserve Spot</a>
                    </div>
                </div>
            `).join('')}
        </div>
    `
}
