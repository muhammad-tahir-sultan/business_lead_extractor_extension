function doPost(e) {
    try {
        var payload = JSON.parse(e.postData.contents);
        var action = payload.action || 'append';
        var data = payload.data || payload; // fallback to older format

        var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        var sheet;
        var resultUrl = spreadsheet.getUrl();

        var expectedHeaders = [
            'name', 'rating', 'reviews', 'url', 'website', 'phone', 'email', 'text_snippet',
            'Sent Status', 'Next Follow-Up Date', 'Follow-Up Stage', 'date_scraped',
            'source', 'notes', 'Linkedin URL', 'Facebook'
        ];

        if (action === 'new') {
            var newSpreadsheet = SpreadsheetApp.create('Maps Leads - ' + new Date().toISOString().split('T')[0]);
            sheet = newSpreadsheet.getActiveSheet();
            resultUrl = newSpreadsheet.getUrl();

            sheet.appendRow(expectedHeaders);
            sheet.getRange("A1:P1").setFontWeight("bold").setBackground("#f3f3f3");
            sheet.setFrozenRows(1);

            appendDataToSheet(sheet, expectedHeaders, data);
        }
        else if (action === 'new_tab') {
            var newTabName = 'Leads - ' + new Date().toLocaleTimeString();
            sheet = spreadsheet.insertSheet(newTabName);

            sheet.appendRow(expectedHeaders);
            sheet.getRange("A1:P1").setFontWeight("bold").setBackground("#f3f3f3");
            sheet.setFrozenRows(1);

            appendDataToSheet(sheet, expectedHeaders, data);
        }
        else {
            sheet = spreadsheet.getActiveSheet();
            var lastCol = Math.max(sheet.getLastColumn(), 1);
            var lastRow = Math.max(sheet.getLastRow(), 1);

            var headersRange = sheet.getRange(1, 1, 1, lastCol);
            var currentHeaders = headersRange.getValues()[0];

            // If the sheet is completely blank, initialize the headers
            if (currentHeaders[0] === "") {
                currentHeaders = expectedHeaders;
                sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
                sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold").setBackground("#f3f3f3");
                sheet.setFrozenRows(1);
            } else {
                // Ensure all our expected fields exist in the header row
                for (var h = 0; h < expectedHeaders.length; h++) {
                    var fieldName = expectedHeaders[h];
                    if (currentHeaders.indexOf(fieldName) === -1) {
                        currentHeaders.push(fieldName);
                        sheet.getRange(1, currentHeaders.length).setValue(fieldName);
                        sheet.getRange(1, currentHeaders.length).setFontWeight("bold").setBackground("#f3f3f3");
                    }
                }
            }

            appendDataToSheet(sheet, currentHeaders, data);
        }

        return ContentService.createTextOutput(JSON.stringify({ "status": "success", "rowsAdded": data.length, "url": resultUrl }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function appendDataToSheet(sheet, currentHeaders, data) {
    if (data.length === 0) return;

    var rowsToAppend = [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var row = [];
        for (var c = 0; c < currentHeaders.length; c++) {
            var header = currentHeaders[c];
            row[c] = item[header] !== undefined ? item[header] : '';
        }
        rowsToAppend.push(row);
    }

    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rowsToAppend.length, currentHeaders.length).setValues(rowsToAppend);
}
