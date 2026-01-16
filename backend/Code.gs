/**
 * Pixel Art Quiz Game Backend
 * ----------------------------
 * 1. Create a Google Sheet.
 * 2. Create two tabs: "Questions" (題目) and "Responses" (回答).
 * 3. "Questions" headers: [ID, Question, OptionA, OptionB, OptionC, OptionD, Answer]
 *    (Assuming column A=ID, B=Question, C=A, D=B, E=C, F=D, G=Answer)
 * 4. "Responses" headers: [UserID, PlayCount, TotalScore, MaxScore, FirstClearScore, AttemptsWait, LastPlayed]
 * 5. Deploy this script as a Web App (Execute as: Me, Who has access: Anyone).
 */

const SHEET_ID = ""; // Leave empty if attached to the sheet, or paste ID here.
const QUESTION_SHEET_NAME = "題目";
const RESPONSE_SHEET_NAME = "回答";

function doGet(e) {
  const params = e.parameter;
  const action = params.action;

  // Simple CORS setup
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (action === "getQuestions") {
      const questions = getQuestions(params.count || 5); // Default 5 items
      output.setContent(JSON.stringify({ success: true, data: questions }));
    } else {
      output.setContent(JSON.stringify({ success: false, message: "Invalid action" }));
    }
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.toString() }));
  }

  return output;
}

function doPost(e) {
  // Handle POST requests for score submission
  // Expecting JSON payload
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "submitScore") {
      const result = saveScore(data);
      output.setContent(JSON.stringify({ success: true, data: result }));
    } else {
      output.setContent(JSON.stringify({ success: false, message: "Invalid action" }));
    }
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.toString() }));
  }
  
  return output;
}

/**
 * Get N random questions without the answer key.
 */
function getQuestions(count) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(QUESTION_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  // Header is row 0
  const headers = data[0];
  const rows = data.slice(1);
  
  // Randomize
  shuffleArray(rows);
  
  // Pick top N
  const selected = rows.slice(0, count).map(row => {
    return {
      id: row[0],
      question: row[1],
      options: {
        A: row[2],
        B: row[3],
        C: row[4],
        D: row[5]
      },
      // DO NOT RETURN ANSWER
    };
  });
  
  return selected;
}

/**
 * Save score and update user stats.
 */
function saveScore(payload) {
  const { userId, score, passed, totalQuestions } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(RESPONSE_SHEET_NAME);
  
  const data = sheet.getDataRange().getValues();
  // Check if user exists
  // Column A is UserID (index 0)
  
  let rowIndex = -1;
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(userId)) {
      rowIndex = i + 1; // 1-based index for Sheet API interaction if needed, but we can use `data` array index
      break;
    }
  }
  
  const timestamp = new Date();
  
  if (rowIndex === -1) {
    // New User
    // Headers: [ID, PlayCount, TotalScore, MaxScore, FirstClearScore, AttemptsToClear, LastPlayed]
    // Note: "TotalScore" logic depends on game. Assuming cumulative? Or just current? 
    // Requirement: "若同 ID 已通關過，後續分數不覆蓋，僅在同列增加闖關次數"
    // Requirement doesn't explicitly say "cumulative". But "總分" typically serves as cumulative.
    // "FirstClearScore": Record only if passed and not recorded yet.
    // "AttemptsToClear": Count + 1 if passed? Or just current `PlayCount` at time of clear?
    // Let's interpret:
    // PlayCount = 1
    // TotalScore = score (Cumulative?) -> The requirement says "成績計算...記錄". Let's assume cumulative for "總分".
    // MaxScore = score
    // FirstClearScore = passed ? score : ""
    // AttemptsToClear = passed ? 1 : ""
    
    const newRow = [
      userId, 
      1, 
      score, 
      score, 
      passed ? score : "", 
      passed ? 1 : "", 
      timestamp
    ];
    sheet.appendRow(newRow);
  } else {
    // Existing User
    const rowData = data[rowIndex - 1]; // data includes header
    // Columns: 0:ID, 1:Count, 2:Total, 3:Max, 4:FirstClear, 5:Attempts, 6:Time
    
    const currentCount = Number(rowData[1] || 0) + 1;
    const currentTotal = Number(rowData[2] || 0) + score;
    const currentMax = Math.max(Number(rowData[3] || 0), score);
    
    let firstClear = rowData[4];
    let attemptsToClear = rowData[5];
    
    // Logic: If not cleared before (firstClear is empty) and now passed
    if (!firstClear && passed) {
      firstClear = score;
      attemptsToClear = currentCount;
    }
    
    // Update row
    // getRange(row, column, numRows, numColumns)
    // Update specific cells to avoid overwriting race conditions somewhat, but simpler to overwrite row or specific range
    const range = sheet.getRange(rowIndex, 2, 1, 6); // Update cols 2 to 7 (B to G)
    range.setValues([[currentCount, currentTotal, currentMax, firstClear, attemptsToClear, timestamp]]);
  }
  
  return { success: true };
}

function getSpreadsheet() {
   return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
