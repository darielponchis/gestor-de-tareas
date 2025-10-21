document.addEventListener('DOMContentLoaded', () => {
    // State
    let user = null;
    let tasks = [];

    // DOM Elements
    const setupModal = document.getElementById('setup-modal');
    const setupForm = document.getElementById('setup-form');
    const appContainer = document.getElementById('app-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const pastTasksList = document.querySelector('#past-tasks .task-list');
    const presentTasksList = document.querySelector('#present-tasks .task-list');
    const futureTasksList = document.querySelector('#future-tasks .task-list');
    const actionButton = document.getElementById('action-button');
    const completionMessage = document.getElementById('completion-message');

    // New Task Form Elements
    const addPresentTaskForm = document.getElementById('add-present-task-form');
    const newPresentTaskInput = document.getElementById('new-present-task-input');
    const addFutureTaskForm = document.getElementById('add-future-task-form');
    const newFutureTaskInput = document.getElementById('new-future-task-input');

    // Helper to get today's date in YYYY-MM-DD format
    const getTodayDateString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };
    
    // Helper to get tomorrow's date
    const getTomorrowDateString = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    // Render function
    const renderTasks = () => {
        if (!user) return;

        // Clear lists
        pastTasksList.innerHTML = '';
        presentTasksList.innerHTML = '';
        futureTasksList.innerHTML = '';

        const today = getTodayDateString();
        const past = tasks.filter(task => task.dueDate < today).sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate));
        const present = tasks.filter(task => task.dueDate === today);
        const future = tasks.filter(task => task.dueDate > today).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

        const createTaskElement = (task) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.id = task.id;

            const completedClass = task.completed ? 'completed' : '';

            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${completedClass}">${task.text}</span>
                </div>
                <input type="date" value="${task.dueDate}">
            `;

            // Event Listeners
            li.querySelector('input[type="checkbox"]').addEventListener('change', () => {
                toggleTask(task.id);
            });
            li.querySelector('input[type="date"]').addEventListener('change', (e) => {
                changeTaskDate(task.id, e.target.value);
            });

            return li;
        };
        
        past.forEach(task => pastTasksList.appendChild(createTaskElement(task)));
        present.forEach(task => presentTasksList.appendChild(createTaskElement(task)));
        future.forEach(task => futureTasksList.appendChild(createTaskElement(task)));

        // Show/hide no-tasks messages
        document.querySelector('#past-tasks .no-tasks-message').style.display = past.length === 0 ? 'block' : 'none';
        document.querySelector('#present-tasks .no-tasks-message').style.display = present.length === 0 ? 'block' : 'none';
        document.querySelector('#future-tasks .no-tasks-message').style.display = future.length === 0 ? 'block' : 'none';

        updateUI();
    };

    const updateUI = () => {
        welcomeMessage.innerHTML = `¡Bienvenido, <span>${user.name}!</span>`;
        const allCompleted = tasks.length > 0 && tasks.every(task => task.completed);
        
        actionButton.disabled = allCompleted;

        completionMessage.style.display = allCompleted ? 'block' : 'none';
    };

    // State updaters
    const toggleTask = (id) => {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        renderTasks();
    };

    const changeTaskDate = (id, newDate) => {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, dueDate: newDate } : task
        );
        renderTasks();
    };

    const addNewTask = (text, dueDate) => {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            dueDate: dueDate
        };
        tasks.push(newTask);
        renderTasks();
    };
    
    // Setup form handler
    setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const task1 = document.getElementById('task1').value.trim();
        const task2 = document.getElementById('task2').value.trim();
        const task3 = document.getElementById('task3').value.trim();

        if (name && task1 && task2 && task3) {
            user = { name };
            const today = getTodayDateString();
            tasks = [
                { id: Date.now() + 1, text: task1, completed: false, dueDate: today },
                { id: Date.now() + 2, text: task2, completed: false, dueDate: today },
                { id: Date.now() + 3, text: task3, completed: false, dueDate: today },
            ];
            
            // Start fade out animation for modal
            setupModal.classList.add('hidden');

            // Wait for animation to finish before hiding it completely
            setupModal.addEventListener('transitionend', () => {
                setupModal.style.display = 'none';

                // Show app container and fade it in
                appContainer.style.display = 'block';
                // Use a tiny timeout to allow the browser to apply 'display: block' before changing opacity
                setTimeout(() => {
                    appContainer.style.opacity = '1';
                }, 10);

                renderTasks();
            }, { once: true }); // Listener runs only once
        }
    });

    // Add new task form handlers
    addPresentTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = newPresentTaskInput.value.trim();
        if (taskText) {
            addNewTask(taskText, getTodayDateString());
            newPresentTaskInput.value = '';
        }
    });

    addFutureTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = newFutureTaskInput.value.trim();
        if (taskText) {
            addNewTask(taskText, getTomorrowDateString());
            newFutureTaskInput.value = '';
        }
    });
});