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
            } else if (testType === 'audioMath') {
                startAudioMathTest();
            }

            // Устанавливаем таймер окончания теста
            setTimeout(() => {
                endTest();
            }, testDuration);
        });
    }

    function setupTestArea(testType) {
        console.log('Настройка тестовой области для типа:', testType);
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
        } else if (testType === 'audioMath') {
            testArea.innerHTML = `
                <div id="audio-math-container">
                    <div id="audio-status">Слушайте пример...</div>
                    <div id="math-buttons">
                        <button id="even-button" class="response-button">Четное</button>
                        <button id="odd-button" class="response-button">Нечетное</button>
                    </div>
                </div>
                <div id="instructions">
                    <p>Слушайте аудио-пример и определите, является ли сумма чисел четной или нечетной</p>
                    <p>Нажмите соответствующую кнопку как можно быстрее после окончания аудио</p>
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
        const instructions = document.getElementById('instructions');
        let lastStimulusTime = 0;

        function showStimulus() {
            if (Date.now() - startTime >= testDuration) return;

            // Получаем высоту инструкций и задаем отступ, чтобы шарик не появлялся под ними
            const instructionsHeight = instructions.offsetHeight;
            const safeBottomMargin = instructionsHeight + 40; // 40px дополнительного отступа

            stimulus.style.display = 'block';
            stimulus.style.backgroundColor = 'blue';
            stimulus.style.left = Math.random() * (testArea.offsetWidth - 50) + 'px';
            
            // Ограничиваем максимальную позицию по вертикали, чтобы не появляться под инструкциями
            const maxTop = testArea.offsetHeight - safeBottomMargin - 50; // 50px - размер шарика
            stimulus.style.top = Math.random() * maxTop + 'px';
            
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
        const instructions = document.getElementById('instructions');
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

            // Получаем высоту инструкций и задаем отступ, чтобы шарик не появлялся под ними
            const instructionsHeight = instructions.offsetHeight;
            const safeBottomMargin = instructionsHeight + 40; // 40px дополнительного отступа

            stimulus.style.display = 'block';
            // Выбираем случайный цвет из 4 возможных
            currentColor = colors[Math.floor(Math.random() * colors.length)];
            stimulus.style.backgroundColor = currentColor;
            stimulus.style.left = Math.random() * (testArea.offsetWidth - 50) + 'px';
            
            // Ограничиваем максимальную позицию по вертикали, чтобы не появляться под инструкциями
            const maxTop = testArea.offsetHeight - safeBottomMargin - 50; // 50px - размер шарика
            stimulus.style.top = Math.random() * maxTop + 'px';
            
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

    // Добавляем новую функцию для аудио-математического теста
    function startAudioMathTest() {
        // Получаем элементы из DOM
        const audioStatus = document.getElementById('audio-status');
        const evenButton = document.getElementById('even-button');
        const oddButton = document.getElementById('odd-button');
        const mathButtons = document.querySelectorAll('.response-button');
        
        // Скрываем кнопки ответа до завершения воспроизведения примера
        mathButtons.forEach(button => {
            button.style.display = 'none';
        });
        
        // Переменные для хранения данных о текущем примере
        let currentFirstNumber = 0;
        let currentSecondNumber = 0;
        let problemStartTime = 0;
        
        // Функция для генерации и воспроизведения нового аудио-примера
        function generateAudioProblem() {
            // Скрываем кнопки ответа
            mathButtons.forEach(button => {
                button.style.display = 'none';
            });
            
            audioStatus.textContent = 'Слушайте пример...';
            
            // Генерируем два случайных числа от 0 до 9
            currentFirstNumber = Math.floor(Math.random() * 10);
            currentSecondNumber = Math.floor(Math.random() * 10);
            
            // Последовательность аудиофайлов для воспроизведения
            const audioFiles = [
                `audioNum/bot${currentFirstNumber}.mp3`,
                'audioNum/botPlus.mp3',
                `audioNum/bot${currentSecondNumber}.mp3`
            ];
            
            // Счетчик воспроизведенных файлов
            let audioIndex = 0;
            
            // Функция для последовательного воспроизведения аудиофайлов
            function playNextAudio() {
                if (audioIndex < audioFiles.length) {
                    const audio = new Audio(audioFiles[audioIndex]);
                    console.log(`Воспроизведение файла: ${audioFiles[audioIndex]}`);
                    
                    // Когда текущий аудиофайл заканчивается
                    audio.onended = () => {
                        audioIndex++;
                        
                        // Если все аудиофайлы воспроизведены, начинаем отсчет времени
                        if (audioIndex >= audioFiles.length) {
                            problemStartTime = Date.now();
                            audioStatus.textContent = 'Выберите ответ:';
                            
                            // Показываем кнопки ответа
                            mathButtons.forEach(button => {
                                button.style.display = 'inline-block';
                            });
                        } else {
                            // Иначе воспроизводим следующий файл
                            playNextAudio();
                        }
                    };
                    
                    // Обработка ошибок воспроизведения
                    audio.onerror = (error) => {
                        console.error(`Ошибка воспроизведения аудио: ${error.message}`);
                        audioStatus.textContent = 'Ошибка воспроизведения аудио';
                    };
                    
                    audio.play().catch(error => {
                        console.error(`Ошибка воспроизведения аудио: ${error.message}`);
                    });
                }
            }
            
            // Начинаем воспроизведение первого аудиофайла
            playNextAudio();
        }
        
        // Функция для обработки ответа пользователя
        function handleMathAnswer(isEven) {
            if (problemStartTime === 0) return; // Если время начала еще не установлено
            
            const reactionTime = Date.now() - problemStartTime;
            const sum = currentFirstNumber + currentSecondNumber;
            const correctAnswer = sum % 2 === 0; // Проверяем, является ли сумма четной
            const isCorrect = (isEven === correctAnswer);
            
            console.log(`Ответ: ${isEven ? 'Четное' : 'Нечетное'}, правильный ответ: ${correctAnswer ? 'Четное' : 'Нечетное'}`);
            
            testResults.push({
                reactionTime: reactionTime,
                accurate: isCorrect,
                firstNumber: currentFirstNumber,
                secondNumber: currentSecondNumber,
                sum: sum
            });
            
            // Сбрасываем время начала для следующего примера
            problemStartTime = 0;
            
            // Генерируем новый пример через небольшую задержку
            setTimeout(generateAudioProblem, 1000);
        }
        
        // Добавляем обработчики событий для кнопок
        evenButton.addEventListener('click', () => handleMathAnswer(true));
        oddButton.addEventListener('click', () => handleMathAnswer(false));
        
        // Запускаем первый пример
        generateAudioProblem();
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

    // Функция для воспроизведения с помощью AudioContext
    function playWithAudioContext(url) {
        return new Promise((resolve, reject) => {
            if (!audioContext) {
                reject(new Error('AudioContext не доступен'));
                return;
            }
            
            console.log('Загрузка звука через fetch:', url);
            
            // Загружаем аудиофайл через fetch
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ошибка HTTP: ${response.status}`);
                    }
                    console.log('Файл получен, декодируем аудио');
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    console.log('Аудио декодировано, начинаем воспроизведение');
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    
                    source.onended = () => {
                        console.log('Воспроизведение завершено');
                        resolve();
                    };
                    
                    // Начинаем воспроизведение
                    source.start(0);
                    
                    // На случай, если onended не сработает
                    setTimeout(() => {
                        resolve();
                    }, audioBuffer.duration * 1000 + 500);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке/декодировании аудио:', error);
                    
                    // Выводим информацию для отладки только в консоль
                    console.log('URL, вызвавший ошибку:', url);
                    
                    // Проверяем доступность файла другим способом
                    fetch(url, { method: 'HEAD' })
                        .then(response => {
                            console.log('HEAD запрос:', url, 'статус:', response.status);
                        })
                        .catch(e => console.error('HEAD запрос не удался:', e));
                    
                    // НЕ отображаем ошибку в интерфейсе
                    reject(error);
                });
        });
    }
}); 