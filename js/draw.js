function draw(program, programIndex,region){
    dataTableBuilder('unfunded',program,'#pills-unfundedtbl',region);
    dataTableBuilder('proposed',program,'#pills-proposedtbl',region);
    dataTableBuilder('comapp',program,'#pills-comapptbl',region);
    dataTableBuilder('design',program,'#pills-designtbl',region);
    dataTableBuilder('construction',program,'#pills-constructiontbl',region);

    mapLoaderDynamic(parseInt(region),programIndex);
}

function drawProposed(agg){
    let program = document.getElementById("currentProgram").getAttribute("value");
    let region = parseInt(document.getElementById("currentRegion").getAttribute("value"));
    drillVisual('proposed',program,'proposedbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('proposed',program,'proposedbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('proposed',program,'proposedbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('proposed',program,'proposedbyRegionTable','REGION_CD',agg,'table',region);
}

function drawComApp(agg) {
    let program = document.getElementById("currentProgram").getAttribute("value");
    let region = parseInt(document.getElementById("currentRegion").getAttribute("value"));
    drillVisual('comapp',program,'comappbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('comapp',program,'comappbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('comapp',program,'comappbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('comapp',program,'comappbyRegionTable','REGION_CD',agg,'table',region);
}

function drawDesign(agg){
    let program = document.getElementById("currentProgram").getAttribute("value");
    let region = parseInt(document.getElementById("currentRegion").getAttribute("value"));
    drillVisual('design',program,'designbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('design',program,'designbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('design',program,'designbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('design',program,'designbyRegionTable','REGION_CD',agg,'table',region);
}

function drawConstruction(agg){
    let program = document.getElementById("currentProgram").getAttribute("value");
    let region = parseInt(document.getElementById("currentRegion").getAttribute("value"));
    drillVisual('construction',program,'constructionbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('construction',program,'constructionbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('construction',program,'constructionbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('construction',program,'constructionbyRegionTable','REGION_CD',agg,'table',region);
}

function drawUnfunded(agg){
    let program = document.getElementById("currentProgram").getAttribute("value");
    let region = parseInt(document.getElementById("currentRegion").getAttribute("value"));

    drillVisual('unfunded',program,'unfundedbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('unfunded',program,'unfundedbyRegionTable','REGION_CD',agg,'table',region);
    drillVisual('unfunded',program,'unfunedbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('unfunded',program,'unfunedbyYearTable','FORECAST_ST_YR',agg,'table',region);
}

function removeSelected(elements){
    //this function expects an array of DOM elements
    for(i=0; i<elements.length; i++){
        if(elements[i].className.indexOf("selected") !== -1){
            elements[i].className = elements[i].className.slice(0, -9);
        }
    }
}

function addSelectedFinance(elementEvent){
    if(elementEvent.target.className.indexOf("finance") !== -1){
        removeSelected(document.querySelectorAll(".finance"));
        elementEvent.target.className += " selected";
    }
}

for(i=0;i<document.querySelectorAll(".proposed").length;i++){
    document.querySelectorAll(".proposed")[i].addEventListener("click", function(event){
        setTimeout(function(){drawProposed(event.target.attributes.agg.value, event.target.attributes.workshop.value)},500)
        addSelectedFinance(event);
    })
};

for(i=0;i<document.querySelectorAll(".comapp").length;i++){
    document.querySelectorAll(".comapp")[i].addEventListener("click", function(event){
        setTimeout(function(){drawComApp(event.target.attributes.agg.value)},500)
        addSelectedFinance(event);
    })
};

for(i=0;i<document.querySelectorAll(".design").length;i++){
    document.querySelectorAll(".design")[i].addEventListener("click", function(event){
        setTimeout(function(){drawDesign(event.target.attributes.agg.value)},500)
        addSelectedFinance(event);
    })
};

for(i=0;i<document.querySelectorAll(".construction").length;i++){
    document.querySelectorAll(".construction")[i].addEventListener("click", function(event){
        setTimeout(function(){drawConstruction(event.target.attributes.agg.value)},500)
        addSelectedFinance(event);
    })
};

for(i=0;i<document.querySelectorAll(".unfunded").length;i++){
    document.querySelectorAll(".unfunded")[i].addEventListener("click", function(event){
        setTimeout(function(){drawUnfunded(event.target.attributes.agg.value)},500)
        addSelectedFinance(event);
    })
};