document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const testButtons = document.querySelectorAll('.test-button');
    const testArea = document.getElementById('testArea');
    const resultsContainer = document.getElementById('resultsContainer');
    const testSelection = document.getElementById('testSelection');
    
    // Проверяем, существуют ли элементы
    if (!testArea || !resultsContainer || !testSelection) {
        console.error('Не удалось найти необходимые элементы на странице');
        return; // Прерываем выполнение, если элементы не найдены
    }

    let currentTest = null;
    let startTime = null;
    let testResults = [];
    const testDuration = 30000; // 30 секунд на тест
    let stimulusInterval = null;

    // Скрываем области теста и результатов при загрузке
    testArea.style.display = 'none';
    resultsContainer.style.display = 'none';

    // Обработчики для кнопок тестов
    testButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Кнопка теста нажата:', this.dataset.testType);
            const testType = this.dataset.testType;
            startTest(testType);
        });
    });

    function startTest(testType) {
        console.log('Начинаем тест:', testType);
        currentTest = testType;
        testResults = [];
        testSelection.style.display = 'none';
        testArea.style.display = 'block';
        resultsContainer.style.display = 'none';

        // Настраиваем тестовую область в зависимости от типа теста
        setupTestArea(testType);

        // Показываем обратный отсчет
        showCountdown(3, () => {
            startTime = Date.now();
            if (testType === 'audio') {
                startAudioTest();
            } else if (testType === 'visual') {
                startVisualTest();
            } else if (testType === 'choice') {
                startChoiceTest();
            }

            // Устанавливаем таймер окончания теста
            setTimeout(() => {
                endTest();
            }, testDuration);
        });
    }

    function setupTestArea(testType) {
        testArea.innerHTML = '';
        
        if (testType === 'visual') {
            testArea.innerHTML = `
                <div id="stimulus" class="stimulus" style="display: none;"></div>
                <div id="instructions">Нажмите на появляющийся круг как можно быстрее</div>
            `;
        } else if (testType === 'audio') {
            testArea.innerHTML = `
                <div id="instructions">Нажмите пробел, когда услышите звуковой сигнал</div>
                <button id="audioButton" style="display: none;">Реакция</button>
            `;
        } else if (testType === 'choice') {
            testArea.innerHTML = `
                <div id="stimulus" class="stimulus" style="display: none;"></div>
                <div id="instructions">Нажмите стрелку влево для красного круга, вправо для зеленого</div>
            `;
        }
    }

    function showCountdown(seconds, callback) {
        const countdownDiv = document.createElement('div');
        countdownDiv.id = 'countdown';
        countdownDiv.className = 'countdown';
        testArea.appendChild(countdownDiv);

        const countdownInterval = setInterval(() => {
            if (seconds > 0) {
                countdownDiv.textContent = seconds;
                seconds--;
            } else {
                clearInterval(countdownInterval);
                countdownDiv.remove();
                callback();
            }
        }, 1000);
    }

    function startVisualTest() {
        const stimulus = document.getElementById('stimulus');
        let lastStimulusTime = 0;

        function showStimulus() {
            if (Date.now() - startTime >= testDuration) return;

            stimulus.style.display = 'block';
            stimulus.style.backgroundColor = 'blue';
            stimulus.style.left = Math.random() * (testArea.offsetWidth - 50) + 'px';
            stimulus.style.top = Math.random() * (testArea.offsetHeight - 50) + 'px';
            lastStimulusTime = Date.now();

            stimulus.onclick = () => {
                const reactionTime = Date.now() - lastStimulusTime;
                testResults.push({
                    reactionTime: reactionTime,
                    accurate: true
                });
                stimulus.style.display = 'none';
                setTimeout(showStimulus, Math.random() * 1000 + 500);
            };
        }

        showStimulus();
    }

    function startAudioTest() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const button = document.getElementById('audioButton');
        let lastBeepTime = 0;

        function playBeep() {
            if (Date.now() - startTime >= testDuration) return;

            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.value = 440;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            lastBeepTime = Date.now();

            button.style.display = 'block';
            button.disabled = false;
        }

        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' && !button.disabled && button.style.display !== 'none') {
                const reactionTime = Date.now() - lastBeepTime;
                testResults.push({
                    reactionTime: reactionTime,
                    accurate: true
                });
                button.style.display = 'none';
                setTimeout(playBeep, Math.random() * 2000 + 1000);
            }
        });

        setTimeout(playBeep, 1000);
    }

    function startChoiceTest() {
        const stimulus = document.getElementById('stimulus');
        let lastStimulusTime = 0;
        let currentColor = null;

        function showStimulus() {
            if (Date.now() - startTime >= testDuration) return;

            stimulus.style.display = 'block';
            currentColor = Math.random() < 0.5 ? 'red' : 'green';
            stimulus.style.backgroundColor = currentColor;
            stimulus.style.left = Math.random() * (testArea.offsetWidth - 50) + 'px';
            stimulus.style.top = Math.random() * (testArea.offsetHeight - 50) + 'px';
            lastStimulusTime = Date.now();
        }

        document.addEventListener('keydown', function(event) {
            if (stimulus.style.display === 'none') return;

            const isCorrect = (currentColor === 'red' && event.code === 'ArrowLeft') ||
                            (currentColor === 'green' && event.code === 'ArrowRight');

            if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                const reactionTime = Date.now() - lastStimulusTime;
                testResults.push({
                    reactionTime: reactionTime,
                    accurate: isCorrect
                });
                stimulus.style.display = 'none';
                setTimeout(showStimulus, Math.random() * 1000 + 500);
            }
        });

        showStimulus();
    }

    function endTest() {
        if (stimulusInterval) {
            clearInterval(stimulusInterval);
        }

        // Вычисляем средние показатели
        const averageReactionTime = testResults.reduce((sum, result) => sum + result.reactionTime, 0) / testResults.length;
        const accuracy = testResults.filter(result => result.accurate).length / testResults.length * 100;

        // Отправляем результаты на сервер
        fetch('/sensomotor-tests/api/test-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                testType: currentTest,
                averageReactionTime: averageReactionTime,
                averageAccuracy: accuracy
            })
        })
        .then(response => response.json())
        .then(data => {
            showResults(averageReactionTime, accuracy);
        })
        .catch(error => {
            console.error('Error saving results:', error);
            showResults(averageReactionTime, accuracy);
        });
    }

    function showResults(averageReactionTime, accuracy) {
        testArea.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h2>Результаты теста</h2>
            <p>Среднее время реакции: ${Math.round(averageReactionTime)} мс</p>
            <p>Точность: ${Math.round(accuracy)}%</p>
            <button onclick="location.reload()">Вернуться к выбору тестов</button>
        `;
    }
}); 