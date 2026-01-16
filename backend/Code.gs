/**
 * Pixel Art Quiz Game Backend (Updated for Server-side Grading)
 * -------------------------------------------------------------
 */

const SHEET_ID = ""; 
const QUESTION_SHEET_NAME = "題目";
const RESPONSE_SHEET_NAME = "回答";

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (action === "getQuestions") {
      const questions = getQuestions(params.count || 5);
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
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "submitScore") {
      // Calculate score on server side
      const gradingResult = calculateScore(data.answers);
      const passed = gradingResult.score >= (data.passThreshold || 3); // Or defined in script
      
      const saveResult = saveScore({
        userId: data.userId,
        score: gradingResult.score,
        passed: passed,
        totalQuestions: data.answers.length
      });
      
      output.setContent(JSON.stringify({ 
        success: true, 
        data: {
            score: gradingResult.score,
            passed: passed,
            maxScore: saveResult.maxScore, // Return max score for UI
            results: gradingResult.results // Optional: return boolean array of which were correct
        } 
      }));
    } else {
      output.setContent(JSON.stringify({ success: false, message: "Invalid action" }));
    }
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.toString() }));
  }
  
  return output;
}

function getQuestions(count) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(QUESTION_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  shuffleArray(rows);
  
  return rows.slice(0, count).map(row => ({
      id: row[0],
      question: row[1],
      options: { A: row[2], B: row[3], C: row[4], D: row[5] }
      // Answer is at row[6], NOT sending it.
  }));
}

function calculateScore(userAnswers) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(QUESTION_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  // Create a map of ID -> Answer
  const answerKey = {};
  rows.forEach(row => {
    answerKey[row[0]] = row[6]; // Assuming ID at 0, Answer at 6 (G column)
  });
  
  let score = 0;
  let results = [];
  
  userAnswers.forEach(item => {
    const correct = String(answerKey[item.id]).trim().toUpperCase();
    const userAns = String(item.answer).trim().toUpperCase();
    if (correct === userAns) {
      score++;
      results.push(true);
    } else {
      results.push(false);
    }
  });
  
  return { score, results };
}

function saveScore(payload) {
  const { userId, score, passed } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(RESPONSE_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  let rowIndex = -1;
  let currentMax = score;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(userId)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const timestamp = new Date();
  
  if (rowIndex === -1) {
    sheet.appendRow([userId, 1, score, score, passed ? score : "", passed ? 1 : "", timestamp]);
  } else {
    const rowData = data[rowIndex - 1];
    const currentCount = Number(rowData[1] || 0) + 1;
    const currentTotal = Number(rowData[2] || 0) + score;
    currentMax = Math.max(Number(rowData[3] || 0), score);
    
    let firstClear = rowData[4];
    let attemptsToClear = rowData[5];
    
    if (!firstClear && passed) {
      firstClear = score;
      attemptsToClear = currentCount;
    }
    
    const range = sheet.getRange(rowIndex, 2, 1, 6);
    range.setValues([[currentCount, currentTotal, currentMax, firstClear, attemptsToClear, timestamp]]);
  }
  
  return { success: true, maxScore: currentMax };
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
