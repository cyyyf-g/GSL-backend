import { supabase } from '../../supabase.js'

export async function renderAnnouncements(container, profile) {
    const isStaff = profile.role === 'admin' || profile.role === 'teacher'
    
    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📢 Announcements</h1>
            \${isStaff ? '<button class="btn btn-primary" style="width: auto;" id="add-announcement-btn">Post New Announcement</button>' : ''}
        </div>

        \${isStaff ? \`
        <div id="announcement-form" style="display: none; background: white; padding: 2rem; border-radius: 1rem; box-shadow: var(--shadow-lg); margin-bottom: 2rem;">
            <h3>Post New Announcement</h3>
            <form id="new-announcement-form" style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required placeholder="e.g. School Holiday Next Week">
                </div>
                <div class="form-group">
                    <label>Body</label>
                    <textarea name="body" required placeholder="Details..." style="width: 100%; min-height: 120px; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border); font-family: inherit;"></textarea>
                </div>
                <div class="form-group">
                    <label>Audience</label>
                    <select name="audience">
                        <option value="all">All</option>
                        <option value="students">Students only</option>
                        <option value="teachers">Teachers only</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Post Now</button>
                    <button type="button" class="btn btn-secondary" id="cancel-announcement">Cancel</button>
                </div>
            </form>
        </div>
        \` : ''}

        <div id="announcements-list" style="display: grid; gap: 1.5rem;">
            <!-- Announcements loaded here -->
        </div>
    \`

    const list = document.getElementById('announcements-list')
    const addBtn = document.getElementById('add-announcement-btn')
    const form = document.getElementById('announcement-form')
    const cancelBtn = document.getElementById('cancel-announcement')

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            form.style.display = 'block'
        })
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none'
        })
    }

    loadAnnouncements()

    async function loadAnnouncements() {
        list.innerHTML = '<div class="loader-container"><div class="loader"></div></div>'
        
        // Filter based on role
        let query = supabase.from('announcements').select('*, profiles(full_name)').order('published_at', { ascending: false })
        
        if (profile.role === 'student') {
            query = query.in('audience', ['all', 'students'])
        } else if (profile.role === 'teacher') {
            query = query.in('audience', ['all', 'teachers'])
        }

        const { data: ann, error } = await query

        if (error) {
            list.innerHTML = \`<p style="color: var(--danger);">Error: \${error.message}</p>\`
            return
        }

        if (ann.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 3rem;">No announcements yet.</p>'
        } else {
            list.innerHTML = ann.map(a => \`
                <div class="announcement-card \${a.pinned ? 'pinned' : ''}" style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: var(--shadow); position: relative;">
                    \${a.pinned ? '<span style="position: absolute; top: 1rem; right: 1rem; background: var(--secondary); font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 1rem; font-weight: 700;">PINNED</span>' : ''}
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">\${a.title}</h3>
                    <p style="color: var(--gray); font-size: 0.75rem; margin-bottom: 1.5rem;">Posted by \${a.profiles?.full_name || 'Staff'} • \${new Date(a.published_at).toLocaleDateString()}</p>
                    <div style="line-height: 1.8; color: var(--dark);">\${a.body.replace(/\\n/g, '<br>') || ''}</div>
                </div>
            \`).join('')
        }
    }

    if (isStaff) {
        document.getElementById('new-announcement-form').addEventListener('submit', async (e) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            const newAnn = {
                title: formData.get('title'),
                body: formData.get('body'),
                audience: formData.get('audience'),
                author_id: profile.id
            }

            const { error } = await supabase.from('announcements').insert(newAnn)
            if (error) alert(error.message)
            else {
                alert('Announcement posted!')
                form.style.display = 'none'
                loadAnnouncements()
            }
        })
    }
}
