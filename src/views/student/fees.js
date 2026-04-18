import { supabase } from '../../supabase.js'

export async function renderFees(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>💳 My Fees</h1>
        </div>
        <div id="student-fees-container"><p>Loading fee records...</p></div>
    `;

    const feesContainer = document.getElementById('student-fees-container')

    const { data: fees, error } = await supabase
        .from('fees')
        .select(`
            *,
            classes ( name )
        `)
        .eq('student_id', profile.id)
        .order('due_date', { ascending: true })

    if (error) {
        feesContainer.innerHTML = `<p style="color: var(--danger)">Error: ${error.message}</p>`
        return
    }

    if (!fees || fees.length === 0) {
        feesContainer.innerHTML = '<div class="stat-card"><p>No fee records found.</p></div>'
        return
    }

    const getStatusColor = (status) => {
        switch(status) {
            case 'paid': return 'var(--success)'
            case 'overdue': return 'var(--danger)'
            case 'pending': return 'var(--warning)'
            case 'waived': return 'var(--gray)'
            default: return 'var(--gray)'
        }
    }

    feesContainer.innerHTML = `
        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: var(--primary); color: white;">
                    <tr>
                        <th style="padding: 1rem;">Class</th>
                        <th style="padding: 1rem;">Amount</th>
                        <th style="padding: 1rem;">Due Date</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem;">Receipt</th>
                    </tr>
                </thead>
                <tbody>
                    ${fees.map(f => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 1rem; font-weight: 500;">${f.classes?.name || 'General Tuition'}</td>
                            <td style="padding: 1rem;">${f.amount} ${f.currency}</td>
                            <td style="padding: 1rem;">${f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A'}</td>
                            <td style="padding: 1rem;">
                                <span style="background: ${getStatusColor(f.status)}20; color: ${getStatusColor(f.status)}; padding: 0.3rem 0.6rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 600; text-transform: capitalize;">
                                    ${f.status}
                                </span>
                            </td>
                            <td style="padding: 1rem; color: var(--gray); font-size: 0.9rem;">
                                ${f.receipt_number || '--'}
                                ${f.paid_at ? `<br><small>Paid: ${new Date(f.paid_at).toLocaleDateString()}</small>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--gray);">Note: Online payments are currently not supported. Please pay at the school office.</p>
    `;
}
