"use strict";

const config = {
    dbUrl: 'https://testt-3690.restdb.io/rest/todo',
    dbKey: '5c7fe52ecac6621685acbc04'
}
const loading = {
    start: () => document.querySelector('.loading-overlay').style.display = 'initial',
    stop: () => document.querySelector('.loading-overlay').style.display = 'none',
};
const form = document.querySelector("form");
const btnSubmitToday = form.elements.submit;

const todayParent = document.querySelector("#form__today>.tasks__box");
const weekParent = document.querySelector("#form__week>.tasks__box");
const monthParent = document.querySelector("#form__month>.tasks__box");
const template = document.getElementById("tpl__toDo").content;

let todoToday = [];
let todoWeek = [];
let todoMonth = [];

// INIT
window.addEventListener("load", init());

async function init() {
    console.log('Init...');
    loading.start();

    let todos = await getTodos({ isCompleted: false });
    todoToday = todos.filter(todo => todo.timeline === "today");
    todoWeek = todos.filter(todo => todo.timeline === "week");
    todoMonth = todos.filter(todo => todo.timeline === "month");

    loading.stop();
    console.log('todos: ', todos);
    renderTodo(todos);
};

function renderTodo(todos) {
    todayParent.innerHTML = '';
    weekParent.innerHTML = '';
    monthParent.innerHTML = '';

    todos.forEach(todo => {
        let tplClone = template.cloneNode(true);
        tplClone.querySelector("p").innerHTML = todo.task;
        tplClone.querySelector(`input[type="checkbox"]`).addEventListener("click", (e) => {

            if (e.target.ckecked == true) {
                todo.isCompleted = false; 
            } else {
                todo.isCompleted = true;
            }
            updateTodo(todo);
        } )

        if (todo.timeline === "today") {
            todayParent.appendChild(tplClone);
        } else if (todo.timeline === "week") {
            weekParent.appendChild(tplClone);
        } else {
            monthParent.appendChild(tplClone);
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

btnSubmitToday.addEventListener("click", (e) => {
    e.preventDefault();
    const newTodo = {
        isCompleted: false,
        task: form.elements.newToday.value,
        timeline: "today"
    }
    form.elements.newToday.value = "";
    console.log("New Todo", newTodo);
    postTodo(newTodo)
        .then(res => init())
});



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



function completeTodo() {

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
