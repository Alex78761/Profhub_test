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
    let audioKeyHandler = null; // Добавляем переменную для хранения обработчика клавиш

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
            } else if (testType === 'math') {
                startMathTest();
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
            `;
        } else if (testType === 'choice') {
            testArea.innerHTML = `
                <div id="stimulus" class="stimulus" style="display: none;"></div>
                <div id="instructions">
                    <p>Нажмите соответствующую стрелку для каждого цвета:</p>
                    <ul>
                        <li><span class="color-sample" style="background-color: red;"></span> Красный - стрелка влево</li>
                        <li><span class="color-sample" style="background-color: green;"></span> Зеленый - стрелка вправо</li>
                        <li><span class="color-sample" style="background-color: blue;"></span> Синий - стрелка вверх</li>
                        <li><span class="color-sample" style="background-color: yellow;"></span> Желтый - стрелка вниз</li>
                    </ul>
                </div>
            `;
        } else if (testType === 'math') {
            testArea.innerHTML = `
                <div id="math-container">
                    <div id="math-problem" style="display: none;"></div>
                    <div id="math-buttons">
                        <button id="even-button">Четное</button>
                        <button id="odd-button">Нечетное</button>
                    </div>
                </div>
                <div id="instructions">
                    <p>Определите, является ли сумма чисел четной или нечетной</p>
                    <p>Нажмите соответствующую кнопку как можно быстрее</p>
                </div>
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
        let lastBeepTime = 0;
        let canRespond = false;
        
        // Функция для воспроизведения звукового сигнала
        function playBeep() {
            if (Date.now() - startTime >= testDuration) return;

            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.value = 440;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            lastBeepTime = Date.now();
            canRespond = true;
        }

        // Обработчик нажатия клавиши пробел
        audioKeyHandler = function(event) {
            if (event.code === 'Space' && canRespond) {
                const reactionTime = Date.now() - lastBeepTime;
                testResults.push({
                    reactionTime: reactionTime,
                    accurate: true
                });
                
                canRespond = false;
                setTimeout(playBeep, Math.random() * 2000 + 1000);
            }
        };

        document.addEventListener('keydown', audioKeyHandler);
        
        // Запускаем первый сигнал через секунду
        setTimeout(playBeep, 1000);
    }

    function startChoiceTest() {
        const stimulus = document.getElementById('stimulus');
        let lastStimulusTime = 0;
        let currentColor = null;
        const colors = ['red', 'green', 'blue', 'yellow'];
        const colorKeys = {
            'red': 'ArrowLeft',
            'green': 'ArrowRight',
            'blue': 'ArrowUp',
            'yellow': 'ArrowDown'
        };

        function showStimulus() {
            if (Date.now() - startTime >= testDuration) return;

            stimulus.style.display = 'block';
            // Выбираем случайный цвет из 4 возможных
            currentColor = colors[Math.floor(Math.random() * colors.length)];
            stimulus.style.backgroundColor = currentColor;
            stimulus.style.left = Math.random() * (testArea.offsetWidth - 50) + 'px';
            stimulus.style.top = Math.random() * (testArea.offsetHeight - 50) + 'px';
            lastStimulusTime = Date.now();
        }

        const choiceKeyHandler = function(event) {
            if (stimulus.style.display === 'none') return;

            // Проверяем, соответствует ли нажатая клавиша текущему цвету
            const isCorrect = event.code === colorKeys[currentColor];

            if (Object.values(colorKeys).includes(event.code)) {
                const reactionTime = Date.now() - lastStimulusTime;
                testResults.push({
                    reactionTime: reactionTime,
                    accurate: isCorrect
                });
                stimulus.style.display = 'none';
                setTimeout(showStimulus, Math.random() * 1000 + 500);
            }
        };

        document.addEventListener('keydown', choiceKeyHandler);
        
        // Сохраняем обработчик для последующего удаления
        window.choiceKeyHandler = choiceKeyHandler;

        showStimulus();
    }

    function startMathTest() {
        const mathProblem = document.getElementById('math-problem');
        const evenButton = document.getElementById('even-button');
        const oddButton = document.getElementById('odd-button');
        let lastProblemTime = 0;
        let currentSum = 0;
        let isCurrentSumEven = false;
        
        function showMathProblem() {
            if (Date.now() - startTime >= testDuration) return;
            
            // Генерируем два случайных числа от 0 до 10
            const num1 = Math.floor(Math.random() * 11);
            const num2 = Math.floor(Math.random() * 11);
            currentSum = num1 + num2;
            isCurrentSumEven = currentSum % 2 === 0;
            
            mathProblem.textContent = `${num1} + ${num2} = ?`;
            mathProblem.style.display = 'block';
            lastProblemTime = Date.now();
        }
        
        function handleAnswer(isEven) {
            if (mathProblem.style.display === 'none') return;
            
            const reactionTime = Date.now() - lastProblemTime;
            const isCorrect = (isEven && isCurrentSumEven) || (!isEven && !isCurrentSumEven);
            
            testResults.push({
                reactionTime: reactionTime,
                accurate: isCorrect
            });
            
            mathProblem.style.display = 'none';
            setTimeout(showMathProblem, Math.random() * 1000 + 500);
        }
        
        evenButton.addEventListener('click', () => handleAnswer(true));
        oddButton.addEventListener('click', () => handleAnswer(false));
        
        // Сохраняем обработчики для последующего удаления
        window.mathHandlers = {
            evenHandler: () => handleAnswer(true),
            oddHandler: () => handleAnswer(false)
        };
        
        showMathProblem();
    }

    function endTest() {
        if (stimulusInterval) {
            clearInterval(stimulusInterval);
        }
        
        // Удаляем обработчик клавиш для аудио-теста
        if (audioKeyHandler) {
            document.removeEventListener('keydown', audioKeyHandler);
            audioKeyHandler = null;
        }
        
        // Удаляем обработчик клавиш для теста на реакцию выбора
        if (window.choiceKeyHandler) {
            document.removeEventListener('keydown', window.choiceKeyHandler);
            window.choiceKeyHandler = null;
        }
        
        // Удаляем обработчики для теста на сложение в уме
        if (window.mathHandlers) {
            const evenButton = document.getElementById('even-button');
            const oddButton = document.getElementById('odd-button');
            if (evenButton) evenButton.removeEventListener('click', window.mathHandlers.evenHandler);
            if (oddButton) oddButton.removeEventListener('click', window.mathHandlers.oddHandler);
            window.mathHandlers = null;
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