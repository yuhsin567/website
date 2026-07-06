function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  var payload = {};

  try {
    payload = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    payload = {};
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (header) {
    var key = normalizeHeader(header);

    if (isTimestampHeader(key)) {
      return payload.submittedAt || new Date().toISOString();
    }

    var value = pickMappedValue(key, payload);
    return value === undefined ? '' : value;
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function isTimestampHeader(headerKey) {
  var timestampKeys = {
    timestamp: true,
    submittedat: true,
    time: true,
    datetime: true,
    '\u6642\u9593\u6233\u8a18': true,
    '\u6642\u9593': true,
    '\u586b\u7b54\u6642\u9593': true,
    '\u63d0\u4ea4\u6642\u9593': true
  };

  return !!timestampKeys[headerKey];
}

function normalizeHeader(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s\-*?()（）:：/]/g, '');
}

function pickMappedValue(headerKey, payload) {
  var map = {
    name: payload.name,
    '1name': payload.name,
    adults: payload.adults,
    '2adults': payload.adults,
    kids: payload.kids,
    '3kids': payload.kids,
    vegetarian: payload.vegetarian,
    vagitarian: payload.vagitarian,
    '4vagitarian': payload.vagitarian,
    attending: payload.attending,
    realinvitation: payload.realInvitation,
    '5realinvitation': payload.realInvitation,
    message: payload.message,
    anyword: payload.anyWord,
    '6anyword': payload.anyWord,
    sourcetag: payload.sourceTag,
    useragent: payload.userAgent,
    page: payload.page,
    totalguests: payload.totalGuests
  };

  return map[headerKey];
}
