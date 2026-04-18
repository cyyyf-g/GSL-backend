import { supabase } from '../../supabase.js'

export async function renderFees(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>💰 Fees</h1>
            <button class="btn btn-primary" style="width: auto;" id="add-fee-btn">Record New Fee/Payment</button>
        </div>

        <div id="fee-form-container" style="display: none; background: white; padding: 2rem; border-radius: 1rem; box-shadow: var(--shadow-lg); margin-bottom: 2rem;">
            <h3>Record Fee/Payment</h3>
            <form id="new-fee-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Student</label>
                    <select name="student_id" required id="fee-student-select">
                        <option value="">Loading students...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Amount (DZD)</label>
                    <input type="number" name="amount" required placeholder="5000">
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" name="due_date" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <div style="grid-column: span 2; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Save Record</button>
                    <button type="button" class="btn btn-secondary" id="cancel-fee">Cancel</button>
                </div>
            </form>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem;">Student</th>
                        <th style="padding: 1rem;">Amount</th>
                        <th style="padding: 1rem;">Due Date</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="fees-table-body">
                    <!-- Fees loaded here -->
                </tbody>
            </table>
        </div>
    `

    const tableBody = document.getElementById('fees-table-body')
    const addBtn = document.getElementById('add-fee-btn')
    const formContainer = document.getElementById('fee-form-container')
    const cancelBtn = document.getElementById('cancel-fee')

    addBtn.addEventListener('click', () => {
        formContainer.style.display = 'block'
        loadFeeOptions()
    })

    cancelBtn.addEventListener('click', () => {
        formContainer.style.display = 'none'
    })

    loadFees()

    async function loadFees() {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading fees...</td></tr>'
        const { data: fees, error } = await supabase
            .from('fees')
            .select(`
                *,
                profiles(full_name)
            `)
            .order('due_date', { ascending: true })

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger);">Error: ${error.message}</td></tr>`
            return
        }

        if (fees.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No fee records found.</td></tr>'
        } else {
            tableBody.innerHTML = fees.map(f => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600;">${f.profiles?.full_name}</td>
                    <td style="padding: 1rem;">${f.amount} DZD</td>
                    <td style="padding: 1rem;">${new Date(f.due_date).toLocaleDateString()}</td>
                    <td style="padding: 1rem;">
                        <span style="background: ${f.status === 'paid' ? '#dcfce7' : '#fee2e2'}; color: ${f.status === 'paid' ? '#166534' : '#991b1b'}; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700;">
                            ${f.status.toUpperCase()}
                        </span>
                    </td>
                    <td style="padding: 1rem;">
                        ${f.status !== 'paid' ? `<button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" id="pay-${f.id}">Mark as Paid</button>` : 'No actions'}
                    </td>
                </tr>
            `).join('')

            fees.forEach(f => {
                if (f.status !== 'paid') {
                    document.getElementById(`pay-${f.id}`)?.addEventListener('click', async () => {
                        const { error: upErr } = await supabase
                            .from('fees')
                            .update({ status: 'paid', paid_at: new Date().toISOString() })
                            .eq('id', f.id)
                        
                        if (upErr) alert(upErr.message)
                        else loadFees()
                    })
                }
            })
        }
    }

    async function loadFeeOptions() {
        const studentSelect = document.getElementById('fee-student-select')
        const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student')
        if (students) {
            studentSelect.innerHTML = '<option value="">Select Student</option>' + 
                students.map(s => `<option value="${s.id}">${s.full_name}</option>`).join('')
        }
    }

    document.getElementById('new-fee-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newFee = {
            student_id: formData.get('student_id'),
            amount: parseFloat(formData.get('amount')),
            due_date: formData.get('due_date'),
            status: formData.get('status'),
            paid_at: formData.get('status') === 'paid' ? new Date().toISOString() : null
        }

        const { error } = await supabase.from('fees').insert(newFee)
        if (error) alert(error.message)
        else {
            alert('Fee record created!')
            formContainer.style.display = 'none'
            loadFees()
        }
    })
}
