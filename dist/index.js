// index.ts
document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const todoList = document.getElementById("todoList");
  const dueDateInput = document.getElementById("dueDateInput");
  const priorityInput = document.getElementById("priorityInput");
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  loadTasks();
  checkDueDates();
  addTaskBtn.addEventListener("click", () => {
    const task = todoInput.value.trim();
    const dueDate = dueDateInput.value.trim();
    const priority = priorityInput.value.trim();
    if (!task) {
      alert("Task cannot be empty");
      return;
    }
    if (!dueDate) {
      alert("Due date cannot be empty");
      return;
    }
    addTask(task, dueDate, priority);
    saveTasks();
    todoInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "low";
    checkDueDates();
  });
  function addTask(task, dueDate = "", priority = "low") {
    const li = document.createElement("li");
    li.className = `list-group-item priority-${priority}`;
    const taskContainer = document.createElement("div");
    taskContainer.className = "task-container";
    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = dueDate ? `${task} - Due: ${dueDate}` : task;
    const taskActions = document.createElement("div");
    taskActions.className = "task-actions";
    const completeBtn = document.createElement("button");
    completeBtn.className = "btn btn-success btn-sm";
    completeBtn.innerHTML = '<i class="fas fa-check"></i>';
    completeBtn.addEventListener("click", () => {
      li.classList.toggle("completed");
      saveTasks();
    });
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-secondary btn-sm";
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener("click", () => {
      const newTask = prompt("Edit Task", taskText.textContent || "");
      if (newTask !== null && newTask.trim() !== "") {
        taskText.textContent = dueDate ? `${newTask.trim()} - Due: ${dueDate}` : newTask.trim();
        saveTasks();
      }
    });
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger btn-sm";
    removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    removeBtn.addEventListener("click", () => {
      li.remove();
      saveTasks();
    });
    taskActions.appendChild(completeBtn);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(removeBtn);
    taskContainer.appendChild(taskText);
    taskContainer.appendChild(taskActions);
    li.appendChild(taskContainer);
    todoList.appendChild(li);
    const now = new Date;
    const due = new Date(dueDate);
    if (due && due < now) {
      li.classList.add("overdue");
    }
  }
  function saveTasks() {
    const tasks = Array.from(todoList.children).map((li) => {
      const taskText = li.querySelector(".task-text")?.textContent;
      const completed = li.classList.contains("completed");
      return { text: taskText, completed };
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks.forEach((task) => {
      const [taskText, dueDate] = task.text ? task.text.split(" - Due: ") : [""];
      const priority = taskText.includes("High") ? "high" : taskText.includes("Medium") ? "medium" : "low";
      addTask(taskText, dueDate, priority);
      if (task.completed) {
        const li = todoList.lastElementChild;
        li.classList.add("completed");
      }
    });
  }
  function checkDueDates() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks.forEach((task) => {
      if (task.text) {
        const [taskText, dueDate] = task.text.split(" - Due: ");
        const due = new Date(dueDate);
        const now = new Date;
        const timeDiff = due.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (daysDiff <= 1 && due > now && Notification.permission === "granted") {
          new Notification("Task Due Soon!", {
            body: `The task "${taskText}" is due ${daysDiff === 1 ? "tomorrow" : "today"}!`,
            icon: "https://example.com/icon.png"
          });
        }
      }
    });
  }
  setInterval(checkDueDates, 3600000);
});
