var REPEAT_OFFENDER = 'Repeat Offender';
var SENDER_COUNTS = {};
var SELECTED = {};

function loadMessages(start, batchSize) {
  Logger.log('Loading threads');
  var threads = GmailApp.getInboxThreads(start, start + batchSize);
  if (threads.length == 0) return true;

  // Get the sender of the first message from each thread
  var done = (threads.length < batchSize)
  Logger.log('Loading messages');
  var messages = GmailApp.getMessagesForThreads(threads);
  Logger.log('Loading senders');
  for (var i = 0; i < messages.length; i++) {
    var sender = messages[i][0].getFrom();
    SENDER_COUNTS[sender] = (SENDER_COUNTS[sender] || 0) + 1;
  }
  return done;
}

function sortedSenderCounts() {
  var counts = [];
  for (var sender in SENDER_COUNTS) {
    counts.push([SENDER_COUNTS[sender], sender]);
  }
  return counts.sort(function(senderCount) {
    return -senderCount[0];
  });
}

function updateUI() {
  Logger.log('Updating UI');
  // Create a section for that contains all user senders.
  var section = CardService.newCardSection()
    .setHeader("<font color=\"#1257e0\"><b>Repeat Offenders</b></font>");

  // Create a checkbox group for senders that are added in the prior section.
  var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName('offenders')
    .setOnChangeAction(CardService.newAction().setFunctionName('trackOffenders'));

  // Recreate the checkbox ui
  var senderCounts = sortedSenderCounts();
  for (var i = 0; i < senderCounts.length; i++) {
    var sender = senderCounts[i][1];
    var count = senderCounts[i][0];
    var label = count + ' - ' + sender;
    checkboxGroup.addItem(label, sender, false);
  }

  // Add the checkbox group to the section.
  section.addWidget(checkboxGroup);
  // Build the main card after adding the section.

  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
    .setTitle('Repeat Offenders')
    .setImageUrl('https://pics.freeicons.io/uploads/icons/png/13600134651644208437-512.png'))
    .addSection(section)
    .build();
}

function notifyDone() {
  alert('Done!');
}

function buildAddOn(e) {
  var start = 0;
  var batchSize = 5;
  while (true) {
    done = loadMessages(start, batchSize);
    updateUI();
    if (done) break;
    start += batchSize;
  }
  notifyDone();
}
