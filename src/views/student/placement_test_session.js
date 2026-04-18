import { supabase } from '../../supabase.js'

export async function renderTestSession(container, profile, test) {
    const questions = test.questions || []
    let currentQuestionIndex = 0
    const userAnswers = {}

    const renderQuestion = () => {
        const q = questions[currentQuestionIndex]
        container.innerHTML = `
            <div class="test-session" style="max-width: 700px; margin: 0 auto; animation: fadeIn 0.4s ease-out;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="color: var(--primary);">${test.title}</h2>
                        <p style="color: var(--gray);">Frage ${currentQuestionIndex + 1} von ${questions.length}</p>
                    </div>
                    <div style="background: var(--light); padding: 0.5rem 1rem; border-radius: 1rem; border: 1px solid var(--border);">
                        <strong>Punkte: ${q.points || 0}</strong>
                    </div>
                </div>

                <div class="progress-bar" style="width: 100%; height: 8px; background: var(--border); border-radius: 4px; margin-bottom: 3rem; overflow: hidden;">
                    <div style="width: ${((currentQuestionIndex + 1) / questions.length) * 100}%; height: 100%; background: var(--secondary); transition: width 0.3s ease;"></div>
                </div>

                <div class="stat-card" style="padding: 2.5rem; border-left-color: var(--primary);">
                    <h3 style="font-size: 1.4rem; margin-bottom: 2rem;">${q.question}</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${q.options.map((opt, i) => `
                            <label class="option-card" style="display: flex; align-items: center; padding: 1.25rem; border: 2px solid ${userAnswers[q.id] === opt ? 'var(--primary)' : 'var(--border)'}; border-radius: 1rem; cursor: pointer; transition: var(--transition); background: ${userAnswers[q.id] === opt ? 'rgba(27, 58, 107, 0.05)' : 'white'};">
                                <input type="radio" name="question-${q.id}" value="${opt}" ${userAnswers[q.id] === opt ? 'checked' : ''} style="display: none;">
                                <div style="width: 24px; height: 24px; border: 2px solid ${userAnswers[q.id] === opt ? 'var(--primary)' : 'var(--border)'}; border-radius: 50%; margin-right: 1.5rem; display: flex; align-items: center; justify-content: center;">
                                    ${userAnswers[q.id] === opt ? '<div style="width: 12px; height: 12px; background: var(--primary); border-radius: 50%;"></div>' : ''}
                                </div>
                                <span style="font-size: 1.1rem; font-weight: 500;">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 3rem;">
                    <button id="prev-q" class="btn" style="width: auto; background: var(--white); border: 1px solid var(--border); color: var(--primary); visibility: ${currentQuestionIndex === 0 ? 'hidden' : 'visible'};">
                        Zurück
                    </button>
                    <button id="next-q" class="btn btn-primary" style="width: auto; padding-left: 3rem; padding-right: 3rem;">
                        ${currentQuestionIndex === questions.length - 1 ? 'Test abschließen' : 'Weiter'}
                    </button>
                </div>
            </div>
        `

        // Event Listeners
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                const input = card.querySelector('input')
                userAnswers[q.id] = input.value
                renderQuestion()
            })
        })

        document.getElementById('prev-q').addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--
                renderQuestion()
            }
        })

        document.getElementById('next-q').addEventListener('click', () => {
            if (!userAnswers[q.id]) {
                alert('Bitte wählen Sie eine Antwort aus.')
                return
            }

            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++
                renderQuestion()
            } else {
                finishTest()
            }
        })
    }

    const finishTest = async () => {
        container.innerHTML = '<div class="loader-container"><div class="loader"></div><p style="margin-top: 1rem;">Ergebnisse werden berechnet...</p></div>'
        
        // Calculate score
        let totalPoints = 0
        let earnedPoints = 0
        questions.forEach(q => {
            const pts = Number(q.points) || 0
            totalPoints += pts
            if (userAnswers[q.id] === q.correct) {
                earnedPoints += pts
            }
        })

        const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
        
        // Simple logic for level recommendation
        let recommendedLevel = 'A1'
        if (scorePercentage >= 90) recommendedLevel = 'B2+'
        else if (scorePercentage >= 75) recommendedLevel = 'B2'
        else if (scorePercentage >= 60) recommendedLevel = 'B1'
        else if (scorePercentage >= 45) recommendedLevel = 'A2'
        else recommendedLevel = 'A1'

        const { error } = await supabase.from('placement_test_results').insert({
            test_id: test.id,
            student_id: profile.id,
            answers: userAnswers,
            score: scorePercentage,
            recommended_level: recommendedLevel
        })

        if (error) {
            alert('Fehler beim Speichern der Ergebnisse: ' + error.message)
            return
        }

        // Show Result
        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; text-align: center; animation: slideUp 0.6s ease-out;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="font-size: 2rem; color: var(--primary); margin-bottom: 1rem;">Test abgeschlossen!</h2>
                <p style="color: var(--gray); font-size: 1.1rem; margin-bottom: 3rem;">Vielen Dank für die Teilnahme am Einstufungstest.</p>
                
                <div class="stat-card" style="padding: 3rem; border-left: none; border-bottom: 4px solid var(--secondary);">
                    <p style="text-transform: uppercase; font-weight: bold; color: var(--gray); font-size: 0.9rem; margin-bottom: 0.5rem;">Dein Ergebnis</p>
                    <h1 style="font-size: 4rem; color: var(--primary); margin-bottom: 1.5rem;">${scorePercentage}%</h1>
                    
                    <div style="background: var(--light); padding: 1.5rem; border-radius: 1rem; display: inline-block;">
                        <p style="margin-bottom: 0.5rem; color: var(--gray);">Empfohlenes Niveau:</p>
                        <h2 style="color: var(--secondary); font-size: 2rem;">${recommendedLevel}</h2>
                    </div>
                </div>

                <button class="btn btn-primary" style="margin-top: 3rem; width: auto; padding: 1rem 3rem;" onclick="location.reload()">
                    Zurück zum Dashboard
                </button>
            </div>
        `
    }

    renderQuestion()
}
