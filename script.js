const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

let editingTaskId = null;

async function fetchTasks() {
    const response = await fetch('http://localhost:3000/tasks');
    console.log('Response:', response);
    if (!response.ok){
        throw new Error('Failed to fetch tasks');
    }
    const tasks = await response.json();
    renderTasks(tasks);
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        addTaskToDOM(task.title, task._id);
    })
}

addTaskButton.addEventListener('click', addTaskHandler);

taskInput.addEventListener('keydown', function(event){
    if(event.key === 'Enter'){
        addTaskHandler();
    }
})

function addTaskHandler(){
    const task = taskInput.value;
    if (task){
        if(editingTaskId){
            updateTask(editingTaskId, task);
        } else{
            addTask(task);
        }
        taskInput.value = '';
    }
}


function addTaskToDOM(task, taskId){
    const newTask = document.createElement('li');
    newTask.setAttribute('data-id', taskId);
    newTask.textContent = task;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'btn-edit';
    editButton.addEventListener('click', function() {
        editTask(taskId, task);
    })

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'btn-delete';
    deleteButton.addEventListener('click', function(){
        deleteTask(taskId);
    })

    newTask.appendChild(editButton);
    newTask.appendChild(deleteButton);

    taskList.appendChild(newTask);
}

async function addTask(task) {
    const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({title: task}),
    });
    if(!response.ok){
        throw new Error('Failed to add task');
    }
    const newTask = await response.json();
    addTaskToDOM(newTask.title, newTask._id);
}

function editTask(taskId, task){
    taskInput.value = task;
    editingTaskId = taskId;
}

async function updateTask(taskId, newTask){
    console.log(`Updating task with ID: ${taskId}`);

    const taskItem = taskList.querySelector(`[data-id='${taskId}']`);
    if (taskItem){
        taskItem.firstChild.textContent = newTask;
    }

    try{
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({title: newTask, completed: false}),
    });
   
    if (!response.ok) {
        // If not ok, try to get the error message from response
        const errorText = await response.text(); // Get raw text
        throw new Error(`Failed to update task with ID ${taskId}: ${errorText}`);
    }

    const updatedTask = await response.json();
    console.log('Task Successfully updated', updatedTask);
} catch (error){
    console.error('Error updating task:', error);
}
    editingTaskId = null;
}

async function deleteTask(taskId){
    const taskItem = taskList.querySelector(`[data-id='${taskId}']`);
    taskList.removeChild(taskItem);

    const response = await fetch(`http://localhost:3000/tasks/${taskId}`,{
        method: 'DELETE',
    });
    if(!response.ok){
        throw new Error('Failed to delete task');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try{
        await fetchTasks();
    } catch (error){
        console.error(error);
    }
});