﻿/*************************************************************************
*
* @libraryName	: MKLogMonitor;
* @author		: Maxim Klimov;
* @mail			: maxim@klimoff.info;
* @license 		: MIT
* Date Created 	: 06/12/2016
* Description	: Reads and notifications on events in log file 
*
* Called from:
* - ScriptLibrary	
*
* Dependencies:
* - wizard 
* - 2 * format
* - 2 * dbdict
* - 2 * ScriptLibrary
*
* Change log:
* - https://github.com/maximklimov/hpsm
*
**************************************************************************/

var $ = system.functions; // (c) Hewlett-Packard Company
var $c = lib.c.$; // (c) Hewlett-Packard Company @author Hao Ding <hao.ding@hp.com>
var _ = lib.Underscore.require(); // "Underscore.js 1.6.0 \n http://underscorejs.org \n (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors \n Underscore may be freely distributed under the MIT license."
var slName = 'MKLogMonitor', libWhere = 'sl - ' + slName + ': ', sTime = new Date();

/** @PreConfig_START */
var prefix = 'ig'// = 'YOUR_PREFIX'; /** @NOTICE Please change only once - first start, and never more modifications; @default prefix = mk **/
/** @PreConfig_END */

vars['$prefix'] = $.nullsub(prefix, 'mk');
if ($.filename(record) == 'ScriptLibrary') runLogMonitoring();

function runLogMonitoring() {
	var setConfig = !$.nullsub(vars['$G.ig.bg'], vars['$G.bg']) ? $.nullsub(vars['$mk.LMC.setConfig'], true) : false;
	if (setConfig == true) {
		setLogMonitorConfig();
	} else {
		$c(vars['$prefix'] + 'logmonitorconfig', SCFILE_READONLY).select('true').iterate(function (file) {
			_.forEach(file['logs'], function(item, i) {
				getLogMonitoring(file['pathLogs'][i], file['logs'][i], file['regExp']);
			});
		});
	}
}

function getLogMonitoring(listPath, listName, aRegexp) {
	if ($._null(listName)) return false;
	if ($._null(listPath)) listPath = "..\\logs\\";
	var logFile = readFile(listPath.replace(/\\/g, '\\\\') + listName, "t" );
	if (logFile == -1) return "NOT FOUND file " + (listPath + listName);
	var aLines = logFile.split('\n');
	logFile = null; // Освобождаем память - зачищаем переменную с содержанием файла
	var reg = createRegExp(aRegexp);
	var lastLogTime, lastLogLine, inc = 0;
	$c(vars['$prefix'] + 'logmonitor', SCFILE_READONLY).select('SELECT TOP 1 log.* FROM ' + vars['$prefix'] + 'logmonitor log WHERE logName="' + listName + '" ORDER BY timeStamp DESC').iterate(function(file) {//.uniqueResult();
		lastLogTime = file['timeStampLog'];
		lastLogLine = file['defaultLine'][0];//"  " + file['defaultLine'][0];
		inc = _.lastIndexOf(aLines, lastLogLine);
	});
	vars['$i'] = 0;
	_.forEach(aLines, function(item, i) {
		if (i >= (inc + 1)) {
			if (reg.test(item)) {
				var fLog = new SCFile(vars['$prefix'] + 'logmonitor');
				fLog['logName'] = listName;
				fLog['uid'] = getUID();
				if (!/^\s+[0-9+]/.test(aLines[i+1])) fLog['half'] = true;
				fLog['defaultLine'][0] = item;//.replace(/^\s+/, '');
				var rege = new RegExp(/\d{2,4}\/\d+\/\d{2,4}\s\d+:\d+:\d+/);
				if (rege.test(item)) {
					var aDate = rege.exec(item);
					if ($.type(aDate) == 8) {
						fLog['timeStampLog'] = aDate[0];
						fLog['timeStamp'] = new Date(fLog['timeStampLog']);
					}
					vars['$i']++;
					fLog.doInsert();
				} else {
					print(libWhere + 'Дата в строке не распознана: ' + item);
				}
			}
		}
    });	
	print(libWhere + listName + ' error: ' + vars['$i'] + ' - ' + $.lng(aLines));
	aLines = null;
}
	
function getUID() {
	return $.tolower(lib.UUID.generateUUID().replace(/-/g,''));
}	
	
function createRegExp(aValue) {
	var sReg = $.strraw(aValue, '|');//' E | W ';
	return new RegExp(sReg);
}

function setLogMonitorConfig(objConfig) {
	var wizard = checkModuleElements()
	lib.MKlimovTools.runWizard(wizard);
}

function checkModuleElements() {
	var prefix = getPrefix(vars['$prefix']);//$.nullsub(prefix, 'mk');
	var ModuleElements = {
		'ScriptLibrary' : 'MKlimovTools',		
		'dbdict' 	: prefix + 'logmonitor',
		'dbdict1' 	: prefix + 'logmonitorconfig',	
		'wizard' 	: prefix + 'logmonitorConfig',
		'format' 	: prefix + 'logmonitorConfig',
		'format1' 	: prefix + 'logmonitor',
		'schedule'	: $.toupper(prefix) + ' Log Monitor'
	};
	_.forEach(ModuleElements, function(item, key) {
		createModuleElement(key, item);
	});
	return ModuleElements['wizard'];
}

function createModuleElement(key, name) {
	var prefixModule = getPrefix(vars['$prefix']);//$.nullsub(prefix, 'mk');
	var metaData = {
		'ScriptLibrary'	: '<model name="ScriptLibrary"><keys><name sctype="string">MKlimovTools</name></keys><instance recordid="MKlimovTools"><name type="string">MKlimovTools</name><script type="string">/*************************************************************************|mkdelimiter|*|mkdelimiter|* @libraryName	: MKlimovTools|mkdelimiter|* @author		: Maxim Klimov|mkdelimiter|* @mail			: maxim@klimoff.info|mkdelimiter|* @license 	: MIT|mkdelimiter|* @Created 	: 2014|mkdelimiter|* @Description	: Tools |mkdelimiter|*|mkdelimiter|* Called from:|mkdelimiter|* - ScriptLibrary|mkdelimiter|*|mkdelimiter|* Change log:|mkdelimiter|* - https://github.com/maximklimov|mkdelimiter|*|mkdelimiter|**************************************************************************/|mkdelimiter|var $ = system.functions; /* (c) Hewlett-Packard Company */|mkdelimiter|var $c = lib.c.$; /* (c) Hewlett-Packard Company @author Hao Ding &lt;hao.ding@hp.com&gt; */|mkdelimiter|var _ = lib.Underscore.require(); /* "Underscore.js 1.6.0 \n http://underscorejs.org \n (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters &amp; Editors \n Underscore may be freely distributed under the MIT license." */|mkdelimiter|var slName = "MKlimovTools", libWhere = "sl - " + slName + ": ";|mkdelimiter|function createSCFile(xmlstr, fileName, query) {|mkdelimiter|	var filename = fileName;|mkdelimiter|	var file = new SCFile(filename);|mkdelimiter|	var rc = file.doSelect(query);|mkdelimiter|	if (rc == RC_SUCCESS) {|mkdelimiter|		var oldSysModTime = file["sysmodtime"];|mkdelimiter|		var oldFile = file;|mkdelimiter|		file.setRecord(xmlstr);			|mkdelimiter|		var result = file.doUpdate();|mkdelimiter|		return "updated record: (" + result + ") " + RCtoString( result ) + "; sysmodtime = " + $.str(file["sysmodtime"]);|mkdelimiter|    } else {|mkdelimiter|    	file.setRecord(xmlstr);|mkdelimiter|		var result = file.doInsert();|mkdelimiter|		return "insert record: " + RCtoString( result );|mkdelimiter|	}|mkdelimiter|}|mkdelimiter|function createDB(fileXML, fileName, deleteActions) {|mkdelimiter|	var fileNew = new SCFile("dbdict");|mkdelimiter|	fileNew.setRecord(fileXML);|mkdelimiter|	var fileName = fileNew["name"];|mkdelimiter|	var file = new SCFile("dbdict");|mkdelimiter|	var rc = file.doSelect("name=\"" + fileName + "\"");|mkdelimiter|	if (!deleteActions) {|mkdelimiter|		if (rc != RC_SUCCESS) {	|mkdelimiter|			var joinDefs = new SCFile("joindefs", SCFILE_READONLY);|mkdelimiter|	        if (joinDefs.doSelect("join.name=\"" + fileName + "\"") != RC_SUCCESS) return "CREATE: " + fileName + " = " + $.rtecall("callrad", 1, "sm.hotfix.create.dbdict", ["file"], [fileNew], false);|mkdelimiter|			return "NOT CREATE: " + file["name"] + " Table in JoinDefs";|mkdelimiter|		} |mkdelimiter|		if (!$.same(file["field"] , fileNew["field"])) {|mkdelimiter|			var code = 201;	|mkdelimiter|			var result = $.rtecall("callrad", 1, "sm.hotfix.update.dbdict", ["record", "second.record", "number1"], [fileNew, file, code], false);|mkdelimiter|			return "UPDATE: " + fileName + " = " + result;	|mkdelimiter|		}|mkdelimiter|	}|mkdelimiter|	if (deleteActions) return "DELETE: " + fileName + " = " + file.doRemove();	/* Does not work - deletes only dbdict but not deleted SQL table by RMDB */|mkdelimiter|}|mkdelimiter|function runWizard(wizardName) { /* (c) Hewlett-Packard Company */|mkdelimiter|	var rteReturnValue = new SCDatum();|mkdelimiter|	var argNames = new SCDatum();|mkdelimiter|	var argVals = new SCDatum();|mkdelimiter|	argVals.setType(8);     /*type array*/|mkdelimiter|	argNames.setType(8);    /*type array*/|mkdelimiter|	var argVal;|mkdelimiter|	argVal=new SCDatum();|mkdelimiter|	      argVal.setType(2); /*string*/                           |mkdelimiter|	      argVal = "name";|mkdelimiter|	      argNames.push(argVal);|mkdelimiter|	argVal=new SCDatum();|mkdelimiter|	      argVal.setType(2); /*string*/                           |mkdelimiter|	      argVal = wizardName;|mkdelimiter|	      argVals.push(argVal);      |mkdelimiter|	var ret = system.functions.rtecall("callrad", |mkdelimiter|	                               rteReturnValue, |mkdelimiter|	                               "wizard.run", |mkdelimiter|	                               argNames, |mkdelimiter|	                               argVals,|mkdelimiter|	                               true);|mkdelimiter|}|mkdelimiter|function checkLockObject(id, filename) {	/* Проверяем id записи на присутствие в занятых записях (m.klimov) 20141123 */|mkdelimiter|	if (filename) id = filename+";"+id;|mkdelimiter|	var reg = new RegExp(id);|mkdelimiter|	var locks = $.locks();|mkdelimiter|	return reg.test(locks.toString());|mkdelimiter|}|mkdelimiter|function runTime(start, end, format) { /* Расчет времени (m.klimov) 20140927 */|mkdelimiter|	return format == "s" ? (end - start)/1000 + " " + format : (end - start) + " ms";/* new Date().valueOf(); */|mkdelimiter|}|mkdelimiter|function MKReturn(text) { /* Если надо сделать запись в лог при return (m.klimov) 20141123 */|mkdelimiter|	var type = vars["$G.bg"] == true ? "system.functions.log" : "print"; /* Определеяем печать в лог/ссесию (m.klimov) 20161205; */|mkdelimiter|	return $._null(eval(type + "(\"" + $.operator() + " (" + $.str($.tod()) + "): " + text + "\")"));|mkdelimiter|}|mkdelimiter|function MKPrint(text) { /* Принты только для себя (m.klimov) 20141123 */|mkdelimiter|	/*if ($.operator() != "m.klimov") return;*/|mkdelimiter|	var cnt = arguments.length;|mkdelimiter|	vars["$mk.print.operators"] = [];|mkdelimiter|	vars["$mk.print.operator"] = $.operator();|mkdelimiter|	if (cnt &gt; 1) { for (var i = 1; i &lt; cnt; i++) vars["$mk.print.operators"].unshift(arguments[i]); } else { vars["$mk.print.operators"].push(vars["$mk.print.operator"]); }|mkdelimiter|	/*$.parse_evaluate("if ($L.mk.print.operator isin $L.mk.print.operators) then ($L.mk.print.success=true)"); */|mkdelimiter|	/*if (vars["$L.mk.print.success"]) return vars["$G.bg"] == true ? $._null($.log(text)) : $._null(print(text)); */	|mkdelimiter|	if (checkValueInArray(vars["$mk.print.operator"], vars["$mk.print.operators"])) return vars["$G.bg"] == true ? $._null($.log(text)) : $._null(print(text));|mkdelimiter|	return;|mkdelimiter|}|mkdelimiter|function checkValueInArray(value, array, print) { /* Поиск значения в массиве используя isin в RAD (c) m.klimov 20160906 */|mkdelimiter|	vars["$mk.array"] = array;|mkdelimiter|	vars["$mk.value"] = value|mkdelimiter|	/* if ($.nullsub(print, false)) MKPrint(libWhere + "vars[$mk.value] = " + vars["$mk.value"] + "; vars[$mk.array] = " + vars["$mk.array"], "m.klimov"); */|mkdelimiter|	$.parse_evaluate("if ($mk.value isin $mk.array) then ($mk.search.result=true)");|mkdelimiter|	return vars["$mk.search.result"];|mkdelimiter|}|mkdelimiter|function MKprintObj(obj, libWhere) { /* принт объекта (c) m.klimov 20160906 */|mkdelimiter|    var str = ""; |mkdelimiter|    for(var k in obj) {str += k+": "+ obj[k]+"\r\n"; }|mkdelimiter|    MKPrint(libWhere + " = " + str, "m.klimov");|mkdelimiter|    $.log(libWhere + " = " + str);  |mkdelimiter|}</script><package type="string">Reporting</package><sysmoduser type="string">m.klimov</sysmoduser></instance></model>',
		'dbdict' 		: '<model name="dbdict"><keys><name sctype="string">' + prefixModule + 'logmonitor</name></keys><instance recordid="' + prefixModule + 'logmonitor"><name type="string">' + prefixModule + 'logmonitor</name><field sctype="array"><field sctype="structure"><name type="string">descriptor</name><level type="decimal">0</level><index type="decimal">1</index><type type="decimal">9</type><sql.field.options sctype="structure"><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">uid</name><level type="decimal">1</level><index type="decimal">1</index><type type="decimal">2</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">UID</sql.column.name><sql.data.type type="string">NVARCHAR(60)</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">timeStamp</name><level type="decimal">1</level><index type="decimal">2</index><type type="decimal">3</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">TIMESTAMP</sql.column.name><sql.data.type type="string">DATETIME</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">timeStampLog</name><level type="decimal">1</level><index type="decimal">3</index><type type="decimal">2</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">TIMESTAMPLOG</sql.column.name><sql.data.type type="string">NVARCHAR(60)</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">defaultLine</name><level type="decimal">1</level><index type="decimal">4</index><type type="decimal">8</type><sql.field.options sctype="structure"><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">defaultLine</name><level type="decimal">2</level><index type="decimal">1</index><type type="decimal">2</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">DEFAULTLINE</sql.column.name><sql.data.type type="string">NTEXT</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">logName</name><level type="decimal">1</level><index type="decimal">5</index><type type="decimal">2</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">LOGNAME</sql.column.name><sql.data.type type="string">NVARCHAR(60)</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field></field><key sctype="array"><key sctype="structure"><flags type="decimal">12</flags><name sctype="array"><name sctype="string">uid</name></name></key></key><root.record type="decimal">-1</root.record><sql.tables sctype="array"><sql.tables sctype="structure"><sql.db.type type="string">sqlserver</sql.db.type><sql.table.name type="string">' + $.toupper(prefixModule) + 'LOGMONITORM1</sql.table.name><sql.table.alias type="string">m1</sql.table.alias><sql.lookup.table.keys sctype="string"/><sql.table.options sctype="string"/></sql.tables></sql.tables><file.options sctype="structure"><shadow type="boolean">false</shadow><reselect type="boolean">false</reselect></file.options><case.insensitive type="boolean">true</case.insensitive><sysmoduser type="string">m.klimov</sysmoduser></instance></model> ',
		'dbdict1' 		: '<model name="dbdict"><keys><name sctype="string">' + prefixModule + 'logmonitorconfig</name></keys><instance recordid="' + prefixModule + 'logmonitorconfig"><name type="string">' + prefixModule + 'logmonitorconfig</name><field sctype="array"><field sctype="structure"><name type="string">descriptor</name><level type="decimal">0</level><index type="decimal">1</index><type type="decimal">9</type><sql.field.options sctype="structure"><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">id</name><level type="decimal">1</level><index type="decimal">1</index><type type="decimal">1</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">ID</sql.column.name><sql.data.type type="string">FLOAT</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">logs</name><level type="decimal">1</level><index type="decimal">2</index><type type="decimal">8</type><sql.field.options sctype="structure"><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">logs</name><level type="decimal">2</level><index type="decimal">1</index><type type="decimal">2</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">LOGS</sql.column.name><sql.data.type type="string">NVARCHAR(MAX)</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">pathLogs</name><level type="decimal">1</level><index type="decimal">3</index><type type="decimal">8</type><sql.field.options sctype="structure"><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">pathLogs</name><level type="decimal">2</level><index type="decimal">1</index><type type="decimal">2</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">PATHLOGS</sql.column.name><sql.data.type type="string">NVARCHAR(MAX)</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">regExp</name><level type="decimal">1</level><index type="decimal">4</index><type type="decimal">8</type><sql.field.options sctype="structure"><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field><field sctype="structure"><name type="string">regExp</name><level type="decimal">2</level><index type="decimal">1</index><type type="decimal">2</type><sql.field.options sctype="structure"><sql.table.alias type="string">m1</sql.table.alias><sql.column.name type="string">REGEXP</sql.column.name><sql.data.type type="string">NVARCHAR(MAX)</sql.data.type><sql.rcformat type="boolean">false</sql.rcformat></sql.field.options><structure.array.options sctype="structure"/></field></field><key sctype="array"><key sctype="structure"><flags type="decimal">12</flags><name sctype="array"><name sctype="string">id</name></name></key></key><root.record type="decimal">-1</root.record><sql.tables sctype="array"><sql.tables sctype="structure"><sql.db.type type="string">sqlserver</sql.db.type><sql.table.name type="string">' + $.toupper(prefixModule) + 'LOGMONITORCONFIGM1</sql.table.name><sql.table.alias type="string">m1</sql.table.alias><sql.lookup.table.keys sctype="string"/><sql.table.options sctype="string"/></sql.tables></sql.tables><file.options sctype="structure"><shadow type="boolean">false</shadow><reselect type="boolean">false</reselect></file.options><case.insensitive type="boolean">true</case.insensitive><sysmoduser type="string">m.klimov</sysmoduser></instance></model>',
		'wizard' 		: '<model name="wizard"><keys><name sctype="string">' + prefixModule + 'logmonitorConfig</name></keys><instance recordid="' + prefixModule + 'logmonitorConfig"><name type="string">' + prefixModule + 'logmonitorConfig</name><file.selection type="string">create</file.selection><create.record.filename type="string">' + prefixModule + 'logmonitorConfig</create.record.filename><select.record.filename type="string">' + prefixModule + 'logmonitorConfig</select.record.filename><select.query type="string">$query</select.query><resolve.variables type="boolean">false</resolve.variables><wizard.type type="string">input</wizard.type><wizard.variables sctype="array"><wizard.variables sctype="string">$L.mode</wizard.variables></wizard.variables><display.when.complete type="boolean">false</display.when.complete><allow.finish type="boolean">true</allow.finish><next.wizard sctype="array"><next.wizard sctype="string">' + prefixModule + 'logmonitorConfig</next.wizard><next.wizard sctype="string">' + prefixModule + 'logmonitorConfig</next.wizard></next.wizard><next.wizard.cond sctype="array"><next.wizard.cond sctype="operator">$L.action="next"</next.wizard.cond><next.wizard.cond sctype="operator">$L.action="previous"</next.wizard.cond></next.wizard.cond><sub.format type="string">' + prefixModule + 'logmonitorConfig</sub.format><use.file.as.selection type="boolean">false</use.file.as.selection><query.for.records type="boolean">true</query.for.records><query.for.records.filename type="string">' + prefixModule + 'logmonitorConfig</query.for.records.filename><query.for.records.query type="string">true</query.for.records.query><title type="string">Конфигурации сбора логов</title><select.no.records type="string">123</select.no.records><perform.action.on type="string">file</perform.action.on><reset.to.selections type="boolean">false</reset.to.selections><window.title type="string">Конфигурации сбора логов</window.title><start type="boolean">false</start><query.for.records.sort sctype="array"><query.for.records.sort sctype="string">id</query.for.records.sort></query.for.records.sort><query.select.one.record type="string">display</query.select.one.record><query.select.no.records type="string">continue</query.select.no.records><javascript.actions type="string">var _ = lib.Underscore.require();|mkdelimiter|vars["$L.mode"] = "update";|mkdelimiter|if (system.functions._null(vars["$L.file"]["id"])) { |mkdelimiter|	vars["$L.file"]["id"] = system.functions.val(_.uniqueId(), 1);|mkdelimiter|	vars["$L.mode"] = "add";|mkdelimiter|}|mkdelimiter|if (vars["$L.action"] == "finish") vars["$L.file"].doAction(vars["$L.mode"]);|mkdelimiter|vars["$mk.LMC.setConfig"] = true;</javascript.actions><javascript.init type="string">var id;|mkdelimiter|if (vars["$L.action"] == "next")  id = (vars["$L.file"]["id"] + 1);|mkdelimiter|if (vars["$L.action"] == "previous") id = (vars["$L.file"]["id"] - 1);|mkdelimiter|vars["$query"] = "id&gt;=" + (id &lt;= 0) ? 1 : id;|mkdelimiter|if (vars["$L.action"] == null)	vars["$query"] = "true";|mkdelimiter|var fLog = $c("' + prefixModule + 'logmonitorConfig").select(vars["$query"]).uniqueResult();|mkdelimiter|if (!fLog) {|mkdelimiter|	var objConfig = { |mkdelimiter|		"logs" : ["sm-rest.log"], |mkdelimiter|		"pathLogs" : ["..\\logs\\"], |mkdelimiter|		"regExp" : ["\\sE\\s", "\\sW\\s"]|mkdelimiter|	};|mkdelimiter|	vars["$L.file"] = new SCFile("' + prefixModule + 'logmonitorConfig");|mkdelimiter|	vars["$L.file"]["id"] = id;|mkdelimiter|	vars["$L.file"]["logs"] = objConfig["logs"];|mkdelimiter|	vars["$L.file"]["pathLogs"] = objConfig["pathLogs"];|mkdelimiter|	vars["$L.file"]["regExp"] = objConfig["regExp"];|mkdelimiter|	vars["$L.wizard"]["file.selection"] = "create";|mkdelimiter|} else {|mkdelimiter|	vars["$L.file"] = fLog;|mkdelimiter|	vars["$L.wizard"]["file.selection"] = "select";|mkdelimiter|}|mkdelimiter|vars["$L.wizard"]["select.query"] = vars["$query"];</javascript.init><javascript.cancel type="string">if (vars["$L.action"] == "previous") lib.MKlimovTools.runWizard(vars["$L.wizard"]["name"]);</javascript.cancel><disable.next.previous type="boolean">true</disable.next.previous><sysmoduser type="string">m.klimov</sysmoduser><disable.next type="boolean">false</disable.next><reset.current.file type="boolean">false</reset.current.file><disable.previous type="boolean">false</disable.previous><formName type="string">wizard.large</formName><noPromptOnCancel type="boolean">true</noPromptOnCancel></instance></model>',
		'format' 		: '<model name="format"><keys><syslanguage sctype="string">ru</syslanguage><name sctype="string">' + prefixModule + 'logmonitorConfig</name></keys><instance recordid="ru - ' + prefixModule + 'logmonitorConfig"><name mandatory="true" type="string">' + prefixModule + 'logmonitorConfig</name><field sctype="array"><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">1</line><column type="decimal">1</column><length type="decimal">61</length><window type="decimal">9</window><graph sctype="array"/><output type="string">VO</output><property type="string">Table;Columns=$mk.LMC.caption.log;$mk.LMC.caption.regexp	Name=table1481117736528	Height=18	Name=table1481117736528	TabStop=0	Width=121	X=0	Y=0		</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">6</line><column type="decimal">6</column><length type="decimal">1</length><window type="decimal">0</window><graph sctype="array"/><input type="string">logs</input><output type="string">Лог файл</output><property type="string">Column;		Caption=Лог файл		Column Width%=50.0			Input=logs	Y=10	X=10	ButtonID=column1481126429091	Name=input1481126429092	scType=Text		</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">1</line><column type="decimal">1</column><length type="decimal">1</length><window type="decimal">1</window><graph sctype="array"/><output type="string">VO</output><property type="string">end;X=1	Y=1	Height=2	Width=2	</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">6</line><column type="decimal">6</column><length type="decimal">1</length><window type="decimal">0</window><graph sctype="array"/><input type="string">pathLogs</input><output type="string">Путь расположения</output><property type="string">Column;		Caption=Путь расположения		Column Width%=50.0			Input=pathLogs	Y=10	X=10	ButtonID=column1481126429093	Name=input1481126429094	scType=Text		</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">1</line><column type="decimal">1</column><length type="decimal">1</length><window type="decimal">1</window><graph sctype="array"/><output type="string">VO</output><property type="string">end;X=1	Y=1	Height=2	Width=2	</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">1</line><column type="decimal">1</column><length type="decimal">1</length><window type="decimal">1</window><graph sctype="array"/><output type="string">VO</output><property type="string">end;X=1	Y=1	Height=2	Width=2	</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">1</line><column type="decimal">64</column><length type="decimal">21</length><window type="decimal">9</window><graph sctype="array"/><output type="string">VO</output><property type="string">Table;Columns=column1481127717043	Name=table1481127717042	Height=18	Name=table1481127717042	Width=41	X=127	Y=0		</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">6</line><column type="decimal">6</column><length type="decimal">1</length><window type="decimal">0</window><graph sctype="array"/><input type="string">regExp</input><output type="string">Регулярные выражения</output><property type="string">Column;		=	Caption=Регулярные выражения		Column Width%=100			Input=regExp	Y=10	X=10	ButtonID=	ShowTitle=1	Name=input1481127717044	scType=Text		</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">1</line><column type="decimal">1</column><length type="decimal">1</length><window type="decimal">1</window><graph sctype="array"/><output type="string">VO</output><property type="string">end;X=1	Y=1	Height=2	Width=2	</property></field><field sctype="structure"><flags type="decimal">4096</flags><line type="decimal">1</line><column type="decimal">1</column><length type="decimal">1</length><window type="decimal">1</window><graph sctype="array"/><output type="string">VO</output><property type="string">end;X=1	Y=1	Height=2	Width=2	</property></field></field><editor type="string">m.klimov</editor><last.update type="dateTime">' + $.str(new Date('2016/12/08 16:58:29')) + '</last.update><syslanguage type="string">ru</syslanguage><sysmoduser type="string">m.klimov</sysmoduser></instance></model>',
		'format1' 		: '<model name="format"><keys><syslanguage sctype="string">ru</syslanguage><name sctype="string">' + prefixModule + 'logmonitor</name></keys><instance recordid="ru - ' + prefixModule + 'logmonitor" uniquequery="syslanguage=&quot;ru&quot; and name=&quot;' + prefixModule + 'logmonitor&quot;"><name mandatory="true" type="string">' + prefixModule + 'logmonitor</name><field sctype="array"><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">1</line><column type="decimal">1</column><length type="decimal">78</length><window type="decimal">0</window><graph sctype="array"/><output type="string">' + prefixModule + 'logmonitor</output><property type="string">Label;Caption=' + prefixModule + 'logmonitor	Elastic=1	Name=Label0	Opaque=1	BackColor=6	Bold=1	FontIncrease=2	ForeColor=10	Height=2	Name=Label0	Width=156	X=0	Y=0		</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">3</line><column type="decimal">2</column><length type="decimal">17</length><window type="decimal">0</window><graph sctype="array"/><output type="string">Uid:</output><property type="string">Label;Caption=Uid:	Name=Label8	ForeColor=0	Height=2	Name=Label8	Width=34	X=2	Y=4		</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">3</line><column type="decimal">19</column><length type="decimal">18</length><window type="decimal">0</window><graph sctype="array"/><input type="string">uid</input><property type="string">Text;Name=Text1	ForeColor=0	Height=2	Name=Text1	Width=36	X=36	Y=4		Input=uid	</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">4</line><column type="decimal">2</column><length type="decimal">17</length><window type="decimal">0</window><graph sctype="array"/><output type="string">Time Stamp:</output><property type="string">Label;Caption=Time Stamp:	Name=Label7	ForeColor=0	Height=2	Name=Label7	Width=34	X=2	Y=6		</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">4</line><column type="decimal">19</column><length type="decimal">18</length><window type="decimal">0</window><graph sctype="array"/><input type="string">timeStamp</input><property type="string">Text;Name=Text2	ForeColor=0	Height=2	Name=Text2	Width=36	X=36	Y=6		Input=timeStamp	</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">5</line><column type="decimal">2</column><length type="decimal">17</length><window type="decimal">0</window><graph sctype="array"/><output type="string">Time Stamp Log:</output><property type="string">Label;Caption=Time Stamp Log:	Name=Label6	ForeColor=0	Height=2	Name=Label6	Width=34	X=2	Y=8		</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">5</line><column type="decimal">19</column><length type="decimal">18</length><window type="decimal">0</window><graph sctype="array"/><input type="string">timeStampLog</input><property type="string">Text;Name=Text3	ForeColor=0	Height=2	Name=Text3	Width=36	X=36	Y=8		Input=timeStampLog	</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">6</line><column type="decimal">2</column><length type="decimal">17</length><window type="decimal">0</window><graph sctype="array"/><output type="string">Log Name:</output><property type="string">Label;Caption=Log Name:	ForeColor=0	Height=2	Name=	Width=34	X=2	Y=10		</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">6</line><column type="decimal">19</column><length type="decimal">18</length><window type="decimal">0</window><graph sctype="array"/><input type="string">logName</input><property type="string">Text;ForeColor=0	Height=2	Name=	Width=36	X=36	Y=10		Input=logName	</property></field><field sctype="structure"><flags type="decimal">0</flags><line type="decimal">7</line><column type="decimal">2</column><length type="decimal">17</length><window type="decimal">0</window><graph sctype="array"/><output type="string">Default Line:</output><property type="string">Label;Caption=Default Line:	Name=Label5	ForeColor=0	Height=2	Name=Label5	Width=34	X=2	Y=13		</property></field><field sctype="structure"><flags type="decimal">512</flags><line type="decimal">8</line><column type="decimal">2</column><length type="decimal">35</length><window type="decimal">2</window><graph sctype="array"/><input type="string">defaultLine</input><property type="string">MultiText;Name=MultiText4	ForeColor=0	Height=4	Name=MultiText4	Width=70	X=2	Y=15		Input=defaultLine	</property></field></field><file.name type="string">' + prefixModule + 'logmonitor</file.name><editor type="string">m.klimov</editor><last.update type="dateTime">' + $.str(new Date('2016/12/13 22:54:31')) + '</last.update><syslanguage type="string">ru</syslanguage><sysmoduser type="string">m.klimov</sysmoduser></instance></model>',		
		'schedule' 		: '<model name="schedule"><keys><schedule.id sctype="decimal">6297342</schedule.id></keys><instance recordid="6297342"><class type="string">report</class><expiration type="dateTime">' + $.str($.val($.val(new Date(), 1) + 3600, 3)) + '</expiration><repeat type="dateTime">01:00:00</repeat><name type="string">' + $.toupper(prefixModule) + ' Log Monitor</name><status type="string">rescheduled</status><sched.class type="string">report</sched.class><action.time type="dateTime">' + $.str($.val($.val(new Date(), 1) + 3600, 3)) + '</action.time><repeatm type="boolean">false</repeatm><repeatq type="boolean">false</repeatq><repeatb type="boolean">false</repeatb><repeata type="boolean">false</repeata><schedule.id type="decimal">6297342</schedule.id><sysmoduser type="string">m.klimov</sysmoduser><javascript type="string">system.functions.log(vars["$L.schedule"]["name"] + " START");lib.'+ record['name'] + '.runLogMonitoring();system.functions.log(vars["$L.schedule"]["name"] + " END");</javascript></instance></model>'
	};
	var fileName = key.replace(/\d+/, '');//$.strraw(/^\w+/.exec(key));
	return !$._null($c(fileName, SCFILE_READONLY).select('name="' + name + '"').uniqueResult()) ? true : createElement(metaData[key], fileName, name); 
}

function createElement(meta, fileName, name) {
	fileName = $.strraw(/^\w+/.exec(fileName));
	if (fileName == 'dbdict') return lib.MKlimovTools.createDB(meta, fileName);
	else createSCFile(meta, fileName, 'name="' + name + '"');
}

function getPrefix(prefix) {
	return $.nullsub($.nullsub(prefix, vars['$prefix']), 'mk');
}

function createSCFile(xmlstr, fileName, query) {
	var filename = fileName;
	var file = new SCFile(filename);
	var rc = file.doSelect(query);
	if (rc == RC_SUCCESS) {
		file.setRecord(xmlstr.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\"/g, '"').replace(/\|mkdelimiter\|/g, '\n'));
		//file.setRecord(xmlstr.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\|mkdelimiter\|/g, '\n'));
		var result = file.doUpdate();
		return "updated record: (" + result + ") " + RCtoString( result ) + "; sysmodtime = " + $.str(file["sysmodtime"]);
    } else {
    	file.setRecord(xmlstr.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\"/g, '"').replace(/\|mkdelimiter\|/g, '\n'));
    	//file.setRecord(xmlstr.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\|mkdelimiter\|/g, '\n'));
 		var result = file.doInsert();
		return "insert record: " + RCtoString( result );
	}
}

print(libWhere + 'RunTime: ' + lib.MKlimovTools.runTime(sTime, new Date())); //Don't use. You don't have a function, may be time later.