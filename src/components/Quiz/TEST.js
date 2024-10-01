function doPost(e) {
  // Check if the event object is defined
  if (!e) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: "No event object" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = SpreadsheetApp.openById(
    "1YsT6ByxNGYZ9db1IRbucPHfD4kTY2DVo9aOiWzZIgNA"
  ).getActiveSheet();

  // Ensure postData is defined
  if (!e.postData || !e.postData.contents) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: "No post data" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: "Invalid JSON format" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Add single quote before phone number to preserve leading zero
  var phoneNumber = "'" + data.phone;

  // Get the current date and format it
  var currentDate = new Date();
  var formattedDate = Utilities.formatDate(
    currentDate,
    Session.getScriptTimeZone(),
    "dd/MM/yyyy HH:mm:ss"
  );
  var nameWithDate = `${data.name} (${formattedDate})`;

  // Append data to Google Sheets
  sheet.appendRow([
    nameWithDate,
    data.dob,
    phoneNumber,
    data.email,
    data.school,
    data.score,
  ]);

  // Format the phone number column
  formatPhoneNumberColumn(sheet);

  // Remove rows without score
  removeRowsWithoutScore(sheet);

  // Sort the sheet
  sortSheet(sheet);

  // Add ranking
  addRanking(sheet);

  // Return success message
  return ContentService.createTextOutput(
    JSON.stringify({ result: "success", data: data })
  ).setMimeType(ContentService.MimeType.JSON);
}
