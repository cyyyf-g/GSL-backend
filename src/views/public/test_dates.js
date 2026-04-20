import { supabase } from '../../supabase.js'

export async function renderPublicTestDates(container) {
    container.innerHTML = `
        <div style="background: var(--lp-bg); min-height: 100vh; font-family: 'DM Sans', sans-serif; color: white; padding-bottom: 5rem;">
            <div style="max-width: 1000px; margin: 0 auto; padding: 6rem 2rem; animation: fadeIn 0.8s ease-out;">
                <div style="text-align: center; margin-bottom: 5rem;">
                    <div style="color: var(--lp-accent); font-weight: bold; font-size: 0.8rem; letter-spacing: 0.3em; margin-bottom: 1.5rem; text-transform: uppercase;">[ Official Examination ]</div>
                    <h1 class="font-serif" style="font-size: 4rem; color: white; margin-bottom: 1rem; line-height: 1;">Exam Dates</h1>
                    <p style="color: var(--lp-text-dim); font-size: 1.1rem; letter-spacing: 0.05em;">GSL Berlin · Official Testing Center</p>
                    <div style="width: 40px; height: 2px; background: var(--lp-accent); margin: 2.5rem auto;"></div>
                </div>

                <div id="public-dates-container">
                    <div class="loader-container"><div class="loader"></div></div>
                </div>

                <div style="margin-top: 6rem; background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); padding: 4rem; border-radius: 2px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 3rem; box-shadow: 0 30px 60px rgba(0,0,0,0.4);">
                    <div>
                        <h2 class="font-serif" style="color: var(--lp-accent); font-size: 2.5rem; margin-bottom: 1rem;">Ready for your exam?</h2>
                        <p style="color: var(--lp-text-dim); font-size: 1rem; letter-spacing: 0.05em; text-transform: uppercase;">Sign up now and prepare with our certified experts.</p>
                    </div>
                    <a href="/login" class="lp-btn lp-btn-accent" style="width: auto; padding: 1.25rem 4rem;">Secure Your Spot</a>
                </div>
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
        <div style="display: grid; gap: 2rem;">
            ${dates.map(d => `
                <div style="background: var(--lp-card-bg); border: 1px solid var(--lp-border-accent); display: flex; align-items: center; gap: 3rem; padding: 2.5rem; flex-wrap: wrap; transition: transform 0.3s ease; border-radius: 2px;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="text-align: center; min-width: 120px; border-right: 1px solid var(--lp-border-accent); padding-right: 3rem;">
                        <span style="display: block; font-size: 0.7rem; text-transform: uppercase; color: var(--lp-accent); font-weight: bold; letter-spacing: 0.2em; margin-bottom: 0.5rem;">
                            ${new Date(d.exam_date).toLocaleString('en-US', { month: 'short' })}
                        </span>
                        <span style="display: block; font-size: 3rem; font-weight: bold; color: white; line-height: 1; font-family: 'DM Serif Display', serif;">
                            ${new Date(d.exam_date).getDate()}
                        </span>
                        <span style="display: block; font-size: 0.8rem; color: var(--lp-text-dim); margin-top: 0.5rem; letter-spacing: 0.1em;">
                            ${new Date(d.exam_date).getFullYear()}
                        </span>
                    </div>
                    <div style="flex: 1;">
                        <div style="color: var(--lp-accent); font-size: 0.6rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.21em; margin-bottom: 0.5rem;">[ Certified Exam ]</div>
                        <h3 class="font-serif" style="font-size: 1.8rem; color: white; margin-bottom: 0.5rem;">${d.exam_name}</h3>
                        <div style="display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; align-items: center;">
                            <span style="font-size: 0.85rem; color: white; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: var(--lp-accent);">Level:</span> ${d.exam_level || 'All'}
                            </span>
                            <span style="font-size: 0.85rem; color: var(--lp-text-dim); display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: var(--lp-accent);">📍</span> ${d.location || 'Berlin Center'}
                            </span>
                            <span style="font-size: 0.85rem; color: #ff4d4d; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: var(--lp-accent);">⌛</span> Deadline: ${d.registration_deadline ? new Date(d.registration_deadline).toLocaleDateString() : '--'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <a href="/login" class="lp-btn lp-btn-outline" style="padding: 1rem 2rem; font-size: 0.7rem;">Reserve Spot</a>
                    </div>
                </div>
            `).join('')}
        </div>
    `
}
