function syncEventsToTasks() {
  // Change the calendar ID below to match the ID of the calendar you want to sync
  var calendarId = 'f9pn6imkknou53t8qv57j4s5jeqpk2k8@import.calendar.google.com';
  var taskListId = 'aWdmU2cxQ0pWUmlEb3VkQw'
  
  // Get all events from the calendar
  var events = CalendarApp.getCalendarById(calendarId).getEvents(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)));
  
  // Get all tasks in the task list
  var tasks = Tasks.Tasks.list(taskListId).items;

  // Create an object to track the titles of existing tasks
  var existingTitles = {};
  for (var i = 0; i < tasks.length; i++) {
    existingTitles[tasks[i].title] = true;
  }
  
  // Loop through each event and add it as a task if it doesn't already exist
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    if (!existingTitles[event.getTitle()]) {
      var task = Tasks.newTask();
      task.title = event.getTitle();
      task.notes = event.getDescription();
      task.due = Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
      Tasks.Tasks.insert(task, taskListId);
    }
  }
}