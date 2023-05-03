function listTasklists() {
  var tasklists = Tasks.Tasklists.list();
  if (tasklists.items) {
    for (var i = 0; i < tasklists.items.length; i++) {
      var tasklist = tasklists.items[i];
      Logger.log('Tasklist name: %s, ID: %s', tasklist.title, tasklist.id);
    }
  } else {
    Logger.log('No tasklists found.');
  }
}
