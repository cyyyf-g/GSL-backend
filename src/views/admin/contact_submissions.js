import { supabase } from '../../supabase.js'

export async function renderContactSubmissions(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📋 Contact Submissions</h1>
            <p style="color: var(--gray);">Messages from the website contact form</p>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem;">Name</th>
                        <th style="padding: 1rem;">Contact Info</th>
                        <th style="padding: 1rem;">Interests</th>
                        <th style="padding: 1rem;">Message</th>
                        <th style="padding: 1rem;">Date</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="contact-submissions-body">
                    <tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading messages...</td></tr>
                </tbody>
            </table>
        </div>
    `

    const tableBody = document.getElementById('contact-submissions-body')

    async function loadSubmissions() {
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">${error.message}</td></tr>`
            return
        }

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No messages yet.</td></tr>'
            return
        }

        tableBody.innerHTML = data.map(sub => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem; font-weight: 600;">${sub.name}</td>
                <td style="padding: 1rem; font-size: 0.85rem;">
                    <div>📞 ${sub.phone}</div>
                    ${sub.email ? `<div style="color: var(--gray);">✉️ ${sub.email}</div>` : ''}
                </td>
                <td style="padding: 1rem; font-size: 0.85rem;">
                    ${sub.languages ? `<div style="color: var(--secondary); font-weight: 500;">🌐 ${sub.languages.join(', ')}</div>` : ''}
                    ${sub.interest ? `<div style="font-style: italic;">🎯 ${sub.interest}</div>` : ''}
                </td>
                <td style="padding: 1rem;">
                    <div style="max-height: 80px; overflow-y: auto; font-size: 0.9rem; color: #444; background: #f9f9f9; padding: 0.5rem; border-radius: 0.25rem;">
                        ${sub.message || '<span style="color: #999;">No message</span>'}
                    </div>
                </td>
                <td style="padding: 1rem; font-size: 0.8rem; color: var(--gray);">${new Date(sub.submitted_at).toLocaleString()}</td>
                <td style="padding: 1rem;">
                    <button class="btn-delete" data-id="${sub.id}" style="color: var(--danger); background: none; border: none; cursor: pointer; font-size: 0.8rem;">Delete</button>
                </td>
            </tr>
        `).join('')

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Delete this message?')) {
                    const id = e.target.dataset.id
                    const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
                    if (error) alert(error.message)
                    else loadSubmissions()
                }
            })
        })
    }

    loadSubmissions()
}
