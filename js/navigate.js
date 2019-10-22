sections = {
    tif:["'Transportation Investment Funds'", 0],
    transSolutions:["'Transportation Solutions','Barrier Treatments','Maintenance Spot Improvement','Sign Modification %26 Replacement','Small Area Lighting','SSIP - Safety Spot Improvement'", 1],
    highVolumePavements:["'Pavement High Volume','Preservation High Volume','Rehabilitation High Volume'", 3],
    lowVolumePavements:["'Pavement Low Volume','Preservation Low Volume','Rehabilitation Low Volume'", 4],
    reconstructPavements:["'Reconstruction High Volume'", 27],
    allStructures:["'Bridge Replacement and Rehabilitation','Bridge Preservation'", 29],
    preserveStructures:["'Bridge Preservation'", 5],
    rehabStructures:["'Bridge Replacement and Rehabilitation'", 6],
    allTrafficSafety:["'HSIP - Highway Safety Improvement', 'Safe Routes to Schools','New Traffic Signals','Railway-Highway Grade Crossing'", 25],
    HSIP:["'HSIP - Highway Safety Improvement'", 7],
    newTrafficSignals:["'New Traffic Signals'", 14],
    railHighwayCrossing:["'Railway-Highway Grade Crossing'", 13],
    safeRoutesToSchool:["'Safe Routes to Schools'", 11],
    MPO:["'MPO Projects'", 26],
    offSystemBridge:["'Off-System Bridge'", 16],
    nonUrban:["'Non-Urban'", 17],
    smallUrban:["'Small Urban'", 18],
    statePark:["'State Park Access'", 19],
    environmentalStudies:["'Environmental Studies'", 21],
    freightProgram:["'Freight'", 15],
    transportationAlternatives:["'Transportation Alternatives'", 20],
    contingencyFund:["'Contingency Fund'", 2],
    ATMSAsset:["'ATMS Asset Management'", 22],
    Other:["'Other'", 24]
}

for(i=0;i<document.querySelectorAll("#sidebarNav li").length;i++){
    document.querySelectorAll("#sidebarNav li a")[i].addEventListener("click", function(event){
        if(event.target.attributes.section.value !== undefined){
            var section = event.target.attributes.section.value;
            draw(sections[section][0], sections[section][1]);
        }
    })
}