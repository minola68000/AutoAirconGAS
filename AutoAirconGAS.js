function decideAirConOn() {

  var CELL_SHOULD_CONTROLL_AIR_CON = 'A2';

  var CELL_IS_ON_REQUEST           = 'B2';
  var CELL_LAST_ON_REQUEST         = 'B3';
  var CELL_ON_COMMAND              = 'C2';

  var CELL_IS_OFF_REQUEST          = 'D2';
  var CELL_LAST_OFF_REQUES         = 'D3';
  var CELL_OFF_COMMAND             = 'E2';
  var ON  = '1';
  var OFF = '0';

  var URL_AIRCON_ON  = 'https://maker.ifttt.com/trigger/startAirCon/with/key/YOUR_IFTTT_USER_KEY';
  var URL_AIRCON_OFF = 'https://maker.ifttt.com/trigger/stopAirCon/with/key/YOUR_IFTTT_USER_KEY';
  
  var USE_FETCH = true;
  var USE_CELL = ! USE_FETCH;
  var IS_DEBUG = false;

  var mySheet = SpreadsheetApp.getActiveSheet();
  var myCell = mySheet.getActiveCell();

  // 監視対象のセルがアップデートされた場合だけ反応する
  if ( ! IS_DEBUG) {
    if (5 < myCell.getColumn() || myCell.getRow() != 2) return;
  }
  console.log('Start decision');

  var g_shouldControllAirCon = getVal(CELL_SHOULD_CONTROLL_AIR_CON);
  var g_isOnRequest          = getVal(CELL_IS_ON_REQUEST);
  var g_isOffRequest         = getVal(CELL_IS_OFF_REQUEST);
  console.log('isOnRequest:' + isOnRequest);
  console.log('isOffRequest:' + isOffRequest);

  // 自動運転中フラグが立っているときだけエアコンオン
  if (g_shouldControllAirCon == ON) {
    
    if (isOnRequest()) {
      console.log('Set command on');
      if (USE_FETCH) UrlFetchApp.fetch(URL_AIRCON_ON);
      if (USE_CELL) setVal(CELL_ON_COMMAND, new Date());
      setVal(CELL_LAST_ON_REQUEST, g_isOnRequest + ' ' + new Date());
      setVal(CELL_IS_ON_REQUEST, OFF);
    }
    
    // 自動運転中フラグが立っているときだけエアコンオフ
    if (isOffRequest()) {
      console.log('Set command off');
      if (USE_FETCH) UrlFetchApp.fetch(URL_AIRCON_OFF);
      if (USE_CELL) setVal(CELL_OFF_COMMAND, new Date());
      setVal(CELL_LAST_OFF_REQUES, g_isOffRequest + ' ' + new Date());
      setVal(CELL_IS_OFF_REQUEST, OFF);
    }

  }
  
  function isOnRequest() {
    return (g_isOnRequest != OFF);
  }

  function isOffRequest() {
    return (g_isOffRequest != OFF);
  }
  
  function getVal(target) {
    return mySheet.getRange(target).getValue();
  }

  function setVal(target, value) {
    return mySheet.getRange(target).setValue(value);
  }

}

function deploy() {

  console.log(SpreadsheetApp.getActiveSheet().getActiveCell().getColumn());
  
  console.log(UrlFetchApp.fetch('https://maker.ifttt.com/trigger/deploy/with/key/YOUR_IFTTT_USER_KEY'));
}