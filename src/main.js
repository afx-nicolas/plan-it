import './style.css';

const $query = (el, all = false) => {
  return !all ?
    document.querySelector(`[data-js="${el}"]`) :
    document.querySelectorAll(`[data-js="${el}"]`);
};

const Storage = {
  get: () => JSON.parse(localStorage.getItem("plan.it:tasks")) || [],
  set: (task) => localStorage.setItem('plan.it:tasks', JSON.stringify(task))
}

const tasks = Storage.get();

const openModal = $query('add-task');
const cancelTask = $query('cancel-btn');
const modal = $query('modal');
const form = $query('task-form')
const taskInput = $query('task-input');

const Modal = {
  open: () => modal.classList.remove('hide'),
  close: () => modal.classList.add('hide')
}

function createTask(task) {
  const taskModel = `
  <div class="task-wrapper ${task.check}" data-js="task-wrapper">
    <p title="${task.name}">${task.name}</p>
    <div class="action-btns">
      <label class="todo-check" title="Set finished">
        <div class="check"><svg fill="" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30" width="30px" height="30px"><path d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z"/></svg></div>
        <input type="checkbox" data-js="check-task" />
      </label>
      <a href="/" class="delete" data-js="remove-task" title="Remove task">
        <div class="box">X</div>
      </a>
    </div>
  </div>
  `;

  return taskModel;
};

function addNewTask(value) {
  const tasksIds = tasks.length > 0 ?
    tasks.map((task) => task.id) : [1]
  const higherId = Math.max(...tasksIds);

  const taskObj = {
    name: value,
    check: '',
    id: higherId + 1
  };
  tasks.push(taskObj);
  tasks.sort((a, b) => sortTasks(a, b));
  refreshTasks();
}

function sortTasks(a, b) {
  if (a.check) {
    return 1
  }
  if (b.check) {
    return -1
  } else {
    return a.id > b.id ? 1 : -1
  }
}

function refreshTasks() {
  const tasksContainer = $query('task-list-body');
  tasksContainer.innerHTML = '';
  Storage.set(tasks);

  tasks.forEach((taskDesc) => {
    const task = createTask(taskDesc);
    tasksContainer.insertAdjacentHTML('beforeend', task)
  });

  const checkTask = $query('check-task', true);
  checkTask.forEach((check, index) => {
    const elements = $query('task-wrapper', true);
    check.addEventListener('click', () => {
      if (!elements[index].classList.contains('checked')) {
        elements[index].classList.add('checked');
        tasks[index].check = 'checked';
      } else {
        elements[index].classList.remove('checked');
        tasks[index].check = '';
      }
      tasks.sort((a, b) => sortTasks(a, b));
      setTimeout(() => {
        refreshTasks();
      }, 450);
    });
  });

  const removeTask = $query('remove-task', true);
  removeTask.forEach((check, index) => {
    check.addEventListener('click', (e) => {
      e.preventDefault();
      tasks.splice(index, 1);
      refreshTasks();
    });
  });
};

function formSubmit(e = false) {
  if (e) e.preventDefault();

  if (taskInput.value.trim() === '') {
    taskInput.classList.contains('invalid') || taskInput.classList.add('invalid');
  } else {
    !taskInput.classList.contains('invalid') || taskInput.classList.remove('invalid');
    addNewTask(taskInput.value);
    Modal.close()
  }
  form.reset()
}

openModal.addEventListener('click', (e) => {
  e.preventDefault();
  Modal.open();
})

cancelTask.addEventListener('click', (e) => {
  e.preventDefault();
  !taskInput.classList.contains('invalid') || taskInput.classList.remove('invalid');
  form.reset();
  Modal.close();
})

form.addEventListener('submit', (e) => formSubmit(e))

taskInput.addEventListener('focus', () => {
  !taskInput.classList.contains('invalid') || taskInput.classList.remove('invalid');
})

taskInput.addEventListener('input', (e) => {
  taskInput.value = taskInput.value.replace(/[<>]/g, '')
})

window.addEventListener('keydown', (e) => e.keyCode === 13 ? formSubmit(e) : false)

refreshTasks();
