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
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    tasks = [
      {
        id: Date.now() + 1,
        title: "Welcome to your To-Do List!",
        description: "Click the + button to add your first task",
        category: "Personal",
        priority: "low",
        dueDate: todayStr,
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
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  console.log('Current filter:', currentFilter);
  console.log('Today date string:', todayStr);
  console.log('All tasks:', tasks.map(t => ({ title: t.title, dueDate: t.dueDate })));
  
  if (currentFilter === 'today') {
    const todayTasks = tasks.filter(task => task.dueDate === todayStr);
    console.log('Today tasks:', todayTasks.length);
    return todayTasks;
  } else if (currentFilter === 'upcoming') {
    const upcomingTasks = tasks.filter(task => task.dueDate > todayStr);
    console.log('Upcoming tasks:', upcomingTasks.length);
    return upcomingTasks;
  } else {
    // 'all'
    console.log('All tasks:', tasks.length);
    return tasks;
  }
}

// Format date for display
function formatDate(dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  
  if (dateStr === todayStr) {
    return 'Today';
  } else if (dateStr === tomorrowStr) {
    return 'Tomorrow';
  } else if (dateStr === yesterdayStr) {
    return 'Yesterday';
  } else {
    // Calculate days difference
    const taskDate = new Date(dateStr + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = taskDate - todayDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1 && diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays < -1 && diffDays >= -7) {
      return `${Math.abs(diffDays)} days ago`;
    } else {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
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
      // Extract just the date part from datetime-local
      formattedDate = taskDueDate.split('T')[0];
    } else {
      // Use today's date if no date selected
      const now = new Date();
      formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    console.log('Adding task with date:', formattedDate);
    
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
    
    // Get the button text to determine which screen to show
    const buttonText = button.querySelector('span').textContent;
    
    // Hide all screens
    dashboardScreen.classList.remove('active');
    document.querySelector('.Calendar-screen')?.classList.remove('active');
    document.querySelector('.Stats-screen')?.classList.remove('active');
    document.querySelector('.Settings-screen')?.classList.remove('active');
    
    // Show the appropriate screen
    if (buttonText === 'Home') {
      dashboardScreen.classList.add('active');
    } else if (buttonText === 'Calendar') {
      const calendarScreen = document.querySelector('.Calendar-screen');
      calendarScreen.classList.add('active');
      renderCalendar();
    } else if (buttonText === 'Stats') {
      const statsScreen = document.querySelector('.Stats-screen');
      statsScreen.classList.add('active');
      updateStatsScreen();
    } else if (buttonText === 'Settings') {
      const settingsScreen = document.querySelector('.Settings-screen');
      settingsScreen.classList.add('active');
      loadSettings();
    }
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

// ========== CALENDAR FUNCTIONALITY ==========
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let selectedCalendarDate = null;

function renderCalendar() {
  const monthYearEl = document.getElementById('current-month-year');
  const calendarGrid = document.getElementById('calendar-grid');
  
  if (!monthYearEl || !calendarGrid) return;
  
  // Set month/year header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  monthYearEl.textContent = `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
  
  // Clear existing calendar
  calendarGrid.innerHTML = '';
  
  // Get first day of month and total days
  const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
  const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayEl = createCalendarDay(day, true);
    calendarGrid.appendChild(dayEl);
  }
  
  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEl = createCalendarDay(day, false, dateStr);
    
    // Check if today
    if (dateStr === todayStr) {
      dayEl.classList.add('today');
    }
    
    // Check if has tasks
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    if (dayTasks.length > 0) {
      dayEl.classList.add('has-tasks');
    }
    
    // Add click event
    dayEl.addEventListener('click', () => selectCalendarDate(dateStr));
    
    calendarGrid.appendChild(dayEl);
  }
  
  // Add next month's days to fill grid
  const totalCells = calendarGrid.children.length;
  const remainingCells = 35 - totalCells; // 5 weeks
  for (let day = 1; day <= remainingCells; day++) {
    const dayEl = createCalendarDay(day, true);
    calendarGrid.appendChild(dayEl);
  }
  
  // Select today by default
  if (!selectedCalendarDate) {
    selectCalendarDate(todayStr);
  }
}

function createCalendarDay(day, isOtherMonth, dateStr = null) {
  const dayEl = document.createElement('div');
  dayEl.classList.add('calendar-day');
  if (isOtherMonth) dayEl.classList.add('other-month');
  dayEl.textContent = day;
  if (dateStr) dayEl.dataset.date = dateStr;
  return dayEl;
}

function selectCalendarDate(dateStr) {
  selectedCalendarDate = dateStr;
  
  // Update selected styling
  document.querySelectorAll('.calendar-day').forEach(day => {
    day.classList.remove('selected');
    if (day.dataset.date === dateStr) {
      day.classList.add('selected');
    }
  });
  
  // Update tasks list
  const titleEl = document.getElementById('selected-date-title');
  const listEl = document.getElementById('calendar-tasks-list');
  
  if (!titleEl || !listEl) return;
  
  const date = new Date(dateStr + 'T00:00:00');
  titleEl.textContent = `Tasks for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
  
  const dateTasks = tasks.filter(t => t.dueDate === dateStr);
  
  if (dateTasks.length === 0) {
    listEl.innerHTML = '<li style="color: gray; text-align: center;">No tasks for this date</li>';
  } else {
    listEl.innerHTML = dateTasks.map(task => `
      <li>
        <span>${task.completed ? '✓' : '○'} ${task.title}</span>
        <span class="categories">${task.category}</span>
      </li>
    `).join('');
  }
}

// Calendar navigation
document.querySelector('.prev-month')?.addEventListener('click', () => {
  currentCalendarMonth--;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }
  renderCalendar();
});

document.querySelector('.next-month')?.addEventListener('click', () => {
  currentCalendarMonth++;
  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  renderCalendar();
});

// ========== STATS FUNCTIONALITY ==========
function updateStatsScreen() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Total tasks
  document.getElementById('total-tasks').textContent = tasks.length;
  
  // Completed tasks
  const completed = tasks.filter(t => t.completed).length;
  document.getElementById('completed-tasks').textContent = completed;
  
  // Completion rate
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  document.getElementById('completion-rate').textContent = `${completionRate}% completion rate`;
  
  // Pending tasks
  const pending = tasks.filter(t => !t.completed).length;
  document.getElementById('pending-tasks').textContent = pending;
  
  // Overdue tasks
  const overdue = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;
  document.getElementById('overdue-tasks').textContent = overdue;
  
  // Category breakdown
  const categoryBreakdown = {};
  tasks.forEach(task => {
    categoryBreakdown[task.category] = (categoryBreakdown[task.category] || 0) + 1;
  });
  
  const categoryEl = document.getElementById('category-breakdown');
  categoryEl.innerHTML = Object.entries(categoryBreakdown).map(([category, count]) => {
    const percentage = Math.round((count / tasks.length) * 100);
    return `
      <div class="breakdown-item">
        <span>${category}</span>
        <div class="breakdown-bar">
          <div class="breakdown-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span>${count}</span>
      </div>
    `;
  }).join('') || '<p style="color: gray;">No tasks yet</p>';
  
  // Priority breakdown
  const priorityBreakdown = {};
  tasks.forEach(task => {
    const priority = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    priorityBreakdown[priority] = (priorityBreakdown[priority] || 0) + 1;
  });
  
  const priorityEl = document.getElementById('priority-breakdown');
  priorityEl.innerHTML = Object.entries(priorityBreakdown).map(([priority, count]) => {
    const percentage = Math.round((count / tasks.length) * 100);
    return `
      <div class="breakdown-item">
        <span>${priority}</span>
        <div class="breakdown-bar">
          <div class="breakdown-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span>${count}</span>
      </div>
    `;
  }).join('') || '<p style="color: gray;">No tasks yet</p>';
  
  // Productivity chart (last 7 days)
  const chartEl = document.getElementById('productivity-chart');
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const completedCount = tasks.filter(t => t.completed && t.dueDate === dateStr).length;
    last7Days.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: completedCount
    });
  }
  
  const maxCount = Math.max(...last7Days.map(d => d.count), 1);
  
  chartEl.innerHTML = last7Days.map(day => {
    const height = (day.count / maxCount) * 100;
    return `
      <div class="chart-bar" style="height: ${height}%;">
        <span class="chart-bar-value">${day.count}</span>
        <span class="chart-bar-label">${day.day}</span>
      </div>
    `;
  }).join('');
}

// ========== SETTINGS FUNCTIONALITY ==========
function loadSettings() {
  // Load settings from localStorage
  const settings = JSON.parse(localStorage.getItem('todoSettings') || '{}');
  
  document.getElementById('show-completed').checked = settings.showCompleted !== false;
  document.getElementById('auto-delete-completed').checked = settings.autoDeleteCompleted || false;
  document.getElementById('enable-notifications').checked = settings.enableNotifications || false;
  
  // Set total tasks created
  document.getElementById('total-tasks-created').textContent = tasks.length;
  
  // Set member since
  const memberSince = localStorage.getItem('memberSince') || new Date().toLocaleDateString();
  localStorage.setItem('memberSince', memberSince);
  document.getElementById('member-since').textContent = memberSince;
}

function saveSettings() {
  const settings = {
    showCompleted: document.getElementById('show-completed').checked,
    autoDeleteCompleted: document.getElementById('auto-delete-completed').checked,
    enableNotifications: document.getElementById('enable-notifications').checked
  };
  localStorage.setItem('todoSettings', JSON.stringify(settings));
}

// Settings event listeners
document.getElementById('show-completed')?.addEventListener('change', saveSettings);
document.getElementById('auto-delete-completed')?.addEventListener('change', saveSettings);
document.getElementById('enable-notifications')?.addEventListener('change', saveSettings);

// Export data
document.getElementById('export-data')?.addEventListener('click', () => {
  const data = {
    tasks: tasks,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert('Data exported successfully!');
});

// Import data
document.getElementById('import-data')?.addEventListener('click', () => {
  document.getElementById('import-file-input')?.click();
});

document.getElementById('import-file-input')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.tasks && Array.isArray(data.tasks)) {
        if (confirm('This will replace all existing tasks. Continue?')) {
          tasks = data.tasks;
          saveTasks();
          renderTasks();
          updateStatistics();
          alert('Data imported successfully!');
        }
      } else {
        alert('Invalid file format');
      }
    } catch (error) {
      alert('Error reading file: ' + error.message);
    }
  };
  reader.readAsText(file);
});

// Clear all data
document.getElementById('clear-all-data')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone!')) {
    if (confirm('Really sure? This will permanently delete everything!')) {
      tasks = [];
      saveTasks();
      renderTasks();
      updateStatistics();
      alert('All data has been cleared.');
    }
  }
});