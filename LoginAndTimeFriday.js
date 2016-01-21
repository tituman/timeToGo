javascript:
/*
* v6.20
* added average 
*
* v6.1
* added work minus 10h
*
* v6
* by lena hd
* @pnd fixed time for week and remaining for friday
* pipifein
*
* v5.1
* tells me effective work time for week
*
* v3.2
* it paints the current time on the calculated day (usually today, but could be some other selected day) for info
*
* v3.1
* on friday tells when to leave adjusted for week
* on !friday tells when to leave for short friday
* show how long worked today until now
*
* v2.2
* (not done): clicks monatsauswertung and asks funny shit
*
* v2.1
* auto check if already logged in and just calc
* 
* v2
* logs in
* clicks "buchen" (comes to today)
* reads come and lunch times
* clicks week
* adjusts time for week worked (Mon-Thu)
*
*/
/* personal number and password */
var persNumber = '7846';
var persPass = 'KEPASS';
var times = new Array();
var kommenFound = false;
var GMfound = false;
var KMfound = false;
var linearInTime;
var lunchPeriod;
var inHour;
var inMinutes;
var timeWorked;
var timeWorked_ShortFR;
var dateText;
var misids;
var currentLinearTime;
var indexOfDay;
function doIt() {
	login();
	setTimeout('getTodaysTimes()', 1000);
	setTimeout('clickWoche()', 1500);
	setTimeout('addWoche()', 3000);
}
function addWoche(){
	var iframe = document.getElementById('app');
	var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
	var cnt = 0;
	var startCounting = false;
	var table = innerDoc.getElementsByClassName("dataTables_scrollFootInner");
	if (table == null) {
		alert('table not found!');
	}
	var weekstime = table[0].textContent || table[0].innerText;
	weekstime = weekstime.replace(/(\r\n|\n|\r)/gm,"");
	weekstime = weekstime.split('Summe')[1];
	var weekstimeMinutes = Math.floor(Number(weekstime)*60);
	var goal = linearInTime + lunchPeriod + ((38.5*60) - weekstimeMinutes);
	var goalHours = parseInt(goal/60, 10);
	var goalMins = goal - (goalHours * 60);
	if (goalMins < 10) {
		goalMins = "0"+goalMins;
	};
	var timeToLeaveAdjusted = goalHours+":"+goalMins;
	var sStringz = "K: " + (inHour) +":"+ (inMinutes) + "\nlunched: " + (lunchPeriod-12) + "\n\ntime to leave: " + (timeWorked);
	if (isFriday()) {
		sStringz = (sStringz) + "\ntime to leave adjusted for week: " + (timeToLeaveAdjusted);
	} else {
		sStringz = (sStringz) + "\ntime to leave adjusted for Short Friday: " + (timeWorked_ShortFR);
	}/* add current time to show current worked time till now */
	var my1date = new Date();
	var current_hourInMins = my1date.getHours() * 60;
	var current_minute = my1date.getMinutes();
	currentLinearTime = current_hourInMins + current_minute;
	var effectiveLinearTime = currentLinearTime - linearInTime -lunchPeriod;
	var workedHours = parseInt(effectiveLinearTime/60, 10);
	var workedMinutes = effectiveLinearTime - workedHours*60;
	if (workedMinutes < 10){workedMinutes = "0" + (workedMinutes);};
	sStringz = (sStringz) + "\n\neffective work time until now: " + (workedHours) + ":" + (workedMinutes); 
	/* es gilt: 10h == 600min == max work allowed*/
	var timeMinus10Linear = (10*60) - effectiveLinearTime;
	var workedHoursMinus10 = parseInt(timeMinus10Linear/60, 10);
	var workedMinutesMinus10 = timeMinus10Linear - workedHoursMinus10*60;
	if(workedMinutesMinus10 < 10) { workedMinutesMinus10 = "0" + (workedMinutesMinus10);};
	sStringz = (sStringz) + "\nwork time until 10h: " + (workedHoursMinus10) + ":" + (workedMinutesMinus10); 
/* add average per day */
	/* sun = 0, mon = 1, fri = 5 */
	if ((my1date.getDay() > 1) || (my1date.getDay() < 5)) {
		var avgLinear = weekstimeMinutes / (my1date.getDay()-1);
		var avgHours = parseInt(avgLinear/60, 10);
		var avgMinutes = Math.floor(avgLinear - (avgHours * 60));
		if (avgMinutes < 10) {
			avgMinutes = "0"+avgMinutes;
		};
		sStringz = (sStringz) + "\naverage worktime per day: " + (avgHours) + ":" + (avgMinutes);
	}
	
	paintCurrentTimeInTable(innerDoc.getElementById("table1"), my1date);
	alert(sStringz);
}
function paintCurrentTimeInTable(table){
	/* find out the current linear time in minutes in 15min chunks and add constant 2 because of the same as above */
	var linearTimeInChunks = parseInt(currentLinearTime/15, 10) + 2;
	/* find out cell and paint it *//* row of current day  (see function isFriday() ) *//*  add constant 2 for table (table row #2 is Monday) */
	var rowIdx = indexOfDay + 3; 
	/* column that has our 15min chunk  */
	var colIdx = linearTimeInChunks;
	var row = table.rows[rowIdx];
	var col = row.cells[colIdx];
	col.style.background = '#FF69B4';
}
function login() {
	var iframe = document.getElementById('app');
	var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
	var user = innerDoc.getElementsByName('user_id')[0];
	/* evtl only calc without login? */
	if (iframe == null || innerDoc == null || user == null) {
		return;
	}
	user.value = persNumber;
	var pwd = innerDoc.getElementsByName('password')[0];
	pwd.value = persPass;innerDoc.getElementById('submitButton').click();
	setTimeout('clickLogin()', 250);
}
function clickLogin() {
	var iframe = document.getElementById('app');
	var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
	var elm = innerDoc.getElementById('menutext');elm.focus();simulateClick(elm);
	return;
}
function clickWoche() {
	var iframe = document.getElementById('app');
	var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
	var elm = innerDoc.getElementById('actionlinkdiv');
	elm.focus();simulateClick(elm);
	return;
}
function clickMonatsauswertung() {
	var iframe = document.getElementById('app');
	var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
	var elm = innerDoc.getElementById('actionlinkdiv_b');
	elm.focus();
	simulateClick(elm);
	return;
}
function simulateClick(elm) {  
	var evt = document.createEvent("MouseEvents");  
	evt.initMouseEvent("click", true, true, window,      0, 0, 0, 0, 0, false, false, false, false, 0, null);  
	var canceled = !elm.dispatchEvent(evt);  
	if(canceled) {/*      A handler called preventDefault     uh-oh, did some XSS hack your site? */  
	} else {/*      None of the handlers called preventDefault     do stuff */  
	}  
	return;
}
function getTodaysTimes() {
	var iframe = document.getElementById('app');
	var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
	var cnt = 0;
	var startCounting = false;
	var table = innerDoc.getElementById("table1");
	if (table == null) {
		alert('please login to ePZE -> Buchen -> today');
		return;
	}
	for (var i = 0, row; row = table.rows[i]; i++) {   
	/* iterate through rows   rows would be accessed using the "row" variable assigned in the for loop */      
	for (var j = 0, col; col = row.cells[j]; j++) {/*  iterate through columns columns would be accessed using the "col" variable assigned in the for loop */
		var colInText = col.textContent || col.innerText;colInText = colInText.replace(/(\r\n|\n|\r)/gm,"");
		/* chrome uses innerText, firefox does not know it.firefox adds some line breaks.*//*get kommen*/
		if(col.id == "K2" && colInText == "K" && !kommenFound) {
			startCounting = true;
			kommenFound = true;
		}/*get GM*/
		if(col.id == "K2" && colInText == "GM") {
			startCounting = true;/* GM found before, use first occurrence --> reset startCounting */
		if (GMfound){startCounting = false;}GMfound = true;}/*get KM*//*if(col.id == "K3" && (colInText == "KM" || colInText == "G" )) {*/
		if(col.id == "K2" && (colInText == "KM")) {
			startCounting = true;KMfound = true;
		}
		if(startCounting){cnt = cnt + 1;}/*get time*/
		if (startCounting && col.id == "T4" ) {
			var buchung = row.cells[j-cnt+1].textContent || row.cells[j-cnt+1].innerText;buchung = buchung.replace(/(\r\n|\n|\r)/gm,"");
			times[buchung] = colInText.split(":");startCounting = false;cnt = 0;
		}   
	}/* KM found break loop */
	if (KMfound) {break;}}/* find out which day it is */var x5Date = innerDoc.getElementsByName("x5");
	if (x5Date == null) {
		alert('please login to ePZE -> Buchen -> today');
		return;
	}
	dateText = x5Date[0].value ||x5Date[0].textContent || x5Date[0].innerText;
	dateText = dateText.replace(/(\r\n|\n|\r)/gm,"");dateText = dateText.split("/");
	calc();
}
function isFriday() { 
	var myDate = new Date();
	myDate.setFullYear(dateText[0]);
	myDate.setMonth(dateText[1]-1);
	myDate.setDate(dateText[2]);/* find out the day index: [0-6] begins sunday */
	indexOfDay = myDate.getDay();/* friday == 5 */
	return (indexOfDay == 5) ? true : false;
}
function calc(){
	if (kommenFound) {
		inHour = parseInt(times["K"][0], 10);
		inMinutes = parseInt(times["K"][1], 10);
	} else {inHour = 0;inMinutes = 0;
	}
	if (GMfound) {
	var lunchOutHour = parseInt(times["GM"][0], 10);
		var lunchOutMinutes = parseInt(times["GM"][1], 10);/*} else if (KMfound) { *//* if no GM then booked out right before lunch, use KM (or G) *//*var lunchOutHour = parseInt(times["KM"][0], 10);var lunchOutMinutes = parseInt(times["KM"][1], 10);*/
	} else {var lunchOutHour = 0;
	var lunchOutMinutes = 0;
	}
	if (KMfound) {var lunchInHour = parseInt(times["KM"][0], 10);
	var lunchInMinutes = parseInt(times["KM"][1], 10);
	} else {
		var lunchInHour = 0;
		var lunchInMinutes = 0;
	}/* normal day: 7h50 normal friday: 7h20 shortFR weekDay: 8h30 shortFR friday; 4h30*/
	var outHour = 7;
	var outHour_ShortFR = isFriday() ? 4 : 8;
	var outMinutes = isFriday() ? 20 : 50;
	var outMinutes_ShortFR = 30;
	linearInTime = 60*(inHour)+(inMinutes);
	var linearLunchOutTime = 60*(lunchOutHour)+(lunchOutMinutes);
	var linearLunchInTime = 60*(lunchInHour)+(lunchInMinutes);
	var linearOutTime = 60*(outHour)+(outMinutes);
	var linearOutTime_ShortFR = 60*(outHour_ShortFR)+(outMinutes_ShortFR);
	lunchPeriod = linearLunchInTime-linearLunchOutTime+12;
	var linearMinutesWorked = linearInTime+(linearOutTime+lunchPeriod);
	var linearMinutesWorked_ShortFR = linearInTime+(linearOutTime_ShortFR+lunchPeriod);
	var hoursWorked = parseInt(linearMinutesWorked/60, 10);
	var minutesWorked = linearMinutesWorked-(hoursWorked*60);
	if (minutesWorked < 10){minutesWorked = "0"+minutesWorked;} 
	var hoursWorked_ShortFR = parseInt(linearMinutesWorked_ShortFR/60, 10);
	var minutesWorked_ShortFR = linearMinutesWorked_ShortFR-(hoursWorked_ShortFR*60);
	if (minutesWorked_ShortFR < 10){minutesWorked_ShortFR = "0"+minutesWorked_ShortFR;}
	timeWorked = hoursWorked+":"+minutesWorked;
	timeWorked_ShortFR = hoursWorked_ShortFR+":"+minutesWorked_ShortFR;
	if(inMinutes < 10) {inMinutes = "0"+inMinutes;}
}
doIt();
void(null);