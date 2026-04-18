import { supabase } from '../../supabase.js'

export async function renderProfile(container, profile) {
    container.innerHTML = `
        <div class="profile-container" style="max-width: 800px; margin: 0 auto; animation: fadeIn 0.5s ease-out;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>👤 My Profile</h1>
                <span class="badge" style="background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 2rem; font-weight: bold; text-transform: uppercase; font-size: 0.8rem;">
                    ${profile.role}
                </span>
            </div>

            <div class="stat-card" style="padding: 2.5rem; border-left: 4px solid var(--secondary);">
                <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap;">
                    <div style="position: relative;">
                        <img id="profile-avatar" src="${profile.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.full_name) + '&background=1B3A6B&color=fff&size=128'}" 
                             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--white); box-shadow: var(--shadow-lg);">
                        <label for="avatar-upload" style="position: absolute; bottom: 0; right: 0; background: var(--secondary); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid var(--white); transition: var(--transition);">
                            📸
                        </label>
                        <input type="file" id="avatar-upload" style="display: none;" accept="image/*">
                    </div>
                    <div>
                        <h2 style="font-size: 1.8rem; margin-bottom: 0.25rem;">${profile.full_name}</h2>
                        <p style="color: var(--gray); font-style: italic;">Member since ${new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <form id="profile-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="profile-name" class="form-input" value="${profile.full_name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="profile-email" class="form-input" value="${profile.email}" disabled style="background: #f1f5f9; cursor: not-allowed;">
                        <small style="color: var(--gray); font-size: 0.75rem;">Email address cannot be changed.</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" id="profile-phone" class="form-input" value="${profile.phone || ''}" placeholder="+213 ...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <input type="text" class="form-input" value="${profile.role}" disabled style="background: #f1f5f9; cursor: not-allowed;">
                    </div>
                    
                    <div style="grid-column: 1 / -1; margin-top: 1rem;">
                        <button type="submit" id="save-profile" class="btn btn-primary" style="width: auto; padding: 0.75rem 2.5rem;">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `

    // Avatar Upload Logic
    const avatarInput = document.getElementById('avatar-upload')
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const label = e.target.previousElementSibling
        label.innerHTML = '⏳'
        
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id)

            if (updateError) throw updateError

            document.getElementById('profile-avatar').src = publicUrl
            alert('Profile picture updated successfully!')
        } catch (error) {
            alert('Error: ' + error.message)
        } finally {
            label.innerHTML = '📸'
        }
    })

    // Profile Update Logic
    const profileForm = document.getElementById('profile-form')
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const saveBtn = document.getElementById('save-profile')
        saveBtn.disabled = true
        saveBtn.textContent = 'Saving...'

        const fullName = document.getElementById('profile-name').value
        const phone = document.getElementById('profile-phone').value

        const { error } = await supabase
            .from('profiles')
            .update({ 
                full_name: fullName,
                phone: phone
            })
            .eq('id', profile.id)

        if (error) {
            alert('Error updating profile: ' + error.message)
        } else {
            alert('Profile updated successfully!')
            // Update the greeting in sidebar if it exists
            const sidebarHeader = document.querySelector('.sidebar-header p')
            if (sidebarHeader) {
                sidebarHeader.textContent = `Welcome, ${fullName}`
            }
        }
        
        saveBtn.disabled = false
        saveBtn.textContent = 'Save Changes'
    })
}
