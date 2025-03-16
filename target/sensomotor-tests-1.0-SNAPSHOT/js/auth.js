document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы модальных окон и кнопок
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginButton');
    const registerBtn = document.getElementById('registerButton');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Проверяем, существуют ли элементы
    if (!loginModal || !registerModal || !loginBtn || !registerBtn || !loginForm || !registerForm) {
        console.error('Не удалось найти необходимые элементы для авторизации');
        return;
    }

    // Показываем модальное окно входа
    loginBtn.addEventListener('click', function() {
        console.log('Кнопка входа нажата');
        loginModal.style.display = 'block';
    });

    // Показываем модальное окно регистрации
    registerBtn.addEventListener('click', function() {
        console.log('Кнопка регистрации нажата');
        registerModal.style.display = 'block';
    });

    // Закрываем модальные окна при клике вне их области
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Обработка отправки формы входа
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = {
            username: loginForm.querySelector('input[name="username"]').value,
            password: loginForm.querySelector('input[name="password"]').value
        };

        console.log('Отправка данных для входа:', formData);

        fetch('/sensomotor-tests/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка входа');
            }
            return response.json();
        })
        .then(data => {
            loginModal.style.display = 'none';
            updateUIForRole(data.role);
            alert('Успешный вход!');
        })
        .catch(error => {
            alert('Ошибка: ' + error.message);
        });
    });

    // Обработка отправки формы регистрации
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = {
            username: registerForm.querySelector('input[name="username"]').value,
            password: registerForm.querySelector('input[name="password"]').value,
            role: registerForm.querySelector('select[name="role"]').value,
            gender: registerForm.querySelector('select[name="gender"]').value,
            birthDate: registerForm.querySelector('input[name="birthDate"]').value
        };

        console.log('Отправка данных для регистрации:', formData);

        fetch('/sensomotor-tests/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка регистрации');
            }
            return response.json();
        })
        .then(data => {
            registerModal.style.display = 'none';
            alert('Регистрация успешна! Теперь вы можете войти.');
        })
        .catch(error => {
            alert('Ошибка: ' + error.message);
        });
    });

    // Функция обновления интерфейса в зависимости от роли
    function updateUIForRole(role) {
        const testSelection = document.getElementById('testSelection');
        if (testSelection) {
            testSelection.style.display = 'block';
            
            if (role === 'EXPERT') {
                // Добавить элементы управления для эксперта
                const userControls = document.getElementById('userControls');
                if (userControls) {
                    const expertControls = document.createElement('div');
                    expertControls.innerHTML = `
                        <button id="viewResults" class="button">Просмотр результатов</button>
                        <button id="manageTests" class="button">Управление тестами</button>
                    `;
                    userControls.appendChild(expertControls);
                }
            }
        }
    }
}); 