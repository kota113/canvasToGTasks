function main() {
  // Replace the following URL with the canvas iCal file URL you want to parse
  var icalUrl = 'https://example.com/calendar.ics';
  // Replace the following with the ID of an existing googletask list
  var taskListId = 'TASKLIST_ID';

  // Fetch the iCal file
  var response = UrlFetchApp.fetch(icalUrl);
  var icalData = response.getContentText();

  // Parse the iCal data
  var events = parseICalData(icalData);

  // Add events to Google Tasks
  addEventsToTasks(events, taskListId);
}

function parseICalData(icalData) {
  var events = [];
  var lines = icalData.split('\n');

  var event = null;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (line.startsWith('BEGIN:VEVENT')) {
      event = {};
    } else if (line.startsWith('SUMMARY:')) {
      event.summary = line.substring(8);
    } else if (line.startsWith('DTSTART')) {
      event.startDate = parseDate(line.match(/(\d{8}(T\d{6})?)/)[0]);
    } else if (line.startsWith('DTEND')) {
      event.endDate = parseDate(line.match(/(\d{8}(T\d{6})?)/)[0]);
    } else if (line.startsWith('DESCRIPTION:')) {
      event.description = line.substring(12);
    } else if (line.startsWith('END:VEVENT')) {
      events.push(event);
      event = null;
    }
  }

  return events;
}

function parseDate(dateStr) {
  var formattedDateStr = dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
  if (formattedDateStr.includes('T')) {
    formattedDateStr = formattedDateStr.replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') + 'Z';
  } else {
    formattedDateStr += 'T00:00:00Z';
  }
  return new Date(formattedDateStr);
}

function addEventsToTasks(events, taskListId) {
  var tasks = Tasks.newTask();
  var existingTasks = Tasks.Tasks.list(taskListId);

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var dueDate = event.startDate.toISOString();

    if (isDuplicateTask(existingTasks, event.summary, dueDate)) {
      continue;
    }

    tasks.title = event.summary;
    tasks.notes = event.description;
    tasks.due = dueDate;
    Tasks.Tasks.insert(tasks, taskListId);
  }
}

function isDuplicateTask(existingTasks, title, dueDate) {
  for (var i = 0; i < existingTasks.items.length; i++) {
    var task = existingTasks.items[i];
    if (task.title === title && task.due === dueDate) {
      return true;
    }
  }
  return false;
}
