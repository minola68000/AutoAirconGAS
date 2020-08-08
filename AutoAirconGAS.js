
// トリガーセッテによって、いずれかのセルが編集された段階でコールされる
var CELL_SHOULD_CONTROL_AIR_CON  = 'A2';
var CELL_LAST_SHOULD_CONTROL     = 'A3';

var CELL_ON_REQUEST              = 'B2';
var CELL_LAST_ON_REQUEST         = 'B3';
var CELL_ON_TRIGGER              = 'B4';
var CELL_ON_COMMAND              = 'C2';

var CELL_OFF_REQUEST             = 'D2';
var CELL_LAST_OFF_REQUES         = 'D3';
var CELL_OFF_TRIGGER             = 'D4';
var CELL_OFF_COMMAND             = 'E2';

var CELL_DRY_REQUEST             = 'F2';
var CELL_LAST_DRY_REQUES         = 'F3';
var CELL_DRY_COMMAND             = 'G2';

var URL_AIRCON_ON  = 'https://maker.ifttt.com/trigger/startAirCon/with/key/YOUR_IFTTT_USER_KEY';
var URL_AIRCON_OFF = 'https://maker.ifttt.com/trigger/stopAirCon/with/key/YOUR_IFTTT_USER_KEY';
var URL_AIRCON_DRY = 'https://maker.ifttt.com/trigger/dryAirCon/with/key/YOUR_IFTTT_USER_KEY';
var URL_NOTIFY =     'https://maker.ifttt.com/trigger/SendNotification/with/key/YOUR_IFTTT_USER_KEY';

var ON  = '1';
var OFF = '0';


var USE_FETCH = true;
var USE_CELL = ! USE_FETCH;
var USE_NOTIFICATION = true;
var USE_STOPPER = false;
var IS_DEBUG = false;

function decideAirConOn() {

  var mySheet = SpreadsheetApp.getActiveSheet();
  var myCell = mySheet.getActiveCell();

  // 監視対象のセルがアップデートされた場合だけ反応する
  if ( ! IS_DEBUG) {
    if (7 < myCell.getColumn() || myCell.getRow() != 2) return;
  }
  Logger.log('Start decision');

  var g_shouldControlAirCon  = getVal(CELL_SHOULD_CONTROL_AIR_CON);
  var g_isOnRequest          = getVal(CELL_ON_REQUEST);
  var g_isOffRequest         = getVal(CELL_OFF_REQUEST);
  var g_isDryRequest         = getVal(CELL_DRY_REQUEST);
  Logger.log('isOnRequest:'    + g_isOnRequest);
  Logger.log('isOffRequest:'   + g_isOffRequest);
  Logger.log('g_isDryRequest:' + g_isDryRequest);

  // 自動運転中フラグが立っているときだけエアコンオン
  //////////////////////////////////////////////////////////////////////    
  if (isOnRequest()) {
    Logger.log('Set command on');
    if (g_shouldControlAirCon == ON) {
      if (USE_FETCH)        UrlFetchApp.fetch(URL_AIRCON_ON);
      if (USE_CELL)         setVal(CELL_ON_COMMAND, new Date());
      if (USE_NOTIFICATION) sendNotification('クーラーオン！');
      g_isOnRequest = '[Executed]' + g_isOnRequest;
      setVal(CELL_ON_REQUEST, OFF);
      
      if (USE_STOPPER) {
        deleteTrigger();
        var onOvertimeTrigger = ScriptApp.newTrigger('autoOff').timeBased().after(30 * 60 * 1000).create();
        Logger.log('trigger:' + onOvertimeTrigger);
        setVal(CELL_OFF_TRIGGER, onOvertimeTrigger);
      }
    }
    
    setVal(CELL_LAST_ON_REQUEST, g_isOnRequest + ' ' + new Date());
    // 他のコマンドは初期化
    setVal(CELL_DRY_REQUEST, OFF);
    setVal(CELL_OFF_REQUEST, OFF);
   
  }

  
  // 自動運転中フラグが立っているときだけエアコンオフ
  //////////////////////////////////////////////////////////////////////
  if (isOffRequest()) {
    Logger.log('Set command off');
    if (g_shouldControlAirCon == ON) {
      if (USE_FETCH)        UrlFetchApp.fetch(URL_AIRCON_OFF);
      if (USE_CELL)         setVal(CELL_OFF_COMMAND, new Date());
      if (USE_NOTIFICATION) sendNotification('クーラーオフ！');
      g_isOffRequest = '[Executed]' + g_isOffRequest;
      setVal(CELL_OFF_REQUEST, OFF);

      if (USE_STOPPER) {
        deleteTrigger();
        var onOvertimeTrigger = ScriptApp.newTrigger('autoOn').timeBased().after(30 * 60 * 1000).create();
        Logger.log('trigger:' + onOvertimeTrigger);
        setVal(CELL_ON_TRIGGER, onOvertimeTrigger);
      }
    }
    
    setVal(CELL_LAST_OFF_REQUES, g_isOffRequest + ' ' + new Date());
    // 他のコマンドは初期化
    setVal(CELL_DRY_REQUEST, OFF);
    setVal(CELL_ON_REQUEST, OFF);
  }
  
  // ドライ制御
  //////////////////////////////////////////////////////////////////////
  if (isDryRequest()) {
    Logger.log('Set command dry');
    if (g_shouldControlAirCon == ON) {
      if (USE_FETCH)        UrlFetchApp.fetch(URL_AIRCON_DRY);
      if (USE_CELL)         setVal(CELL_DRY_COMMAND, new Date());
      if (USE_NOTIFICATION) sendNotification('ドライチェンジ！');
      g_isDryRequest = '[Executed]' + g_isDryRequest;
      setVal(CELL_DRY_REQUEST, OFF);
    }
    setVal(CELL_LAST_DRY_REQUES, g_isDryRequest + ' ' + new Date());
    // 他のコマンドは初期化
    setVal(CELL_ON_REQUEST, OFF);
    setVal(CELL_OFF_REQUEST, OFF);
  }
    
  function autoOff() {
    UrlFetchApp.fetch(URL_AIRCON_OFF);
    deleteTrigger();
  }
  
  function autoOn() {
    UrlFetchApp.fetch(URL_AIRCON_ON);
    deleteTrigger();
  }

  function deleteTrigger() {
    var trigger = getVal(CELL_OFF_TRIGGER);
    if (trigger.length > 0) ScriptApp.deleteTrigger(trigger);
    
    trigger = getVal(CELL_ON_TRIGGER);
    if (trigger.length > 0) ScriptApp.deleteTrigger(trigger);
  }
  
  function deleteTriggerAll() {
    var allTriggers = ScriptApp.getScriptTriggers();
    for(var i=0; i < allTriggers.length; i++) {
      //ScriptApp.deleteTrigger(allTriggers[i]);
      
    }
  }
  
  // 自動運転中フラグを待避
  setVal(CELL_LAST_SHOULD_CONTROL, g_shouldControlAirCon);
  
  function isOnRequest() {
    return (g_isOnRequest != OFF);
  }

  function isOffRequest() {
    return (g_isOffRequest != OFF);
  }

  function isDryRequest() {
    return (g_isDryRequest != OFF);
  }
  
  function getVal(target) {
    return mySheet.getRange(target).getValue();
  }

  function setVal(target, value) {
    return mySheet.getRange(target).setValue(value);
  }

}

function sendNotification(message) {
  if (message == null) message = 'test';
  UrlFetchApp.fetch(URL_NOTIFY + '?value1=[' + SpreadsheetApp.getActiveSpreadsheet().getName() + '] ' + message);
}

function deploy() {

  Logger.log(SpreadsheetApp.getActiveSheet().getActiveCell().getColumn());
  
  console.log(UrlFetchApp.fetch('https://maker.ifttt.com/trigger/deploy/with/key/YOUR_IFTTT_USER_KEY'));

  var onOvertimeTrigger = ScriptApp.newTrigger('autoOff').timeBased().after(0.2 * 60 * 1000).create();
  ScriptApp.deleteTrigger(onOvertimeTrigger);
}