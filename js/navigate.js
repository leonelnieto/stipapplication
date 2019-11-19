const programs = {
  all: ["all", 28],
  tif: ["'Transportation Investment Funds'", 0, "TIF"],
  transSolutions: [
    "'Transportation Solutions','Barrier Treatments','Maintenance Spot Improvement','Sign Modification %26 Replacement','Small Area Lighting','SSIP - Safety Spot Improvement'",
    1, "Transportation Solutions"
  ],
  highVolumePavements: [
    "'Pavement High Volume','Preservation High Volume','Rehabilitation High Volume'",
    3, "Pavement High Volume"
  ],
  lowVolumePavements: [
    "'Pavement Low Volume','Preservation Low Volume','Rehabilitation Low Volume'",
    4, "Pavement Low Volume"
  ],
  reconstructPavements: ["'Reconstruction High Volume'", 27,"Pavement Reconstruction"],
  allStructures: [
    "'Bridge Replacement and Rehabilitation','Bridge Preservation'",
    29, "All Structures"
  ],
  preserveStructures: ["'Bridge Preservation'", 5, "Structures Preservation"],
  rehabStructures: ["'Bridge Replacement and Rehabilitation'", 6, "Structures Rehab or Replace"],
  allTrafficSafety: [
    "'HSIP - Highway Safety Improvement', 'Safe Routes to Schools','New Traffic Signals','Railway-Highway Grade Crossing'",
    25, "Traffic & Safety"
  ],
  HSIP: ["'HSIP - Highway Safety Improvement'", 7, "HSIP"],
  newTrafficSignals: ["'New Traffic Signals'", 14, "New Traffic Signals"],
  railHighwayCrossing: ["'Railway-Highway Grade Crossing'", 13, "Rail-Highway Grade Crossing"],
  safeRoutesToSchool: ["'Safe Routes to Schools'", 11, "Safe Routes to School"],
  MPO: ["'MPO Projects'", 26, "MPO"],
  offSystemBridge: ["'Off-System Bridge'", 16,'Off-System Bridge'],
  nonUrban: ["'Non-Urban'", 17,'Non-Urban'],
  smallUrban: ["'Small Urban'", 18,'Small Urban'],
  statePark: ["'State Park Access'", 19,'State Park Access'],
  environmentalStudies: ["'Environmental Studies'", 21,'Environmental Studies'],
  freightProgram: ["'Freight'", 15,'Freight'],
  transportationAlternatives: ["'Transportation Alternatives'", 20,'Transportation Alternatives'],
  contingencyFund: ["'Contingency Fund'", 2,'Contingency Fund'],
  ATMSAsset: ["'ATMS Asset Management'", 22,'ATMS Asset Management'],
  Other: ["'Other'", 24,'Other']
};

const regionName = { 
  0: "Statewide",
  1: "Region 1",
  2: "Region 2",
  3: "Region 3",
  4: "Region 4"
};

for (i = 0; i < document.querySelectorAll("#sidebarNav li").length; i++) {
  document.querySelectorAll("#sidebarNav li a")[i].addEventListener("click", function(event) {
      let regionNum = document.getElementsByTagName("wrapper")[0].getAttribute("region");
      if (event.target.attributes.section.value !== "null") {
        
        let program = event.target.attributes.section.value;
        document.getElementById("currentProgram").innerHTML = programs[program][2]
        document.getElementsByTagName("wrapper")[0].setAttribute("program", program);
        draw(programs[program][0], programs[program][1], parseInt(regionNum));

      }
    });
}

for (i = 0; i < document.querySelectorAll(".filterregion").length; i++) {
  document.querySelectorAll(".filterregion")[i].addEventListener("click", function(event) {
      let regionDisplay = document.getElementById("currentRegion");
      let program = document.getElementsByTagName("wrapper")[0].getAttribute("program");
      let regionNum = event.target.attributes.region.value;

      regionDisplay.innerHTML = regionName[regionNum];
      document.getElementsByTagName("wrapper")[0].setAttribute("region", regionNum);
      
      draw(programs[program][0], programs[program][1], parseInt(regionNum));
    });
}
