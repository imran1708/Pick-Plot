var plotCount=0;

async function getAndProcessFiles() {
	var files = document.getElementById("csvs").files;
	let map = new Map();
	plotCount=0;
	for (const file of files) {	
		const data = await new Response(file).text();
		var js = JSC.csv2Json(data, {
			coerce: (d, i, types) => {
				columns: ["Date", "Open", "High", "Low", "Close", "AdjClose", "Volume"]
			  return {Date: d.Date, Open: d.Open, High: d.High, Low: d.Low,
						Close: d.Close, AdjClose: d.AdjClose, Volume: d.Volume};
			}
		  });
		map.set(file.name, js);
	}
	readAndPlotBarOnCheckbox(map);
	readAndPlotBarOnCloseOpen(map);
	readAndPlotLineOnAllParams(map);
	readAndPlotBarOnHiLoCpOp(map);
	readAndPlotBarLineOnVol(map);
}

function readAndPlotBarLineOnVol(map) {
	for (let fileName of map.keys()) {
		let seriesArray = [];
		map.get(fileName).forEach(function (row) {	
			seriesArray.push({x: row.Date, y: row.Volume});
		});
		plotCount = plotCount+1;
		let para = createDiv();
		renderBarChart([
			{name: 'Volume', points: seriesArray},
		], para, fileName);
	}
}

function readAndPlotBarOnHiLoCpOp(map) {
	for (let fileName of map.keys()) {
		let coOpSeriesArray = [];
		let count = 0;
		map.get(fileName).forEach(function (row) {
			row["CloseOpen"]=row.Close-row.Open;
			if(count === 0 || count === 5 ) {
				coOpSeriesArray.push({x: row.Date, y: row.CloseOpen});
				if(count === 5) count = 0;
			}
			count++;
		});
		plotCount = plotCount+1;
		let para = createDiv();
		renderBarChart([
			{name: 'Co-Op', points: coOpSeriesArray}
		], para, fileName);
	}
}

function readAndPlotLineOnAllParams(map) {
	for (let fileName of map.keys()) {
		let openSeriesArray = [], highSeriesArray = [], 
			lowSeriesArray = [], closeSeriesArray = [];
		let count = 0;
		map.get(fileName).forEach(function (row) {
			if(count === 0 || count === 5 ) {
				openSeriesArray.push({x: row.Date, y: parseInt(row.Open)});
				highSeriesArray.push({x: row.Date, y: parseInt(row.High)});
				lowSeriesArray.push({x: row.Date, y: parseInt(row.Low)});
				closeSeriesArray.push({x: row.Date, y: parseInt(row.Close)});

				if(count === 5) count = 0;
			}
			count++;
		});
		plotCount = plotCount+1;
		let para = createDiv();
		renderLineChart([
			{name: 'Open', points: openSeriesArray},
			{name: 'High', points: highSeriesArray},
			{name: 'Low', points: lowSeriesArray},
			{name: 'Close', points: closeSeriesArray}
		], para, fileName);
	}
}

function readAndPlotBarOnCloseOpen(map) {
	let posPointArray = [], negPointArray = [], totalPointArray = [];
	for (let fileName of map.keys()) {
		let numOfPosDays = 0, numOfNegDays = 0;
		map.get(fileName).forEach(function (row) {
			row["CloseOpen"]=row.Close-row.Open;
			if(row.Close-row.Open > 0) {
				++numOfPosDays;
			} else {
				++numOfNegDays;
			}
		});
		posPointArray.push({x: fileName.split('.')[0], y: numOfPosDays});
		negPointArray.push({x: fileName.split('.')[0], y: numOfNegDays});
		totalPointArray.push({x: fileName.split('.')[0], y: numOfPosDays + numOfNegDays});
	}
	plotCount = plotCount+1;
	let para = createDiv();
	renderBarChart([
		{name: '# of +ve days', points: posPointArray},
		{name: '# of -ve days', points: negPointArray},
		{name: 'Total # of entry', points: totalPointArray}
	], para, '');
}

function readAndPlotBarOnCheckbox(map) {
	var ul = document.getElementById("unorderedList");
	var items = ul.getElementsByTagName("li");
	let filtersArray1 = [];
	for (let fileName of map.keys()) {	
		let fileNameAray = [];
		for (var i = 0; i < items.length; ++i) {
			var checkboxEle = document.getElementById("checkbox"+(i+1));
			if(checkboxEle.checked){
				var obj = map.get(fileName);
				obj.forEach(function (row) {
					row["HighLow"]=row.High-row.Low;
					checkCondition1(checkboxEle.value, row, fileNameAray);
				});
			}	
		}
		prepareBarPlotData(fileNameAray, fileName, filtersArray1, map.get(fileName).length);
	}
	plotCount = plotCount+1;
	let para = createDiv();
	renderBarChart(filtersArray1, para, '');
}

function prepareBarPlotData(fileNameAray, fileName, filtersArray1, len) {
	let axisArray = [];

	var a1 = fileNameAray.filter(item => item.x == '<$0.2').length;
	if (a1 > 0)
		axisArray.push({x: '<$0.2', y: a1});

	var a2 = fileNameAray.filter(item => item.x == '$0.2-0.5').length;
	if (a2 > 0)
		axisArray.push({x: '$0.2-0.5', y: a2});

	var a3 = fileNameAray.filter(item => item.x == '$0.5-1').length;
	if (a3 > 0)
		axisArray.push({x: '$0.5-1', y: a3});

	var a4 =  fileNameAray.filter(item => item.x == '$1-2').length;
	if (a4 > 0)
		axisArray.push({x: '$1-2', y: a4});

	var a5 = fileNameAray.filter(item => item.x == '$2-3').length;
	if (a5 > 0)
		axisArray.push({x: '$2-3', y: a5});

	var a6 = fileNameAray.filter(item => item.x == '>$1').length;
	if (a6 > 0)
		axisArray.push({x: '>$1', y: a6});

	var a7 = fileNameAray.filter(item => item.x == '>$2').length;
	if (a7 > 0)
		axisArray.push({x: '>$2', y: a7});

	var a8 = fileNameAray.filter(item => item.x == '>$3').length;
	if (a8 > 0)
		axisArray.push({x: '>$3', y: a8});

	axisArray.push({x: 'Total # of entry', y: len});
	filtersArray1.push({name: fileName.split('.')[0], points: axisArray});
}

function checkCondition1(caseCond, row, filtersArray) {
	if (caseCond === 'LessThanPoint2' && row.HighLow < 0.2) {
		filtersArray.push({x: '<$0.2', y: row.HighLow});
	} else if (caseCond === 'BetweenPoint2andPoint5' 
		&& (row.HighLow > 0.2 && row.HighLow < 0.5)) {
		filtersArray.push({x: '$0.2-0.5', y: row.HighLow});
	} else if (caseCond === 'BetweenPoint5and1'
		&& (row.HighLow > 0.5 && row.HighLow < 1)) {
		filtersArray.push({x: '$0.5-1', y: row.HighLow});
	} else if (caseCond === 'Between1and2'
		&& (row.HighLow > 1 && row.HighLow < 2)){
		filtersArray.push({x: '$1-2', y: row.HighLow});
	} else if (caseCond === 'Between2and3'
		&& (row.HighLow > 2 && row.HighLow < 3)) {
		filtersArray.push({x: '$2-3', y: row.HighLow});
	} else if (caseCond === 'Above1' && row.HighLow > 1) {
		filtersArray.push({x: '>$1', y: row.HighLow});
	} else if (caseCond === 'Above2' && row.HighLow > 2){
		filtersArray.push({x: '>$2', y: row.HighLow});
	} else if (caseCond === 'Above3' && row.HighLow > 3) {
		filtersArray.push({x: '>$3', y: row.HighLow});
	}
}

function renderBarChart(series, chartDiv, titleText) {
	JSC.Chart(chartDiv, {
		defaultPoint: {
			label_text: '%yValue',
		},
		title: {
			position: 'center',
			label: {
			  align: 'center',
			  text: '<b>'+titleText+'</b>',
			  style_fontWeight: 'normal'
			}
		},
		type: 'Column',
		legend_visible: true,
		legend: { 
			position: 'bottom', 
			template: 
			  '%icon,%name', 
			maxWidth: 400, 
			cellSpacing: 8 
		  },
		//xAxis_crosshair_enabled: true,
		defaultPoint_tooltip: '%seriesName <b>%yValue<b>',
		series: series
	});
}

function renderLineChart(series, chartDiv, titleText) {
	JSC.Chart(chartDiv, {
		title: {
			position: 'center',
			label: {
			  align: 'center',
			  text: '<b>'+titleText+'</b>',
			  style_fontWeight: 'normal'
			}
		},
		legend_visible: true,
		legend: { 
			position: 'bottom', 
			template: 
			  '%icon,%name', 
			maxWidth: 400, 
			cellSpacing: 8 
		},
		defaultSeries_lastPoint_label_text: '<b>%seriesName</b>',
		defaultPoint_tooltip: '%seriesName <b>%yValue</b>',
		series: series
	});
}

function createDiv() {
	let divId = 'chartDiv'+plotCount;
	if(null != document.getElementById(divId))
		document.getElementById(divId).remove();
	
	let para = document.createElement("div");
	para.id=divId;

	document.getElementById("allCharts").appendChild(para);
	return para;
}