"use strict";
// import "babel-polyfill"
 
const config = {
  dbUrl: "https://testt-3690.restdb.io/rest/todo",
  dbKey: "5c7fe52ecac6621685acbc04"
};
const loading = {
    start: () => document.querySelector('.loading-overlay').style.display = 'initial',
    stop: () => document.querySelector('.loading-overlay').style.display = 'none',
};

const logo = document.getElementById("img__logo");

const formToday = document.querySelector("#form__today");
const formWeek = document.querySelector("#form__week");
const formMonth = document.querySelector("#form__month");
const formYear = document.querySelector("#form__year");

const btnSubmitToday = formToday.elements.submit;
const btnSubmitWeek = formWeek.elements.submit;
const btnSubmitMonth = formMonth.elements.submit;
const btnSubmitYear = formYear.elements.submit;

const todayParent = document.querySelector("#form__today>.tasks__box");
const weekParent = document.querySelector("#form__week>.tasks__box");
const monthParent = document.querySelector("#form__month>.tasks__box");
const yearParent = document.querySelector("#form__year>.tasks__box");

const template = document.getElementById("tpl__toDo").content;

let todoToday = [];
let todoWeek = [];
let todoMonth = [];
let todoYear = [];

// INIT
window.addEventListener("load", init());
logo.addEventListener('click', () => window.location.href = "index.html");

async function init() {
    console.log('Init...');
    loading.start();

    let todos = await getTodos({ isCompleted: false });
    todoToday = todos.filter(todo => todo.timeline === "today");
    todoWeek = todos.filter(todo => todo.timeline === "week");
    todoMonth = todos.filter(todo => todo.timeline === "month");
    todoYear = todos.filter(todo => todo.timeline === "year");

    loading.stop();
    console.log('todos: ', todos);
    renderTodo(todos);
    renderTasksNr(todoToday, todoWeek, todoMonth, todoYear);
    // setupDrag()
    dragEventListeners()
};

const allParents = document.querySelectorAll(".tasks__box");

let dragItem;
let dragObj;

function dragEventListeners() {
    allParents.forEach(parent => {
        parent.addEventListener('dragover', dragOver);
        parent.addEventListener('dragenter', dragEnter);
        parent.addEventListener('dragleave', dragLeave);
        parent.addEventListener('drop', dragDrop);
    });
}

//  SEARCH TODO

function searchTodo(id) {
    let todo = null;
    todo = todoToday.find(elem => elem._id === id);

    if (!todo) {
        todo = todoWeek.find(elem => elem._id === id);
    }
    if (!todo) {
        todo = todoMonth.find(elem => elem._id === id);
    }
    if (!todo) {
        todo = todoYear.find(elem => elem._id === id);
    }
    return todo;
}

// drag functions
function dragStart(e) {
    console.log("start", e);
    e.dataTransfer.dropEffect = "move";
    dragItem = e.target;
    dragObj = searchTodo(e.target.dataset.todoid);

    this.className += ' hold';
    setTimeout(() => (this.classList.add('invisible')), 0);
}

function dragEnd() {
    console.log("end", this);
    this.classList.remove("hold");
    this.classList.remove("invisible");
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    console.log("enter");
    e.preventDefault();
    this.className += ' hovered';
}

function dragLeave() {
    console.log("leave");
    this.classList.remove("hovered");
}

function dragDrop(e) {
    console.log("--> drop", e);
    this.classList.remove("hovered");
    this.appendChild(dragItem);

    dragObj.timeline = this.dataset.timeline;
    updateTodo(dragObj);
}

function renderTasksNr(todoToday, todoWeek, todoMonth, todoYear) {

    todoToday.length === 1 
        ? document.getElementById("todayTasks").innerHTML = todoToday.length + " task " 
        : document.getElementById("todayTasks").innerHTML = todoToday.length + " tasks "
    todoWeek.length === 1
        ? document.getElementById("weekTasks").innerHTML = todoWeek.length + " task "
        : document.getElementById("weekTasks").innerHTML = todoWeek.length + " tasks "
    todoMonth.length === 1
        ? document.getElementById("monthTasks").innerHTML = todoMonth.length + " task "
        : document.getElementById("monthTasks").innerHTML = todoMonth.length + " tasks "
    todoYear.length === 1
        ? document.getElementById("yearTasks").innerHTML = todoYear.length + " task "
        : document.getElementById("yearTasks").innerHTML = todoYear.length + " tasks "
}

function renderTodo(todos) {
    todayParent.innerHTML = '';
    weekParent.innerHTML = '';
    monthParent.innerHTML = '';
    yearParent.innerHTML = '';

    todos.forEach(todo => {
        let tplClone = template.cloneNode(true);
        tplClone.querySelector("p").innerHTML = todo.task;
        tplClone.querySelector('.toDo__box').dataset.todoid = todo._id;

        tplClone.querySelector(`input[type="checkbox"]`).addEventListener("click", (e) => {
            if (e.target.ckecked == true) {
                todo.isCompleted = false; 
            } else {
                todo.isCompleted = true;
            }
            updateTodo(todo);
        })

        // Add dragability event listeners
        tplClone.querySelector('.toDo__box').addEventListener('dragstart', dragStart);
        tplClone.querySelector('.toDo__box').addEventListener('dragend', dragEnd);

        if (todo.timeline === "today") {
            todayParent.appendChild(tplClone);
        } else if (todo.timeline === "week") {
            weekParent.appendChild(tplClone);
        } else if (todo.timeline === "month"){
            monthParent.appendChild(tplClone);
        } else {
            yearParent.appendChild(tplClone);
        }
    });
}

function getTodos(obj) {
    const url = obj
        ? config.dbUrl + '?q=' + JSON.stringify(obj)
        : config.dbUrl

    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": config.dbKey,
            "cache-control": "no-cache"
        }
    })
        .then(res => res.json())
}

// BTNS EVENT LISTENERS TO SUBMIT NEW TASK
btnSubmitToday.addEventListener("click", (e) => {
    e.preventDefault();
    addNewTask("today");
});
btnSubmitWeek.addEventListener("click", (e) => {
    e.preventDefault();
    addNewTask("week");
});
btnSubmitMonth.addEventListener("click", (e) => {
    e.preventDefault();
    addNewTask("month");
});
btnSubmitYear.addEventListener("click", (e) => {
    e.preventDefault();
    addNewTask("year");
});

// ADD NEW TODO
function addNewTask(timeline) {
    // let form = ${form + timeline.charAt(0).toUpperCase() + timeline.slice(1)};
    let newTodo;
    if (timeline === "today") {
        newTodo = {
            isCompleted: false,
            task: formToday.elements.newToday.value,
            timeline: "today"
        }
        formToday.elements.newToday.value = "";
    } else if (timeline === "week") {
        newTodo = {
            isCompleted: false,
            task: formWeek.elements.newWeek.value,
            timeline: "week"
        }
        formWeek.elements.newWeek.value = "";

    } else if (timeline === "month") {
        newTodo = {
            isCompleted: false,
            task: formMonth.elements.newMonth.value,
            timeline: "month"
        }
        formMonth.elements.newMonth.value = "";
    } else {
        newTodo = {
            isCompleted: false,
            task: formYear.elements.newYear.value,
            timeline: "year"
        }
        formYear.elements.newYear.value = "";
    }
    
    console.log("New Todo", newTodo);
    postTodo(newTodo)
        .then(res => init())
}


function postTodo(todo) {
    const url = config.dbUrl;

    return fetch(url, {
        method: "POST",
        body: JSON.stringify(todo),
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": config.dbKey,
            "cache-control": "no-cache"
        }
    })
        .then(res => res.json())
}

function deleteTodo(id) {
    const url = config.dbUrl + '/' + id;

    return fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": config.dbKey,
            "cache-control": "no-cache"
        }
    })
        .then(res => res.json())
}

function updateTodo(todo) {
    const url = config.dbUrl + '/' + todo._id;
    const updatedTodo = { ...todo };

    delete updatedTodo._id;

    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(updatedTodo),
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": config.dbKey,
            "cache-control": "no-cache"
        }
    })
        .then(res => res.json())
}
