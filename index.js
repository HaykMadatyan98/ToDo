const BASE_URL = 'http://localhost:5000/';
const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("message", ({ data }) => {
    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('Notification');

    notificationContainer.innerText = `Reminder for title: ${data}`

    document.body.append(notificationContainer);
    setTimeout(() => {
        notificationContainer.style.display = 'none';
    }, 8000);
  });

const todosContainer = document.querySelector('.Todos-Container');
const addTodoButton = document.querySelector('.Add-Todo');
const addInputs = document.querySelectorAll('.Add-Todo-Container input');
const modal_container = document.querySelector('.Reminder-Container');
const close = document.querySelector('.close')

addTodoButton.addEventListener('click', addTodo);

function addInputsCheck() {
    if (addInputs[0].value && addInputs[1].value) {
        addTodoButton.removeAttribute('disabled')
    } else {
        addTodoButton.setAttribute('disabled', 'disabled')
    }
}

addInputs.forEach((input) => {
    input.addEventListener('change', addInputsCheck)
})

async function drawTodos() {
    const response = await fetch(`${BASE_URL}todo`);
    const { data: todos } = await response.json();
    todosContainer.innerHTML = '';

    todos.forEach((todo, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-value', todo.id)
        tr.classList.add('todo');

        const td = document.createElement('td');
        const TodoID = document.createElement('span');
        TodoID.innerText = index + 1;
        td.append(TodoID)

        const td1 = document.createElement('td');
        const todoTitle = document.createElement('input');
        todoTitle.setAttribute('data-value', 'title');
        todoTitle.classList.add('todo-title');
        todoTitle.type = 'text';
        todoTitle.value = todo.title;
        td1.append(todoTitle)

        const td2 = document.createElement('td');
        const todoReminder = document.createElement('input');
        todoReminder.setAttribute('data-value', 'reminder');
        todoReminder.classList.add('todo-reminder');
        todoReminder.type = 'datetime-local';
        todoReminder.value = todo.reminder;
        td2.append(todoReminder)

        const td3 = document.createElement('td');
        const isComplete = document.createElement('input');
        isComplete.setAttribute('data-value', 'completed');
        isComplete.type = 'checkbox';
        isComplete.checked = todo.completed;
        td3.append(isComplete)

        const td4 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerText = 'DELETE';
        td4.append(deleteButton)

        tr.append(td, td1, td2, td3, td4);
        todosContainer.append(tr);
    })
    const deleteTodoButtons = document.querySelectorAll('.delete-button');

    deleteTodoButtons.forEach(btn => {
        btn.addEventListener('click', deleteTodo);
    })

    const todoInputs = document.querySelectorAll('.todo input');
    todoInputs.forEach(todo => {
        todo.addEventListener('change', editTodo);
    })
}

async function deleteTodo(e) {
    const yes = confirm('Do you want to delete this todo?');

    if(!yes) return;

    const id = e.target.parentElement.parentElement.getAttribute('data-value');

    await fetch(`${BASE_URL}todo/${id}`, {
        method: "DELETE"
    })

    drawTodos();
}

async function editTodo(e) {
    const id = e.target.parentElement.parentElement.getAttribute('data-value');
    const key = e.target.getAttribute('data-value');

    await fetch(`${BASE_URL}todo/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({[key]: e.target.value == 'on' ? e.target.checked : e.target.value})
    })
}

async function addTodo() {
    const title = document.querySelector('.Add-Todo-title');
    const reminder = document.querySelector('.Add-Todo-reminder');

    const newTodo = {
        title: title.value,
        reminder: reminder.value
    }

    await fetch(`${BASE_URL}todo`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(newTodo)
    })

    title.value = '';
    reminder.value = '';

    drawTodos()
}


socket.onmessage = function (event) {
    const title_container = document.querySelector('p');
    title_container.innerText = event.data;
    if (event.data) {
        modal_container.classList.add('show');
        close.addEventListener('click', () => {
            modal_container.classList.remove('show');
        })
    }
}

drawTodos()