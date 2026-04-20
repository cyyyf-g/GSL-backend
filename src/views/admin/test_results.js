import { supabase } from '../../supabase.js'

export async function renderTestResults(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📊 Public Placement Test Results</h1>
            <p style="color: var(--gray);">Results from the landing page assessment</p>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem;">Student Name</th>
                        <th style="padding: 1rem;">Phone</th>
                        <th style="padding: 1rem;">Language</th>
                        <th style="padding: 1rem;">Score</th>
                        <th style="padding: 1rem;">CEFR Level</th>
                        <th style="padding: 1rem;">Date</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="test-results-body">
                    <tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading results...</td></tr>
                </tbody>
            </table>
        </div>
    `

    const tableBody = document.getElementById('test-results-body')

    async function loadResults() {
        const { data, error } = await supabase
            .from('public_test_results')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--danger);">${error.message}</td></tr>`
            return
        }

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No results found yet.</td></tr>'
            return
        }

        tableBody.innerHTML = data.map(result => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem; font-weight: 600;">${result.name}</td>
                <td style="padding: 1rem;">${result.phone}</td>
                <td style="padding: 1rem;">${result.language}</td>
                <td style="padding: 1rem;"><span style="background: var(--light); padding: 0.2rem 0.5rem; border-radius: 0.25rem;">${result.score}/${result.total}</span></td>
                <td style="padding: 1rem;"><strong style="color: var(--secondary);">${result.cefr_level}</strong></td>
                <td style="padding: 1rem; font-size: 0.8rem; color: var(--gray);">${new Date(result.submitted_at).toLocaleString()}</td>
                <td style="padding: 1rem;">
                    <button class="btn-delete" data-id="${result.id}" style="color: var(--danger); background: none; border: none; cursor: pointer; font-size: 0.8rem;">Delete</button>
                </td>
            </tr>
        `).join('')

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this result?')) {
                    const id = e.target.dataset.id
                    const { error } = await supabase.from('public_test_results').delete().eq('id', id)
                    if (error) alert(error.message)
                    else loadResults()
                }
            })
        })
    }

    loadResults()
}
