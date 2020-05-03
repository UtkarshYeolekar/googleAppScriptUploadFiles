# googleAppScript
Using Google App Script to upload multiple files to google drive.

# Prerequisite

1. Create google sheet with sheet name('responses') and with following columns: Check the sample sheet in the repository

![Sample Sheet](./img/sheet.JPG?raw=true "Sample Response Sheet")

    a. timeline (description : Will auto update the record creation time).

    b. name  (description : name value passed from the html form).

    c. email (description : email value passed from the html form).

    d. contact (description : contact no value passed from the html form).

    e. resume (description : Auto populated with the google drive file url;s ).

    f. skillsets (description : skillsets value passed from the html form ).

    g. linkedinUrl (description : linkedinUrl value passed from the html form ).

2. Go to the Sheet-> Tools -> Script Editor.

3. Copy the googleAppScripts.js code into the editor.

4. Update the constant variable (emailTo) in the googleAppScripts.js/editor with your personal email.

5. Script Editor -> Run menu -> Run Function -> setup()

6. Script Editor -> Run menu -> Run Function -> setup()

7. Select the startup function -> Script Editor -> next to debug button, select function drop down -> select doPost()

8. Script Editor -> Publish menu -> Publish as web app.
    a. Change the "who has access to the app" to "Anyone, even Anonymous".
    b. Provide required permissions.
    c. click on update, copy the web app url.

9. Paste the copied web app url, into the clientScript.js -> scriptUrl variable

10. Save everything and click the submit button on the form.

![HTML FORM](./img/form.JPG?raw=true "HTML Form")
