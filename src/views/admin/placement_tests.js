import { supabase } from '../../supabase.js'

export async function renderPlacementTests(container, profile) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>📝 Placement Tests</h1>
            <button class="btn btn-primary" style="width: auto;" id="create-test-btn">Create New Test</button>
        </div>

        <div id="test-builder" style="display: none; background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: var(--shadow-lg); margin-bottom: 2rem;">
            <h2>Test Builder</h2>
            <form id="new-test-form" style="margin-top: 2rem;">
                <div class="form-group">
                    <label>Test Title</label>
                    <input type="text" id="test-title" required placeholder="e.g. German A1-A2 Entry Test">
                </div>
                <div class="form-group">
                    <label>Description (Optional)</label>
                    <textarea id="test-desc" placeholder="Instructions for students..." style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border);"></textarea>
                </div>
                
                <div id="questions-container" style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 2rem;">
                    <h3>Questions</h3>
                    <div id="questions-list" style="margin-top: 1rem; display: grid; gap: 1rem;">
                        <!-- Questions build here -->
                    </div>
                    <button type="button" class="btn btn-secondary" style="width: auto; margin-top: 1rem;" id="add-question-btn">+ Add Question</button>
                </div>

                <div style="margin-top: 3rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Publish Test</button>
                    <button type="button" class="btn btn-secondary" id="cancel-test">Cancel</button>
                </div>
            </form>
        </div>

        <div style="background: white; border-radius: 1rem; box-shadow: var(--shadow); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem;">Test Title</th>
                        <th style="padding: 1rem;">Questions</th>
                        <th style="padding: 1rem;">Created At</th>
                        <th style="padding: 1rem;">Actions</th>
                    </tr>
                </thead>
                <tbody id="tests-table-body">
                    <!-- Tests loaded here -->
                </tbody>
            </table>
        </div>
    `

    const testsList = document.getElementById('tests-table-body')
    const createBtn = document.getElementById('create-test-btn')
    const builder = document.getElementById('test-builder')
    const addQuestionBtn = document.getElementById('add-question-btn')
    const questionsList = document.getElementById('questions-list')
    const cancelBtn = document.getElementById('cancel-test')

    let questions = []

    createBtn.addEventListener('click', () => {
        builder.style.display = 'block'
        questions = []
        renderQuestions()
    })

    cancelBtn.addEventListener('click', () => {
        builder.style.display = 'none'
    })

    addQuestionBtn.addEventListener('click', () => {
        questions.push({
            id: Date.now(),
            type: 'multiple_choice',
            question: '',
            options: ['', '', '', ''],
            correct: '',
            points: 1
        })
        renderQuestions()
    })

    function renderQuestions() {
        if (questions.length === 0) {
            questionsList.innerHTML = '<p style="color: var(--gray);">No questions added yet.</p>'
            return
        }

        questionsList.innerHTML = questions.map((q, qIndex) => `
            <div style="background: var(--light); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border); position: relative;">
                <div style="display: flex; gap: 1rem; align-items: top; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.8rem; font-weight: bold;">Question ${qIndex + 1}</label>
                        <input type="text" class="q-text" data-index="${qIndex}" value="${q.question}" placeholder="e.g. What is the plural of 'Apfel'?" style="margin-top: 0.25rem;">
                    </div>
                    <div style="width: 150px;">
                        <label style="font-size: 0.8rem; font-weight: bold;">Type</label>
                        <select class="q-type" data-index="${qIndex}" style="margin-top: 0.25rem;">
                            <option value="multiple_choice" ${q.type === 'multiple_choice' ? 'selected' : ''}>Multiple Choice</option>
                            <option value="fill" ${q.type === 'fill' ? 'selected' : ''}>Fill in Blank</option>
                        </select>
                    </div>
                </div>

                ${q.type === 'multiple_choice' ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem; padding: 1rem; background: var(--white); border-radius: 0.5rem;">
                    <p style="grid-column: span 2; font-size: 0.75rem; color: var(--gray); margin-bottom: 0.5rem;">Options:</p>
                    ${q.options.map((opt, oIndex) => `
                        <input type="text" class="q-opt" data-q-index="${qIndex}" data-o-index="${oIndex}" value="${opt}" placeholder="Option ${oIndex + 1}">
                    `).join('')}
                </div>
                ` : ''}

                <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: flex-end;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.8rem; font-weight: bold;">Correct Answer</label>
                        <input type="text" class="q-correct" data-index="${qIndex}" value="${q.correct}" placeholder="${q.type === 'multiple_choice' ? 'Must match one option' : 'Correct word or phrase'}" style="margin-top: 0.25rem;">
                    </div>
                    <div style="width: 80px;">
                        <label style="font-size: 0.8rem; font-weight: bold;">Points</label>
                        <input type="number" class="q-points" data-index="${qIndex}" value="${q.points}" style="margin-top: 0.25rem;">
                    </div>
                    <button type="button" class="btn" style="width: auto; color: var(--danger); background: none; border: 1px solid #fee2e2; padding: 0.75rem 1rem;" onclick="removeQuestion(${qIndex})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                </div>
            </div>
        `).join('')

        // Handlers
        document.querySelectorAll('.q-text').forEach(inp => inp.addEventListener('input', e => questions[e.target.dataset.index].question = e.target.value))
        document.querySelectorAll('.q-correct').forEach(inp => inp.addEventListener('input', e => questions[e.target.dataset.index].correct = e.target.value))
        document.querySelectorAll('.q-points').forEach(inp => inp.addEventListener('input', e => questions[e.target.dataset.index].points = parseInt(e.target.value)))
        document.querySelectorAll('.q-type').forEach(sel => sel.addEventListener('change', e => {
            questions[e.target.dataset.index].type = e.target.value
            renderQuestions()
        }))
        document.querySelectorAll('.q-opt').forEach(inp => inp.addEventListener('input', e => {
            questions[e.target.dataset.qIndex].options[e.target.dataset.oIndex] = e.target.value
        }))
    }

    window.removeQuestion = (index) => {
        questions.splice(index, 1)
        renderQuestions()
    }

    loadTests()

    async function loadTests() {
        testsList.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Loading...</td></tr>'
        const { data, error } = await supabase.from('placement_tests').select('*').order('created_at', { ascending: false })

        if (error) {
            testsList.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem;">${error.message}</td></tr>`
            return
        }

        if (data.length === 0) {
            testsList.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No tests created yet.</td></tr>'
        } else {
            testsList.innerHTML = data.map(t => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600;">${t.title}</td>
                    <td style="padding: 1rem;">${t.questions?.length || 0}</td>
                    <td style="padding: 1rem;">${new Date(t.created_at).toLocaleDateString()}</td>
                    <td style="padding: 1rem;">
                        <button style="color: var(--danger); background: none; border: none; cursor: pointer; font-size: 0.8rem;" id="del-test-${t.id}">Delete</button>
                    </td>
                </tr>
            `).join('')
            
            data.forEach(t => {
                document.getElementById(`del-test-${t.id}`).addEventListener('click', async () => {
                    if (confirm('Delete this test?')) {
                        await supabase.from('placement_tests').delete().eq('id', t.id)
                        loadTests()
                    }
                })
            })
        }
    }

    document.getElementById('new-test-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        if (questions.length === 0) return alert('Please add at least one question')

        const test = {
            title: document.getElementById('test-title').value,
            description: document.getElementById('test-desc').value,
            questions: questions,
            created_by: profile.id
        }

        const { error } = await supabase.from('placement_tests').insert(test)
        if (error) alert(error.message)
        else {
            alert('Test published!')
            builder.style.display = 'none'
            loadTests()
        }
    })
}
