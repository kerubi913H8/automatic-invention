const CONFIG = {
  SPREADSHEET_ID: 'PASTE_SPREADSHEET_ID_HERE',
  TIMEZONE: 'Asia/Tokyo',
  SHEETS: {
    STAFF: 'Staff',
    EVENTS: 'Events',
    DAILY: 'Daily'
  }
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('出退勤 打刻')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function api_bootstrap() {
  const email = getActiveUserEmail_();
  if (!email) {
    return {
      ok: false,
      code: 'NO_EMAIL',
      message: 'ログインユーザーのメールが取得できません。'
    };
  }

  const staff = findStaffByEmail_(email);
  if (!staff || !staff.active) {
    return {
      ok: false,
      code: 'NOT_REGISTERED',
      message: '職員マスタに登録されていません。',
      email: email
    };
  }

  const today = formatTodayResponse_(getTodayState_(staff, new Date()));
  return {
    ok: true,
    user: {
      email: staff.email,
      name: staff.name,
      staffId: staff.staffId,
      role: staff.role
    },
    today: today
  };
}

function api_clock(action, payload) {
  validateAction_(action);
  const email = getActiveUserEmail_();
  if (!email) {
    throw new Error('ログインユーザーのメールが取得できません。');
  }

  const staff = findStaffByEmail_(email);
  if (!staff || !staff.active) {
    throw new Error('職員マスタに登録されていません。');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const now = new Date();
    const todayState = getTodayState_(staff, now);
    const updatedState = applyAction_(staff, todayState, action, payload, now);
    return {
      ok: true,
      today: updatedState
    };
  } finally {
    lock.releaseLock();
  }
}

function getActiveUserEmail_() {
  const email = Session.getActiveUser().getEmail();
  if (!email) {
    return '';
  }
  return email.trim();
}

function getSpreadsheet_() {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === 'PASTE_SPREADSHEET_ID_HERE') {
    throw new Error('CONFIG.SPREADSHEET_ID を設定してください。');
  }
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getSheet_(name) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error('シートが見つかりません: ' + name);
  }
  return sheet;
}

function findStaffByEmail_(email) {
  const sheet = getSheet_(CONFIG.SHEETS.STAFF);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return null;
  }

  const normalized = email.toLowerCase();
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowEmail = String(row[2] || '').trim().toLowerCase();
    if (rowEmail && rowEmail === normalized) {
      return {
        staffId: String(row[0] || ''),
        name: String(row[1] || ''),
        email: String(row[2] || ''),
        dept: String(row[3] || ''),
        role: String(row[4] || ''),
        active: String(row[5] || '').toUpperCase() === 'TRUE'
      };
    }
  }
  return null;
}

function getTodayState_(staff, now) {
  const dateString = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const key = dateString + '|' + staff.email.toLowerCase();
  const sheet = getSheet_(CONFIG.SHEETS.DAILY);
  const finder = sheet.getRange('A:A').createTextFinder(key).matchEntireCell(true);
  const match = finder.findNext();

  if (match) {
    const row = sheet.getRange(match.getRow(), 1, 1, 12).getValues()[0];
    return mapDailyRow_(row);
  }

  return {
    key: key,
    date: dateString,
    staffId: staff.staffId,
    name: staff.name,
    email: staff.email,
    inTime: '',
    outTime: '',
    breakStart: '',
    breakMinutes: 0,
    lastAction: '',
    lastTimestamp: '',
    workMinutes: 0,
    onBreak: false
  };
}

function mapDailyRow_(row) {
  const breakStart = row[7];
  return {
    key: row[0],
    date: row[1],
    staffId: row[2],
    name: row[3],
    email: row[4],
    inTime: row[5] || '',
    outTime: row[6] || '',
    breakStart: breakStart || '',
    breakMinutes: Number(row[8] || 0),
    lastAction: row[9] || '',
    lastTimestamp: row[10] || '',
    workMinutes: Number(row[11] || 0),
    onBreak: Boolean(breakStart)
  };
}

function applyAction_(staff, todayState, action, payload, now) {
  const dateString = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  if (todayState.outTime) {
    throw new Error('本日はすでに退勤済みです。');
  }

  const newState = Object.assign({}, todayState, {
    date: dateString,
    staffId: staff.staffId,
    name: staff.name,
    email: staff.email
  });

  switch (action) {
    case 'IN':
      if (newState.inTime) {
        throw new Error('出勤はすでに打刻されています。');
      }
      newState.inTime = now;
      break;
    case 'OUT':
      if (!newState.inTime) {
        throw new Error('出勤打刻がありません。');
      }
      if (newState.breakStart) {
        throw new Error('休憩終了後に退勤してください。');
      }
      newState.outTime = now;
      newState.workMinutes = calculateWorkMinutes_(newState.inTime, newState.outTime, newState.breakMinutes);
      break;
    case 'BREAK_START':
      if (!newState.inTime) {
        throw new Error('出勤打刻がありません。');
      }
      if (newState.breakStart) {
        throw new Error('すでに休憩中です。');
      }
      newState.breakStart = now;
      break;
    case 'BREAK_END':
      if (!newState.breakStart) {
        throw new Error('休憩開始の打刻がありません。');
      }
      const diffMinutes = Math.floor((now.getTime() - newState.breakStart.getTime()) / 60000);
      newState.breakMinutes = Math.max(0, Number(newState.breakMinutes || 0) + diffMinutes);
      newState.breakStart = '';
      break;
    default:
      throw new Error('不正なアクションです。');
  }

  newState.lastAction = action;
  newState.lastTimestamp = now;
  newState.onBreak = Boolean(newState.breakStart);

  appendEvent_(staff, action, payload, now, dateString);
  upsertDaily_(newState);

  return formatTodayResponse_(newState);
}

function validateAction_(action) {
  const allowed = ['IN', 'OUT', 'BREAK_START', 'BREAK_END'];
  if (allowed.indexOf(action) === -1) {
    throw new Error('不正なアクションです。');
  }
}

function appendEvent_(staff, action, payload, now, dateString) {
  const sheet = getSheet_(CONFIG.SHEETS.EVENTS);
  const note = truncate_(payload && payload.note ? payload.note : '', 200);
  const userAgent = truncate_(payload && payload.userAgent ? payload.userAgent : '', 400);
  sheet.appendRow([
    now,
    dateString,
    staff.staffId,
    staff.name,
    staff.email,
    action,
    note,
    userAgent
  ]);
}

function upsertDaily_(state) {
  const sheet = getSheet_(CONFIG.SHEETS.DAILY);
  const finder = sheet.getRange('A:A').createTextFinder(state.key).matchEntireCell(true);
  const match = finder.findNext();
  const row = [
    state.key,
    state.date,
    state.staffId,
    state.name,
    state.email,
    state.inTime,
    state.outTime,
    state.breakStart,
    state.breakMinutes,
    state.lastAction,
    state.lastTimestamp,
    state.workMinutes
  ];

  if (match) {
    sheet.getRange(match.getRow(), 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function calculateWorkMinutes_(inTime, outTime, breakMinutes) {
  const diffMinutes = Math.floor((outTime.getTime() - inTime.getTime()) / 60000);
  const result = diffMinutes - Number(breakMinutes || 0);
  return Math.max(0, result);
}

function truncate_(value, maxLength) {
  const text = String(value || '');
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength);
}

function formatTodayResponse_(state) {
  return {
    date: state.date,
    lastAction: state.lastAction,
    lastTimestamp: formatDateTime_(state.lastTimestamp),
    inTime: formatDateTime_(state.inTime),
    outTime: formatDateTime_(state.outTime),
    breakMinutes: Number(state.breakMinutes || 0),
    workMinutes: Number(state.workMinutes || 0),
    onBreak: Boolean(state.breakStart)
  };
}

function formatDateTime_(value) {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  return Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}
