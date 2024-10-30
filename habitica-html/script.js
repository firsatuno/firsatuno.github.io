$(document).ready(function() {
    $('#credentials-form').on('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const userId = $('#user-id').val(); // Get User ID from input
        const apiToken = $('#api-token').val(); // Get API Token from input

        fetchUserInfo(userId, apiToken); // Fetch user info
        fetchTasks(userId, apiToken); // Fetch tasks with provided credentials
    });

    function fetchUserInfo(userId, apiToken) {
        $.ajax({
            url: 'https://habitica.com/api/v3/user',
            method: 'GET',
            headers: {
                'x-api-user': userId,
                'x-api-key': apiToken
            },
            success: function(data) {
                displayUserInfo(data.data);
                $('#user-info').show(); // Show user info
            },
            error: function(err) {
                console.error('Error fetching user info', err);
                alert('Failed to fetch user info. Check your User ID and API Token.');
            }
        });
    }

    function displayUserInfo(user) {
        $('#user-level').text(user.stats.lvl);
        $('#user-health').text(user.stats.hp);
        $('#user-mana').text(user.stats.mp);
        $('#user-xp').text(user.stats.exp);
    }

    function fetchTasks(userId, apiToken) {
        $.ajax({
            url: 'https://habitica.com/api/v3/tasks/user',
            method: 'GET',
            headers: {
                'x-api-user': userId,
                'x-api-key': apiToken
            },
            success: function(data) {
                displayTasks(data.data);
                $('#task-list').show(); // Show task list
                attachCheckboxHandlers(userId, apiToken); // Attach handlers after tasks are displayed
            },
            error: function(err) {
                console.error('Error fetching tasks', err);
                alert('Failed to fetch tasks. Check your User ID and API Token.');
            }
        });
    }

    function displayTasks(tasks) {
        $('#todo-list').empty();
        $('#daily-list').empty();

        tasks.forEach(task => {
            const taskItem = $(`<li>
                <label>
                    <input type="checkbox" class="complete-task" data-id="${task.id}"> ${task.text}
                </label>
            </li>`);

            if (task.type === 'todo') {
                $('#todo-list').append(taskItem);
                if (task.checklist && task.checklist.length > 0) {
                    const checklist = $('<ul class="checklist"></ul>');
                    task.checklist.forEach(item => {
                        checklist.append(`
                            <li>
                                <label>
                                    <input type="checkbox" class="checklist-item" data-id="${item.id}"> ${item.text}
                                </label>
                            </li>
                        `);
                    });
                    taskItem.append(checklist);
                }
            } else if (task.type === 'daily') {
                $('#daily-list').append(taskItem);
            }
        });
    }

    function attachCheckboxHandlers(userId, apiToken) {
        $('.complete-task').change(function() {
            const taskId = $(this).data('id');
            const taskItem = $(this).closest('li');

            if ($(this).is(':checked')) {
                completeTask(userId, apiToken, taskId);
                taskItem.remove(); // Remove task from the list
            }
        });

        $('.checklist-item').change(function() {
            const checklistItemId = $(this).data('id');
            if ($(this).is(':checked')) {
                completeChecklistItem(userId, apiToken, checklistItemId);
            } else {
                uncompleteChecklistItem(userId, apiToken, checklistItemId);
            }
        });
    }

    function completeTask(userId, apiToken, taskId) {
        $.ajax({
            url: `https://habitica.com/api/v3/tasks/${taskId}/score/up`,
            method: 'POST',
            headers: {
                'x-api-user': userId,
                'x-api-key': apiToken
            },
            success: function() {
                alert('Task completed! Score increased.');
                fetchUserInfo(userId, apiToken);
            },
            error: function(err) {
                console.error('Error updating score', err);
                alert('Failed to update score. Please try again.');
            }
        });
    }

    function completeChecklistItem(userId, apiToken, checklistItemId) {
        // Implement your logic to mark the checklist item as completed
        console.log(`Checklist item ${checklistItemId} completed.`);
    }

    function uncompleteChecklistItem(userId, apiToken, checklistItemId) {
        // Implement your logic to mark the checklist item as uncompleted
        console.log(`Checklist item ${checklistItemId} uncompleted.`);
    }
    function fetchHabiticaData(){
        const userId = $('#user-id').val(); // Get User ID from input
        const apiToken = $('#api-token').val(); // Get API Token from input

        fetchUserInfo(userId, apiToken); // Fetch user info
        fetchTasks(userId, apiToken); // Fetch tasks with provided credentials
    }
    function createTask(taskData) {
        const userId = $('#user-id').val(); // Get User ID from input
        const apiToken = $('#api-token').val(); // Get API Token from input
        $.ajax({
            url: 'https://habitica.com/api/v3/tasks/user',
            headers: {
                'x-api-user': userId,
                'x-api-key': apiToken,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            data: JSON.stringify(taskData),
            success: function(response) {
                console.log('Task created successfully:', response);
                fetchHabiticaData(); // Refresh the task list
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error creating task:', textStatus, errorThrown);
            }
        });
    }

    function addNewTodo() {
        const newTodoText = $('#newTodoInput').val().trim();
        if (newTodoText) {
            createTask({
                text: newTodoText,
                type: 'todo',
                checklist: []
            });
            $('#newTodoInput').val(''); // Clear input field
        }
    }

    $('#addTodoButton').click(addNewTodo);

    $('#newTodoInput').keypress(function(e) {
        if (e.which === 13) { // Enter key
            addNewTodo();
        }
    });
});
