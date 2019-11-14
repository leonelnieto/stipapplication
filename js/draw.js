function draw(program, programIndex, region) {
  dataTableBuilder("unfunded", program, "#pills-unfundedtbl", region);
  dataTableBuilder("proposed", program, "#pills-proposedtbl", region);
  dataTableBuilder("comapp", program, "#pills-comapptbl", region);
  dataTableBuilder("design", program, "#pills-designtbl", region);
  dataTableBuilder("construction", program, "#pills-constructiontbl", region);
  getSelectedPill();
  mapLoaderDynamic(parseInt(region), programIndex);
}

function drawCharts(agg, projPhase) {
  let program = document
    .getElementById("currentProgram")
    .getAttribute("program");

  let region = parseInt(
    document.getElementById("currentRegion").getAttribute("region")
  );
  drillVisual(
    projPhase,
    programs[program][0],
    `${projPhase}byRegionChart`,
    "REGION_CD",
    agg,
    "chart",
    region
  );
  drillVisual(
    projPhase,
    programs[program][0],
    `${projPhase}byRegionTable`,
    "REGION_CD",
    agg,
    "table",
    region
  );
  drillVisual(
    projPhase,
    programs[program][0],
    `${projPhase}byYearChart`,
    "FORECAST_ST_YR",
    agg,
    "chart",
    region
  );
  drillVisual(
    projPhase,
    programs[program][0],
    `${projPhase}byYearTable`,
    "FORECAST_ST_YR",
    agg,
    "table",
    region
  );
}

function removeSelected(elements) {
  //this function expects an array of DOM elements
  for (i = 0; i < elements.length; i++) {
    if (elements[i].className.indexOf("selected") !== -1) {
      elements[i].className = elements[i].className.slice(0, -9);
    }
  }
}

function addSelectedFinance(elementEvent, projPhase) {
  removeSelected(document.querySelectorAll(".finance"));
  if (elementEvent.target.className.indexOf("finance") !== -1) {
    elementEvent.target.className += " selected";
  } else {
    let elements = document.querySelectorAll(projPhase);
    for (i = 0; i < elements.length; i++) {
      if (elements[i].id == "projVal") {
        elements[i].classList.add("selected");
      }
    }
  }
}

function getSelectedPill() {
  let phases = ["unfunded", "proposed", "comapp", "design", "construction"];
  let pills = document.querySelectorAll(".data-pill");
  for (i = 0; i < pills.length; i++) {
    if (pills[i].classList.contains("active")) {
      phases.forEach(function(phase) {
        if (pills[i].classList.contains(phase)) {
          getSelectedAgg(phase);
        }
      });
    }
  }
}

function getSelectedAgg(phase) {
  let aggButtons = document.querySelectorAll(`.${phase}`);
  for (i = 0; i < aggButtons.length; i++) {
    if (aggButtons[i].classList.contains("selected")) {
      drawCharts(aggButtons[i].attributes.agg.value, phase);
    }
  }
}

for (i = 0; i < document.querySelectorAll(".unfunded").length; i++) {
  document
    .querySelectorAll(".unfunded")
    [i].addEventListener("click", function(event) {
      drawCharts(event.target.attributes.agg.value, "unfunded");
      addSelectedFinance(event, ".unfunded");
    });
}

for (i = 0; i < document.querySelectorAll(".proposed").length; i++) {
  document
    .querySelectorAll(".proposed")
    [i].addEventListener("click", function(event) {
      drawCharts(event.target.attributes.agg.value, "proposed");
      addSelectedFinance(event, ".proposed");
    });
}

for (i = 0; i < document.querySelectorAll(".comapp").length; i++) {
  document
    .querySelectorAll(".comapp")
    [i].addEventListener("click", function(event) {
      drawCharts(event.target.attributes.agg.value, "comapp");
      addSelectedFinance(event, ".comapp");
    });
}

for (i = 0; i < document.querySelectorAll(".design").length; i++) {
  document
    .querySelectorAll(".design")
    [i].addEventListener("click", function(event) {
      drawCharts(event.target.attributes.agg.value, "design");
      addSelectedFinance(event, ".design");
    });
}

for (i = 0; i < document.querySelectorAll(".construction").length; i++) {
  document
    .querySelectorAll(".construction")
    [i].addEventListener("click", function(event) {
      drawCharts(event.target.attributes.agg.value, "construction");
      addSelectedFinance(event, ".construction");
    });
}
