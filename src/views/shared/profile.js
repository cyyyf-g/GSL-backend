import { supabase } from '../../supabase.js'

export async function renderProfile(container, profile) {
    let roleSpecificHtml = '';
    
    try {
        if (profile.role === 'admin') {
            const [students, teachers, classes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
                supabase.from('classes').select('id', { count: 'exact', head: true }).eq('is_active', true)
            ]);
            
            roleSpecificHtml = `
                <div class="stat-card" style="margin-top: 2rem; padding: 2rem; border-left: 4px solid var(--primary); animation: slideIn 0.5s ease-out 0.2s backwards;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">📊</span> System Overview
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem;">
                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; transition: transform 0.2s;">
                            <h4 style="color: var(--gray); margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Total Students</h4>
                            <span style="font-size: 2.5rem; font-weight: bold; color: var(--dark);">${students.count || 0}</span>
                        </div>
                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; transition: transform 0.2s;">
                            <h4 style="color: var(--gray); margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Total Teachers</h4>
                            <span style="font-size: 2.5rem; font-weight: bold; color: var(--dark);">${teachers.count || 0}</span>
                        </div>
                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; transition: transform 0.2s;">
                            <h4 style="color: var(--gray); margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Active Classes</h4>
                            <span style="font-size: 2.5rem; font-weight: bold; color: var(--dark);">${classes.count || 0}</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (profile.role === 'teacher') {
            const { data: myClasses } = await supabase
                .from('classes')
                .select('name, schedule, level_id(name)')
                .eq('teacher_id', profile.id)
                .eq('is_active', true);
                
            let classesList = '<p style="color: var(--gray); background: #f8fafc; padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px dashed #cbd5e1;">No active classes assigned yet.</p>';
            if (myClasses && myClasses.length > 0) {
                classesList = `<ul style="list-style: none; padding: 0; display: grid; gap: 1rem;">
                    ${myClasses.map(c => `
                        <li style="background: white; padding: 1.25rem; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div>
                                <strong style="font-size: 1.1rem; color: var(--dark); display: block; margin-bottom: 0.25rem;">${c.name}</strong>
                                <span style="font-size: 0.85rem; color: var(--gray);">${c.level_id?.name || 'General'}</span>
                            </div>
                            <span style="font-size: 0.85rem; color: var(--secondary); background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.4rem 0.8rem; border-radius: 2rem; font-weight: 500;">
                                ${c.schedule?.days?.join(', ') || 'TBD'} | ${c.schedule?.time || 'TBD'}
                            </span>
                        </li>
                    `).join('')}
                </ul>`;
            }
            
            roleSpecificHtml = `
                <div class="stat-card" style="margin-top: 2rem; padding: 2rem; border-left: 4px solid var(--accent); animation: slideIn 0.5s ease-out 0.2s backwards;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--accent); display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">📅</span> My Teaching Schedule
                    </h3>
                    ${classesList}
                </div>
            `;
        } else if (profile.role === 'student') {
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('status, classes(name, start_date)')
                .eq('student_id', profile.id);
                
            let enrollmentList = '<p style="color: var(--gray); background: #f8fafc; padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px dashed #cbd5e1;">Not enrolled in any classes yet.</p>';
            if (enrollments && enrollments.length > 0) {
                enrollmentList = `<div style="display: grid; gap: 1rem;">
                    ${enrollments.map(e => `
                        <div style="background: white; padding: 1.25rem; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div>
                                <strong style="display: block; margin-bottom: 0.25rem; font-size: 1.1rem; color: var(--dark);">${e.classes?.name || 'Unknown Class'}</strong>
                                <span style="font-size: 0.85rem; color: var(--gray);">Started: ${e.classes?.start_date ? new Date(e.classes.start_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <span class="badge" style="background: ${e.status === 'active' ? '#10b981' : (e.status === 'completed' ? '#3b82f6' : 'var(--gray)')}; color: white; padding: 0.4rem 1rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${e.status}
                            </span>
                        </div>
                    `).join('')}
                </div>`;
            }
            
            const statusColor = profile.status === 'active' ? '#10b981' : (profile.status === 'pending' ? '#f59e0b' : '#ef4444');
            
            roleSpecificHtml = `
                <div class="stat-card" style="margin-top: 2rem; padding: 2rem; border-left: 4px solid #10b981; animation: slideIn 0.5s ease-out 0.2s backwards;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                        <h3 style="color: #10b981; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.2rem;">🎓</span> My Enrollments
                        </h3>
                        <div style="display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; padding: 0.5rem 1rem; border-radius: 2rem; border: 1px solid #e2e8f0;">
                            <span style="font-size: 0.85rem; color: var(--gray);">Account Status:</span>
                            <span class="badge" style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                                ${profile.status || 'pending'}
                            </span>
                        </div>
                    </div>
                    ${enrollmentList}
                </div>
            `;
        }
    } catch (e) {
        console.error("Error fetching role specific data", e);
    }

    container.innerHTML = `
        <div class="profile-container" style="max-width: 800px; margin: 0 auto; animation: fadeIn 0.5s ease-out;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>👤 My Profile</h1>
                <span class="badge" style="background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 2rem; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">
                    ${profile.role}
                </span>
            </div>

            <div class="stat-card" style="padding: 2.5rem; border-left: 4px solid var(--secondary);">
                <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap;">
                    <div style="position: relative;">
                        <img id="profile-avatar" src="${profile.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.full_name) + '&background=1B3A6B&color=fff&size=128'}" 
                             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--white); box-shadow: var(--shadow-lg); transition: transform 0.3s ease;">
                        <label for="avatar-upload" style="position: absolute; bottom: 0; right: 0; background: var(--secondary); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid var(--white); transition: all 0.2s ease; box-shadow: var(--shadow-md);">
                            📸
                        </label>
                        <input type="file" id="avatar-upload" style="display: none;" accept="image/*">
                    </div>
                    <div>
                        <h2 style="font-size: 2rem; margin-bottom: 0.25rem; color: var(--dark); font-weight: 700;">${profile.full_name}</h2>
                        <p style="color: var(--gray); font-style: italic; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.1rem;">🗓️</span> Member since ${new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                <form id="profile-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="profile-name" class="form-input" value="${profile.full_name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="profile-email" class="form-input" value="${profile.email}" disabled style="background: #f1f5f9; cursor: not-allowed; border-color: #cbd5e1; color: #64748b;">
                        <small style="color: var(--gray); font-size: 0.75rem; display: block; margin-top: 0.25rem;">Email address cannot be changed.</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" id="profile-phone" class="form-input" value="${profile.phone || ''}" placeholder="+213 ...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <input type="text" class="form-input" value="${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}" disabled style="background: #f1f5f9; cursor: not-allowed; border-color: #cbd5e1; color: #64748b; font-weight: 500;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gender</label>
                        <select id="profile-gender" class="form-input">
                            <option value="">Select Gender</option>
                            <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Male</option>
                            <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Female</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" id="profile-dob" class="form-input" value="${profile.date_of_birth || ''}">
                    </div>
                    
                    <div style="grid-column: 1 / -1; margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; display: flex; justify-content: flex-end;">
                        <button type="submit" id="save-profile" class="btn btn-primary" style="width: auto; padding: 0.75rem 2.5rem; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 6px rgba(27, 58, 107, 0.2); transition: all 0.2s ease;">
                            💾 Save Changes
                        </button>
                    </div>
                </form>
            </div>
            
            ${roleSpecificHtml}
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
        const originalText = saveBtn.innerHTML
        saveBtn.innerHTML = '⏳ Saving...'

        const fullName = document.getElementById('profile-name').value
        const phone = document.getElementById('profile-phone').value
        const gender = document.getElementById('profile-gender').value || null
        const dob = document.getElementById('profile-dob').value || null

        const { error } = await supabase
            .from('profiles')
            .update({ 
                full_name: fullName,
                phone: phone,
                gender: gender,
                date_of_birth: dob
            })
            .eq('id', profile.id)

        if (error) {
            alert('Error updating profile: ' + error.message)
        } else {
            // Optional: nice toast notification instead of alert for better UX
            const btnBg = saveBtn.style.background;
            saveBtn.style.background = '#10b981';
            saveBtn.innerHTML = '✅ Saved!';
            
            // Update the greeting in sidebar if it exists
            const sidebarHeader = document.querySelector('.sidebar-header p')
            if (sidebarHeader) {
                sidebarHeader.textContent = `Welcome, ${fullName}`
            }
            
            setTimeout(() => {
                saveBtn.style.background = btnBg;
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }, 2000);
            return; // Return early so we don't reset button below immediately
        }
        
        saveBtn.disabled = false
        saveBtn.innerHTML = originalText
    })
}
