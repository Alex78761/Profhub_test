document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы модальных окон и кнопок
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Показать/скрыть модальные окна
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
        registerModal.style.display = 'none';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
        loginModal.style.display = 'none';
    });

    // Закрыть модальные окна при клике вне их
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Обработка формы регистрации
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('reg-username').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('role').value,
            gender: document.getElementById('gender').value,
            birthDate: document.getElementById('birth-date').value
        };

        try {
            const response = await fetch('/sensomotor-tests/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Регистрация успешна!');
                registerModal.style.display = 'none';
                // Автоматически показываем форму входа
                loginModal.style.display = 'block';
            } else {
                const error = await response.text();
                alert('Ошибка регистрации: ' + error);
            }
        } catch (error) {
            alert('Ошибка при отправке данных: ' + error.message);
        }
    });

    // Обработка формы входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/sensomotor-tests/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                // Сохраняем информацию о пользователе
                localStorage.setItem('user', JSON.stringify(result));
                // Скрываем модальное окно
                loginModal.style.display = 'none';
                // Показываем раздел с тестами
                document.getElementById('test-selection').style.display = 'block';
                // Обновляем UI в зависимости от роли пользователя
                updateUIForRole(result.role);
            } else {
                const error = await response.text();
                alert('Ошибка входа: ' + error);
            }
        } catch (error) {
            alert('Ошибка при отправке данных: ' + error.message);
        }
    });
});

// Функция обновления UI в зависимости от роли пользователя
function updateUIForRole(role) {
    const testSelection = document.getElementById('test-selection');
    if (role === 'EXPERT') {
        // Добавляем дополнительные элементы управления для эксперта
        const expertControls = document.createElement('div');
        expertControls.innerHTML = `
            <h3>Панель эксперта</h3>
            <button onclick="showUserResults()" class="button">Просмотр результатов</button>
            <button onclick="createTestSession()" class="button">Создать сессию тестирования</button>
        `;
        testSelection.insertBefore(expertControls, testSelection.firstChild);
    }
} 