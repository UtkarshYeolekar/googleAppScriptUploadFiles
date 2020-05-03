const emailTo = "noreply@somedomain.com"
const RootdirectoryName = "Demo";
const sheetName = 'responses';
function doPost(e) {
    try {
        let email = e.parameter.email;
        let fileUrls = uploadFileToGoogleDrive(email, e);
        console.log('User Directory & file Created');
        return ContentService // return json success results
            .createTextOutput(
                JSON.stringify({
                    "result": "success",
                    "data": JSON.stringify(fileUrls)
                }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) { // if error return this
      console.error(error);
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": error }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
// new property service GLOBAL
var SCRIPT_PROP = PropertiesService.getScriptProperties();
// see: https://developers.google.com/apps-script/reference/properties/
/**
* select the sheet
*/
function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
}

function uploadFileToGoogleDrive(email,e) {
    try {
        var RootDirectory = createRootDirectory(RootdirectoryName);
        var userDirectory = createUserDirectory(RootDirectory,email);
        var totalFiles = e.parameter.totalFiles;
        var fileUrls = new Array(totalFiles);
        
        for (var i = 0; i < totalFiles; i++) {
           /* 
            Getting file name and content, as doPost convert the arrays in the
            request as, string properties in the object:
            Example Post Request Body: 
            files = [ 
            0 : {
                 'fileContent': 'actual file content',
                 'fileName': 'somefilename'
                }
            ]
            
            Gets converted into string keys in "e" :
            e.parameters.files[0][fileName]
            e.parameters.files[0][fileContent]
            
           */
            let fileNameProp = 'files[' + i + '][filename]';
            let fileContentProp = 'files[' + i + '][fileContent]';

            let fileName = e.parameter[fileNameProp];
            let fileContent = e.parameter[fileContentProp];            
            let fileUrl = createFile(fileContent,fileName, userDirectory);
            fileUrls[i] = fileUrl;
        }
        let recordCreated =  record_data(e, fileUrls);
        notify(e, fileUrls);
        
        return fileUrls;
      
    } catch (f) {
      console.error(f);
        return ContentService // return json success results
            .createTextOutput(
                JSON.stringify({
                    "result": "file upload failed",
                    "data": JSON.stringify(f)
                }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function createRootDirectory(name) {
    var dropbox = name || "Demo";
    var folders = DriveApp.getFoldersByName(dropbox);
    var folder ;
    if (folders.hasNext()) {
        folder = folders.next();
    } else {
        folder = DriveApp.createFolder(dropbox);
    }
    return folder;
}

function createUserDirectory(folder, name) {
    var userFolder = folder.createFolder(name);
    return userFolder;
}

function createFile(data, filename, folder) {
    var contentType = data.substring(5, data.indexOf(';')),
        bytes = Utilities.base64Decode(data.substr(data.indexOf('base64,') + 7)),
        blob = Utilities.newBlob(bytes, contentType, filename);
    var file = folder.createFile(blob);
    var fileUrl = file.getUrl();
    return fileUrl;
}

/**
* record_data inserts the data received from the html form submission
* e is the data received from the POST
*/
function record_data(e, fileUrls) {
    try {
        var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
        var sheet = doc.getSheetByName(sheetName); // select the responses sheet
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var nextRow = sheet.getLastRow() + 1; // get next row
        var row = [new Date()]; // first element in the row should always be a timestamp
        // loop through the header columns
        for (var i = 1; i < headers.length; i++) { // start at 1 to avoid Timestamp column
            if (headers[i].length > 0 && headers[i] == "resume") {
                row.push(JSON.stringify(fileUrls)); // add data to row
            }
            else if (headers[i].length > 0) {
                row.push(e.parameter[headers[i]]); // add data to row
            }
        }
        // more efficient to set values as [][] array than individually
        sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    }
    catch (error) {
        Logger.log(e);
    }
    finally {
        return;
    }
}

function notify(e, fileUrls){
  
  let html =
            '<body>' +
            '<h2> New Job Application </h2>' +
            '<p>Name : ' + e.parameters.name + '</p>' +
            '<p>Email : ' + e.parameters.email + '</p>' +
            '<p>Contact : ' + e.parameters.contact + '</p>' +
            '<p>Skill Sets : ' + e.parameters.skillsets + '</p>' +
            '<p>LinkedIn Url : ' + e.parameters.linkedinUrl + '</p>' +
            '<p>Files : ' + JSON.stringify(fileUrls) + '</p>' +
            '</body>';
      MailApp.sendEmail(emailTo, "New Job Application Recieved", "New Job Application Request Recieved", { htmlBody: html });
      return;
}
