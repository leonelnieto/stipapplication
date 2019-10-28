var region = getAllUrlParams(window.location.href)["region"];

if(region === undefined){
    region = 0;
}

function draw(workshop, regionNumber){
    dataTableBuilder('unfunded',workshop,'#pills-unfundedtbl',region);
    dataTableBuilder('proposed',workshop,'#pills-proposedtbl',region);
    dataTableBuilder('comapp',workshop,'#pills-comapptbl',region);
    dataTableBuilder('design',workshop,'#pills-designtbl',region);
    dataTableBuilder('construction',workshop,'#pills-constructiontbl',region);

    mapLoaderDynamic("map",parseInt(region),regionNumber);
}

function drawProposed(agg, workshop){
    drillVisual('proposed',workshop,'proposedbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('proposed',workshop,'proposedbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('proposed',workshop,'proposedbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('proposed',workshop,'proposedbyRegionTable','REGION_CD',agg,'table',region);
}

function drawComApp(agg, workshop) {
    drillVisual('comapp',workshop,'comappbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('comapp',workshop,'comappbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('comapp',workshop,'comappbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('comapp',workshop,'comappbyRegionTable','REGION_CD',agg,'table',region);
}

function drawDesign(agg, workshop){
    drillVisual('design',workshop,'designbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('design',workshop,'designbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('design',workshop,'designbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('design',workshop,'designbyRegionTable','REGION_CD',agg,'table',region);
}

function drawConstruction(agg, workshop){
    drillVisual('construction',workshop,'constructionbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('construction',workshop,'constructionbyYearTable','FORECAST_ST_YR',agg,'table',region);
    drillVisual('construction',workshop,'constructionbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('construction',workshop,'constructionbyRegionTable','REGION_CD',agg,'table',region);
}

function drawUnfunded(agg, workshop){
    drillVisual('unfunded',workshop,'unfundedbyRegionChart','REGION_CD',agg,'chart',region);
    drillVisual('unfunded',workshop,'unfundedbyRegionTable','REGION_CD',agg,'table',region);
    drillVisual('unfunded',workshop,'unfunedbyYearChart','FORECAST_ST_YR',agg,'chart',region);
    drillVisual('unfunded',workshop,'unfunedbyYearTable','FORECAST_ST_YR',agg,'table',region);
}

for(i=0;i<document.querySelectorAll(".proposed").length;i++){
    document.querySelectorAll(".proposed")[i].addEventListener("click", function(event){
        setTimeout(function(){drawProposed(event.target.attributes.agg.value, event.target.attributes.workshop.value)},500)
    })
};

for(i=0;i<document.querySelectorAll(".comapp").length;i++){
    document.querySelectorAll(".comapp")[i].addEventListener("click", function(event){
        setTimeout(function(){drawComApp(event.target.attributes.agg.value, event.target.attributes.workshop.value)},500)
    })
};

for(i=0;i<document.querySelectorAll(".design").length;i++){
    document.querySelectorAll(".design")[i].addEventListener("click", function(event){
        setTimeout(function(){drawDesign(event.target.attributes.agg.value, event.target.attributes.workshop.value)},500)
    })
};

for(i=0;i<document.querySelectorAll(".construction").length;i++){
    document.querySelectorAll(".construction")[i].addEventListener("click", function(event){
        setTimeout(function(){drawConstruction(event.target.attributes.agg.value, event.target.attributes.workshop.value)},500)
    })
};

for(i=0;i<document.querySelectorAll(".unfunded").length;i++){
    document.querySelectorAll(".unfunded")[i].addEventListener("click", function(event){
        setTimeout(function(){drawUnfunded(event.target.attributes.agg.value, event.target.attributes.workshop.value)},500)
    })
};