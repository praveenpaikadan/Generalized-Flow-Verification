console.log(`
// Flow Verification Area Estimator Tool - version 1.0
// Author : Praveen Paikadan (praveen.paikadan@atkinsglobal.com | praveenpaikadan@gmail.com)
`)

var SIM_TIME_STEPS = []
var FLOW_COMPONENTS = []
var FACTORS = []

var FS_TIME_STEP = []
var FS_FLOW = []
var SELECTED_FM_INDEX = -1

var RG_TIME_STEP = []
var RG_DATA = []
var SELECTED_RG_INDEX = -1

var AllFlowControlItems = []

var SUB_DATA = {}
var RUNOFF_AREA_NAMES = []


const arrayMinMax = (arr) =>
      arr.reduce(([min, max], val) => [Math.min(min, val), Math.max(max, val)], [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ]);

const displaySubData = () => {
// Define the object to be displayed as an HTML table
	var data = SUB_DATA;

	// Get a reference to the container element where the table will be inserted
	var container = document.getElementById("table-container");

	// Create a new HTML table element
	var table = document.createElement("table");

	// Create a new row for each key
	var row = document.createElement("tr");

	// Create a new cell for the key
	var keyCell = document.createElement("td");
	keyCell.innerHTML = ""

	// Append the cells to the row
	row.appendChild(keyCell);
	
	RUNOFF_AREA_NAMES.forEach(item => {
		var cell = document.createElement("td");
		cell.innerHTML = item
		row.appendChild(cell);
	})

	// Append the row to the table
	table.appendChild(row);


	// Loop through the keys of the object
	for (var key in data) {
		// Create a new row for each key
		var row = document.createElement("tr");

		// Create a new cell for the key
		var keyCell = document.createElement("td");
		keyCell.innerHTML = "Land use ID - " + key;

		// Append the cells to the row
		row.appendChild(keyCell);
		
		data[key].forEach(item => {
			var cell = document.createElement("td");
			cell.innerHTML = Number(item.toFixed(8))
			row.appendChild(cell);
		})

		// Append the row to the table
		table.appendChild(row);
	}

	// Append the table to the container element
	container.appendChild(table);

}



const formatDateToYYYY_MM_DD_HH_mm_ss = (inpDate) => { // 23/03/2022 13:56:00 => input format
	inpDate = inpDate.replace("at ", "").replaceAll("-", "/")
	var splitted =  inpDate.split("/")
	var sub_splitted = splitted[2].split(" ")
	var outDate = sub_splitted[0] + "-" + splitted[1] + "-" + splitted[0] + " " + sub_splitted[1] + ":00"
	return outDate
}

const getFactoredFlow = () => {
	var flowComponents  = JSON.parse(JSON.stringify(FLOW_COMPONENTS))
	return flowComponents.map((item, index) => {item.flow = item.flow.map(i => i * FACTORS[index]); return item})
	//return flowComponents
}

const getTotalFlow = (factoredFlowArray) => {
	if(factoredFlowArray.length === 0) {return []}
	var totalFlow = []
	for(let i =0 ; i < factoredFlowArray[0].length ; i++ ){
		var sum = 0
		for(let j=0 ; j < factoredFlowArray.length ; j++){
			sum = sum + factoredFlowArray[j][i]
		}
		totalFlow.push(sum)
	}
	return totalFlow
}

const createPlotData = () => {
	
	var observedPlotData =  {
		  x: SELECTED_FM_INDEX === -1 ? [] : FS_TIME_STEP,
		  y: SELECTED_FM_INDEX === -1 ? [] : FS_FLOW[SELECTED_FM_INDEX]["flow"],
		  mode:"lines",
		  name: "Observed Flows",
		  line: {
			color: 'green',
			width: 2
			}
		}

	var factoredFlow = getFactoredFlow()
	console.log("factored" , factoredFlow, "Original", FLOW_COMPONENTS)
	var data = [observedPlotData]
	
	factoredFlow.forEach((item, index) => {
		data.push({
		  x: FACTORS[index] === 0 ? [] : SIM_TIME_STEPS,
		  y: FACTORS[index] === 0 ? [] : item["flow"],
		  mode:"lines",
		  name: item["category"] +" "+ item["name"],
		  line: {
			width: 1
			}
		})
	})
	
	data.push({
		  x: SIM_TIME_STEPS,
		  y: getTotalFlow(factoredFlow.map(item => item["flow"])),
		  mode:"lines",
		  name: "Total Flow",
		  line: {
			color: 'red',
			width: 2
			}
		})
		
	var observedRGPlotData =  {
		  x: SELECTED_RG_INDEX === -1 ? [] : RG_TIME_STEP,
		  y: SELECTED_RG_INDEX === -1 ? [] : RG_DATA[SELECTED_RG_INDEX]["rain"],
		  mode:"lines",
		  fill: 'tozeroy',
		  name: "Observed Rain",
		  yaxis: 'y2',
		  line: {
			color: 'blue',
			width: 2
			},
		  
		}
		
	if(SELECTED_RG_INDEX > -1){
		data = data.map(item => {item.yaxis = 'y'; return item})
		data.push(observedRGPlotData)
	}		
		
	return data
}

const inital_plot = () => {

	//console.log(calculated)
	FACTORS = FACTORS.map(i => 0.00001)
	var data = createPlotData()
	
	console.log(data)
	
    // Define Layout
    var minMax = arrayMinMax([data["DWF"]])

    //var maxY  = minMax[1]
    //var minY = Math.min.apply(null, [minMax[0], 0])

    var layout1 = {
      xaxis: {title: "Time", type: 'scatter'},
      //yaxis: {range: [minY, maxY], title: "Flow(m3/s)"},
	  yaxis: {title: "Flow(m3/s)"},
      title: "Flow Graph",
	  autosize: false,
	  mode: 'lines',
	  width: screen.width *0.9,
	  height: 700,
	  margin: {
		l: 120,
		r: 10,
		b: 200,
		t: 150,
		pad: 20
	  },
	  paper_bgcolor: 'white',
	  plot_bgcolor: 'white'
    };
	
	var layout2 = {
      xaxis: {title: "Time", type: 'scatter'},
      //yaxis: {range: [minY, maxY], title: "Flow(m3/s)"},
	  yaxis: {title: "Flow(m3/s)", domain: [0, 0.65]},
	  yaxis2: {title: "Rain(mm/hr)", domain: [0.7, 1], autorange: 'reversed'},
      title: "Flow Graph",
	  autosize: false,
	  mode: 'lines',
	  width: screen.width *0.9,
	  height: 700,
	  margin: {
		l: 120,
		r: 10,
		b: 200,
		t: 150,
		pad: 20
	  },

	  paper_bgcolor: 'white',
	  plot_bgcolor: 'white',
	  separators: '0,5,5'
    };

	var layout = SELECTED_RG_INDEX === -1 ? layout1 : layout2
    // Display using Plotly
    Plotly.newPlot("myPlot", data, layout);
	FACTORS = FACTORS.map(i => 0)
	update_plot()
    //return {corrected: outData, filename: 'tc_' + (edmmode?'edm_':'rain_') + header[1].replace(/'/g, "") + (edmmode?((datatype === '%'?('_sp='+ sp): ('_input_data_in_'+datatype))):''), edmmode, sp, tolerance, datatype, ignoreBelow:  ignoreBelowElem.value, ignoreAbove: ignoreAboveElem.value, header}
}


// ===================



const update_plot = () => {
	var data = createPlotData()
	console.log(data)
	var data_update = {'y': data.map(item => item.y)}
	console.log(data_update)
	Plotly.update("myPlot", data_update, {}, Array.from({length: data.length }, (_, i) => i))
	
	//fs data 
	data_update = {'x': data.map(item => item.x)}
	Plotly.update("myPlot", data_update, {}, Array.from({length: data.length }, (_, i) => i))
}


const getCoreSimData = (data) => {
	
	FLOW_COMPONENTS = {categories: [], names: [], timesteps: [], flows: []}
	FACTORS = new Array(data[0].length-1).fill(0)
	
	for(var i = 2; i < data.length-1; i++){
		if(data[i][0] !== ""){
			//FLOW_COMPONENTS.timesteps.push(data[i][0])
			FLOW_COMPONENTS.timesteps.push(formatDateToYYYY_MM_DD_HH_mm_ss(data[i][0]))
		}else{
			break
		}
	}

	for(var i = 1; i < data[0].length; i++){
		FLOW_COMPONENTS.categories.push(data[0][i].trim())
		FLOW_COMPONENTS.names.push(data[1][i].trim())
		FLOW_COMPONENTS.flows.push([])
	}
	
	for(var i = 2; i < FLOW_COMPONENTS.timesteps.length + 2; i++){
		for(var j = 1; j < data[0].length; j++){
			FLOW_COMPONENTS.flows[j-1].push(Number(data[i][j]))
		}
	}
	
	// restructuring data
	SIM_TIME_STEPS = FLOW_COMPONENTS.timesteps
	FLOW_COMPONENTS = FLOW_COMPONENTS.categories.map((item, index) => {return {category: FLOW_COMPONENTS.categories[index], categoryID: FLOW_COMPONENTS.categories[index].replace(/\s/g, ""), name: FLOW_COMPONENTS.names[index], flow: FLOW_COMPONENTS.flows[index]}})

}

const getFSData = (data) => {
	
	FS_TIME_STEP = [] 
	FS_FLOW = []
	for(var i = 1; i < data[0].length ; i++){
		FS_FLOW.push({id: data[0][i], flow: []})		
	}
	
	for(var i = 1; i < data.length ; i++){
		if(!data[i][0]){break}
		FS_TIME_STEP.push(formatDateToYYYY_MM_DD_HH_mm_ss(data[i][0]))
		for(let j = 1; j < data[0].length;j++){
			FS_FLOW[j-1]["flow"].push(data[i][j])
		}		
	}	
}

const getRGData = (data) => {
	
	RG_TIME_STEP = [] 
	RG_DATA = []
	for(var i = 1; i < data[0].length ; i++){
		RG_DATA.push({id: data[0][i], rain: []})		
	}
	
	for(var i = 1; i < data.length ; i++){
		if(!data[i][0]){break}
		RG_TIME_STEP.push(formatDateToYYYY_MM_DD_HH_mm_ss(data[i][0]))
		for(let j = 1; j < data[0].length;j++){
			RG_DATA[j-1]["rain"].push(data[i][j])
		}		
	}	
}

const getSubData = (data) => {
	var namesOfRunoffAreas = []
	var indexOfRunoffAreas = []
	
	for(var i =0; i < data[0].length ; i++){
		if((data[0][i].includes("Runoff area") && data[0][i].includes("absolute")) || data[0][i].includes("Population") || data[0][i].includes("Base flow (m3/s)") || data[0][i].includes(("Additional foul flow") )){
			indexOfRunoffAreas.push(i)
			namesOfRunoffAreas.push(data[0][i])
		}
	}
	
	let iol = data[0].indexOf("Land use ID")
	console.log(iol)
	for(var i = 1; i < data.length ; i++){
		if(data[i][0] === ""){continue}
		let luid = data[i][iol]
		if(!SUB_DATA[luid]){
			SUB_DATA[luid] = new Array(indexOfRunoffAreas.length).fill(0)
		}
		
		SUB_DATA[luid] = SUB_DATA[luid].map((k, m) => k + Number(data[i][indexOfRunoffAreas[m]])) 
	}
	RUNOFF_AREA_NAMES = namesOfRunoffAreas
	console.log(SUB_DATA)
}


const handleResult = (result, type) => {

    if(result.error){
        //console.log(`<b style="color: red;">Error<b/>. Check input file <br/><br/>`+guidenceText)
        //console.log('Error in parsing. Aborted')
        return
    }else{
		if(type==="subs"){
			getSubData(result.data)
			displaySubData()
			return
		}
		
		//console.log(result.data)
		if(type==="SIM"){
			getCoreSimData(result.data)
			createControlArea()
		}else if(type==="FSFlow"){
			getFSData(result.data)
			createControlsForFS()
		}else if(type==="FSRain"){
			getRGData(result.data)
			createControlsForRG()
		}
		//set_total(extracted["sub_data_totals"])
		//update_percentage([1,1,1])
		inital_plot()
    }
}


const createControlsForFS = () => {
	const optionsArray = FS_FLOW.map(item => item.id)
	const parentElement = document.getElementById("fs-controls-area");
	parentElement.innerHTML = '';

	const selectElement = document.createElement("select");

	optionsArray.forEach((option, index) => {
	  const optionElement = document.createElement("option");
	  optionElement.textContent = option;
	  optionElement.value = index;
	  selectElement.appendChild(optionElement);
	});
	
	parentElement.appendChild(selectElement);
	SELECTED_FM_INDEX = optionsArray.length > 0 ? 0 : -1 
	selectElement.addEventListener('change', function() {
		SELECTED_FM_INDEX = this.value;
		update_plot()
	});

}

const createControlsForRG = () => {
	const optionsArray = RG_DATA.map(item => item.id)
	const parentElement = document.getElementById("rg-controls-area");
	parentElement.innerHTML = '';

	const selectElement = document.createElement("select");

	optionsArray.forEach((option, index) => {
	  const optionElement = document.createElement("option");
	  optionElement.textContent = option;
	  optionElement.value = index;
	  selectElement.appendChild(optionElement);
	});
	
	parentElement.appendChild(selectElement);
	SELECTED_RG_INDEX = optionsArray.length > 0 ? 0 : -1 
	selectElement.addEventListener('change', function() {
		SELECTED_RG_INDEX = this.value;
		update_plot()
	});

}

const createControlArea = () => {
	
	AllFlowControlItems = FLOW_COMPONENTS.map((item, index) => {
		var newElem = document.createElement("div", {className: `control-item ${item.categoryID}`});
		newElem.className = `control-item ${item.categoryID}`
		newElem.id = "control_item_" + String(index)
		newElem.innerHTML = `
            <label class="row" >${item.name}</label>
			<div style="display: flex" > 
				<input style="margin-top: 2px" title="${item.name} (${item.category})" class="row inp num area_hect" id="factor_${index}" type="number" value="0" name="${item.name}" min="0" step="0.1"/>
				<label class="unit">ha</label>
			</div>
			<!--div style="display: flex" > 
				<input style="margin-top: 2px" title="Percenatge of applied area (value above) with respect to total available R1 from ATO (value below)." class="row per_inp perc" id="perc_${index}" type="number" value="1" name="${item.name}" min="0" step="0.1"/>
				<label class="unit">%</label>
			</div-->
			<!--label title="Total avaialble R1: Sum of ATO values from imported subcatchment data" class="row t" id="avl_r1"></label-->
		`
		
		return {categoryID: item.categoryID, category: item.category, elem: newElem, itemID: index}
	})
	
	categoryItemMap = {}
	
	for(let i=0; i<AllFlowControlItems.length; i++){
		let cat = AllFlowControlItems[i]["category"]
		if(!categoryItemMap.hasOwnProperty(cat)){
			categoryItemMap[cat] = []
		}
		categoryItemMap[cat].push(i)
	}
	
	AllFlowControlItems.forEach(item => {
		item.elem.onchange = (e) =>{
			FACTORS[item.itemID] = Number(e.target.value)
			update_plot()
		};
	} )
	
	console.log(categoryItemMap)

	var targetElem = document.getElementById("controls-area");
	targetElem.innerHTML = '';
	
	for(let key in categoryItemMap){
		var newCatElem = document.createElement("div");
		newCatElem.className = `category-wrapper`
		targetElem.appendChild(newCatElem);
		var newLabelElem = document.createElement("h6");
		newLabelElem.className = "category-label"
		newLabelElem.innerHTML = key
		newCatElem.appendChild(newLabelElem);
		var newWrapperElem = document.createElement("div");
		newWrapperElem.className = "category-item"
		newCatElem.appendChild(newWrapperElem);
		categoryItemMap[key].forEach(index => {newWrapperElem.appendChild(AllFlowControlItems[index].elem)}) 
	}
}

const loadData = (type, elementID) => {
    const csvFile = document.getElementById(elementID);
    const input = csvFile.files[0];
    var config =  {
        delimiter: "",	// auto-detect
        newline: "",	// auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: false,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        complete: (result) => {handleResult(result, type)},
        error: undefined,
        download: false,
        skipEmptyLines: false,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }
    try{
        Papa.parse(input, config)
    }catch(error){
        console.log(error)
        console.log('Error')
    }
}

