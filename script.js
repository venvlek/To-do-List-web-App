// Splash screen
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");

  if (!splash) return;

  setTimeout(() => {
    splash.classList.add("fade");

    splash.addEventListener(
      "transitionend",
      () => splash.remove(),
      { once: true }
    );
  }, 2000);
});


// Guest button click
const guestBtn = document.querySelector(".guest");
const loginScreen = document.querySelector(".login");
const dashboardScreen = document.querySelector(".dashboard");
const buttons = document.querySelectorAll(".dashboard .task-list .header .navigation button");
const navButtons = document.querySelectorAll(".dashboard .footer-nav .nav-btn");
const todayButton = document.querySelector(".dashboard .task-list .header .navigation button.today");
const upcomingButton = document.querySelector(".dashboard .task-list .header .navigation button.upcoming");
const allButton = document.querySelector(".dashboard .task-list .header .navigation button.all");
const statusText = document.querySelector(".dashboard .task-list .dateTimeFilter-container .dateTime .status-text");
const AddTaskScreen = document.querySelector(".AddTask-screen");
const addTaskBtn = document.querySelector(".addTask .add-task-button");
const closeAddTaskBtn = document.querySelector(".AddTask-screen .header .back");
const timebtn = document.querySelector(".AddTask-screen form .task-details .option-row button");
// Due date picker
const picker = document.getElementById("dueDate");
const dateText = document.getElementById("dateText");
const openBtn = document.getElementById("openPicker");

// Close Add Task button click  
if (closeAddTaskBtn && AddTaskScreen) {
  closeAddTaskBtn.addEventListener("click", (e) => {
    e.preventDefault(); 
    console.log("CLOSE ADD TASK CLICKED");
    AddTaskScreen.classList.remove("active");
  });
}

// Add Task button click   
if (addTaskBtn && AddTaskScreen) {
  addTaskBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("ADD TASK CLICKED");
  AddTaskScreen.classList.add("active");
  });
}

// Date picker functionality
if (picker && dateText) {
  let userSelectedDate = false; // Track if user has selected a custom date
  
  // Function to update default time display
  const updateDefaultTime = () => {
    if (!userSelectedDate) {
      const now = new Date();
      const displayTime = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      dateText.textContent = `Today, ${displayTime}`;
    }
  };
  
  // Set initial value to current date and time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  // Set the picker's default value to now
  picker.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  // Update the display text to show current time
  updateDefaultTime();
  
  // Update the time every minute (only if user hasn't selected a custom date)
  setInterval(updateDefaultTime, 60000);
  
  // Update the button text when the user selects a date/time
  picker.addEventListener("change", () => {
    userSelectedDate = true; // User has made a selection
    console.log("Date changed:", picker.value);
    const selected = new Date(picker.value);
    const now = new Date();

    const isToday =
      selected.getDate() === now.getDate() &&
      selected.getMonth() === now.getMonth() &&
      selected.getFullYear() === now.getFullYear();

    const time = selected.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (isToday) {
      dateText.textContent = `Today, ${time}`;
    } else {
      const date = selected.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      dateText.textContent = `${date}, ${time}`;
    }
  });
  
  console.log("Date picker initialized successfully");
} else {
  console.error("Date picker elements not found:", { picker, dateText });
}

// Guest button event listener

if (guestBtn && loginScreen && dashboardScreen) {
  guestBtn.addEventListener("click", (e) => {
    e.preventDefault(); // prevent form submission or page reload

    loginScreen.classList.remove("active");   // hide login
    dashboardScreen.classList.add("active");  // show dashboard
    
    // Load tasks from localStorage when dashboard opens
    loadTasks();
    updateStatistics();
  });
}

// Task Management
let tasks = [];
let currentFilter = 'today'; // 'today', 'upcoming', or 'all'

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = localStorage.getItem('todoTasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
    // Default task if none exist
    tasks = [
      {
        id: Date.now() + 1,
        title: "Welcome to your To-Do List!",
        description: "Click the + button to add your first task",
        category: "Personal",
        priority: "low",
        dueDate: new Date().toISOString().split('T')[0], // Today's date
        completed: false
      }
    ];
  }
  renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Render tasks to the DOM
function renderTasks() {
  const taskList = document.getElementById('tasks');
  if (!taskList) return;
  
  taskList.innerHTML = '';
  
  // Filter tasks based on current filter
  const filteredTasks = getFilteredTasks();
  
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<li style="text-align: center; color: gray; padding: 20px;">No tasks found</li>';
    return;
  }
  
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="secOne">
        <label class="task">
          <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
          <span class="task-text ${task.completed ? 'done' : ''}">${task.title}</span>
        </label>
        <br>
        <span class="categories">${task.category}<span class="risk-level">${task.priority}</span></span>
      </div>
      <div class="secTwo">
        <span class="due-date confirmed">Due: ${formatDate(task.dueDate)}</span>
        <button class="delete-btn" data-id="${task.id}" style="background: red; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
  
  // Add event listeners to checkboxes
  const checkboxes = taskList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const taskId = parseInt(e.target.getAttribute('data-id'));
      toggleTaskComplete(taskId);
    });
  });
  
  // Add event listeners to delete buttons
  const deleteButtons = taskList.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const taskId = parseInt(e.target.getAttribute('data-id'));
      deleteTask(taskId);
    });
  });
}

// Get filtered tasks based on current filter
function getFilteredTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  if (currentFilter === 'today') {
    return tasks.filter(task => task.dueDate === todayStr);
  } else if (currentFilter === 'upcoming') {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > today;
    });
  } else {
    // 'all'
    return tasks;
  }
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dateStr);
  taskDate.setHours(0, 0, 0, 0);
  
  const diffTime = taskDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else if (diffDays > 1 && diffDays <= 7) {
    return `In ${diffDays} days`;
  } else if (diffDays < -1) {
    return `${Math.abs(diffDays)} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

// Delete task
function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    updateStatistics();
  }
}

// Toggle task completion
function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStatistics();
  }
}

// Update statistics
function updateStatistics() {
  const today = new Date().toISOString().split('T')[0];
  
  const todayTasks = tasks.filter(t => t.dueDate === today).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const highRiskTasks = tasks.filter(t => t.priority.toLowerCase() === 'high' && !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  
  // Update the statistics display
  const taskTodayEl = document.querySelector('.task-today .numbers');
  const taskPendingEl = document.querySelector('.task-pending .numbers');
  const taskHighRiskEl = document.querySelector('.high-risk .numbers');
  const taskCompletedEl = document.querySelector('.task-completed .numbers');
  
  if (taskTodayEl) taskTodayEl.textContent = todayTasks;
  if (taskPendingEl) taskPendingEl.textContent = pendingTasks;
  if (taskHighRiskEl) taskHighRiskEl.textContent = highRiskTasks;
  if (taskCompletedEl) taskCompletedEl.textContent = completedTasks;
}

// Add new task
function addNewTask(taskData) {
  const newTask = {
    id: Date.now(),
    title: taskData.title,
    description: taskData.description || "",
    category: taskData.category,
    priority: taskData.priority.toLowerCase(),
    dueDate: taskData.dueDate,
    completed: false
  };
  
  tasks.unshift(newTask); // Add to beginning of array
  saveTasks();
  renderTasks();
  updateStatistics();
}

// Handle Add Task form submission
const addTaskForm = document.querySelector('.AddTask-screen form');
if (addTaskForm) {
  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskTitle = document.getElementById('task-name').value.trim();
    const taskDescription = document.getElementById('Discription').value.trim();
    const taskDueDate = document.getElementById('dueDate').value;
    const taskPriority = document.querySelector('.select.priority').value;
    const taskCategory = document.querySelector('.select.category').value;
    
    if (!taskTitle) {
      alert('Please enter a task title');
      return;
    }
    
    // Format the due date
    let formattedDate;
    if (taskDueDate) {
      formattedDate = taskDueDate.split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    const taskData = {
      title: taskTitle,
      description: taskDescription,
      dueDate: formattedDate,
      priority: taskPriority,
      category: taskCategory
    };
    
    addNewTask(taskData);
    
    // Clear form
    addTaskForm.reset();
    
    // Reset date picker to current time
    if (picker && dateText) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      picker.value = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      const displayTime = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      dateText.textContent = `Today, ${displayTime}`;
    }
    
    // Close the Add Task screen
    AddTaskScreen.classList.remove('active');
    
    // Show success message (optional)
    console.log('Task added successfully!');
  });
}


buttons.forEach(button => {
  button.addEventListener("click", () => {
    // remove selected state from all buttons
    buttons.forEach(btn => btn.classList.remove("selected"));

    // add selected state to clicked button
    button.classList.add("selected");

    // update status text and filter based on selected button
    if (button === todayButton) {
      statusText.textContent = "Today";
      currentFilter = 'today';
    } else if (button === upcomingButton) {
      statusText.textContent = "Upcoming";
      currentFilter = 'upcoming';
    } else if (button === allButton) {
      statusText.textContent = "All Tasks";
      currentFilter = 'all';
    }
    
    // Re-render tasks with new filter
    renderTasks();
  });
});

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    // remove selected state from all buttons
    navButtons.forEach(btn => btn.classList.remove("selected"));

    // add selected state to clicked button
    button.classList.add("selected");
  });
});

function updateDateTime() {
  const now = new Date();

  document.querySelector(".dashboard .task-list .dateTimeFilter-container .dateTime  #date").textContent =
    now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  document.querySelector(".dashboard .task-list .dateTimeFilter-container .dateTime  #time").textContent =
    now.toLocaleTimeString("en-US");
}

// Update date and time immediately when page loads
updateDateTime();

// Update date and time every second
setInterval(updateDateTime, 1000);