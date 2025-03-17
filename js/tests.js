class SensomotorTest {
    constructor(type, trials = 5) {
        this.type = type;
        this.trials = trials;
        this.currentTrial = 0;
        this.results = [];
        this.isRunning = false;
        this.startTime = null;
        this.stimulus = document.getElementById('stimulus');
        this.progressBar = document.getElementById('progress-bar-fill');
    }

    async start() {
        this.isRunning = true;
        this.currentTrial = 0;
        this.results = [];
        await this.runTrial();
    }

    async runTrial() {
        if (this.currentTrial >= this.trials || !this.isRunning) {
            this.finish();
            return;
        }

        // Случайная задержка от 1 до 3 секунд
        const delay = Math.random() * 2000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        switch (this.type) {
            case 'SIMPLE_LIGHT':
                this.showLightStimulus();
                break;
            case 'SIMPLE_SOUND':
                this.playSoundStimulus();
                break;
            case 'COMPLEX_COLOR':
                this.showColorStimulus();
                break;
            case 'COMPLEX_SOUND_MATH':
                this.playSoundMathStimulus();
                break;
            case 'COMPLEX_VISUAL_MATH':
                this.showVisualMathStimulus();
                break;
        }

        this.startTime = Date.now();
    }

    showLightStimulus() {
        this.stimulus.style.backgroundColor = 'white';
        this.stimulus.style.display = 'block';
    }

    playSoundStimulus() {
        const audio = new Audio('beep.mp3');
        audio.play();
    }

    showColorStimulus() {
        const colors = ['red', 'green', 'blue'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.stimulus.style.backgroundColor = randomColor;
        this.stimulus.style.display = 'block';
    }

    playSoundMathStimulus() {
        const number = Math.floor(Math.random() * 100);
        const audio = new Audio(`numbers/${number}.mp3`);
        audio.play();
        this.currentNumber = number;
    }

    showVisualMathStimulus() {
        const number = Math.floor(Math.random() * 100);
        this.stimulus.textContent = number;
        this.stimulus.style.display = 'block';
        this.currentNumber = number;
    }

    handleResponse(response = null) {
        if (!this.startTime || !this.isRunning) return;

        const reactionTime = Date.now() - this.startTime;
        let accuracy = 1;

        if (this.type.includes('MATH')) {
            const isEven = this.currentNumber % 2 === 0;
            accuracy = (response === isEven) ? 1 : 0;
        }

        this.results.push({
            trial: this.currentTrial + 1,
            reactionTime,
            accuracy
        });

        this.stimulus.style.display = 'none';
        this.currentTrial++;
        this.updateProgress();

        setTimeout(() => this.runTrial(), 1000);
    }

    updateProgress() {
        const progress = (this.currentTrial / this.trials) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    finish() {
        this.isRunning = false;
        const averageTime = this.results.reduce((sum, r) => sum + r.reactionTime, 0) / this.results.length;
        const averageAccuracy = this.results.reduce((sum, r) => sum + r.accuracy, 0) / this.results.length;

        this.saveResults({
            testType: this.type,
            averageReactionTime: averageTime,
            averageAccuracy: averageAccuracy,
            trials: this.results
        });
    }

    async saveResults(results) {
        try {
            const response = await fetch('/api/test-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(results)
            });

            if (!response.ok) {
                throw new Error('Failed to save results');
            }

            this.showResults(results);
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Failed to save test results');
        }
    }

    showResults(results) {
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = `
            <h2>Результаты теста</h2>
            <p>Среднее время реакции: ${Math.round(results.averageReactionTime)}мс</p>
            <p>Средняя точность: ${(results.averageAccuracy * 100).toFixed(1)}%</p>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Попытка</th>
                        <th>Время реакции (мс)</th>
                        <th>Точность</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.trials.map(trial => `
                        <tr>
                            <td>${trial.trial}</td>
                            <td>${Math.round(trial.reactionTime)}</td>
                            <td>${(trial.accuracy * 100)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

// Инициализация тестов
document.addEventListener('DOMContentLoaded', () => {
    const testButtons = {
        'simple-light': () => new SensomotorTest('SIMPLE_LIGHT'),
        'simple-sound': () => new SensomotorTest('SIMPLE_SOUND'),
        'complex-color': () => new SensomotorTest('COMPLEX_COLOR'),
        'complex-sound-math': () => new SensomotorTest('COMPLEX_SOUND_MATH'),
        'complex-visual-math': () => new SensomotorTest('COMPLEX_VISUAL_MATH')
    };

    Object.entries(testButtons).forEach(([id, createTest]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                const test = createTest();
                test.start();
            });
        }
    });

    // Обработчики для сложных тестов
    const stimulus = document.getElementById('stimulus');
    if (stimulus) {
        stimulus.addEventListener('click', () => {
            if (window.currentTest) {
                window.currentTest.handleResponse();
            }
        });
    }

    // Обработчики для математических тестов
    ['even', 'odd'].forEach(response => {
        const button = document.getElementById(response);
        if (button) {
            button.addEventListener('click', () => {
                if (window.currentTest) {
                    window.currentTest.handleResponse(response === 'even');
                }
            });
        }
    });
}); 