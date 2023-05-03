function main() {
  // Replace the following URL with the canvas iCal file URL you want to parse
  var icalUrl = 'https://example.com/calendar.ics';
  // Replace the following with the ID of an existing googletask list
  var taskListId = 'your-tasklist-id';

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
    if (line.substring(0, 1) === " ") {
      continue
    }
    
    for (var lineIndex = i+1; lineIndex < lines.length; lineIndex++) {
      const nextLine = lines[lineIndex]
      if (nextLine.startsWith(" ")) {
        line = line.slice(0, -1) + nextLine.substring(1)
        continue
      } else {
        break
      }
    }

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
  var existingTasks = Tasks.Tasks.list(taskListId);

  
  const existingTitles = {}
  for (var k = 0; k < existingTasks.items.length; k++) {
    Logger.log(existingTasks.items[k].title)
    existingTitles[existingTasks.items[k].title] = existingTasks.items[k].due
  }

    var currentDate = new Date();
    var oneMonthLater = new Date();
    oneMonthLater.setMonth(currentDate.getMonth() + 1);

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var dueDate = event.startDate.toISOString();
    const eventTitle = event.summary.replace('\\', '')

    if (eventTitle in existingTitles) {
      continue;
    }
    if (event.startDate >= currentDate && event.startDate <= oneMonthLater) {
      var tasks = Tasks.newTask();
      tasks.title = eventTitle;
      tasks.notes = event.description;
      tasks.due = dueDate;
      Tasks.Tasks.insert(tasks, taskListId);
    }
  }
}
