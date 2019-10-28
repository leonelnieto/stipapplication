//A second version of map loader 
function mapLoaderDynamic(dom, region, program) {
    let centerLong = -111.693657;
    let centerLat = 39.631301;
    let zoom = 2500000;
    switch (region) {
        case 1:
            centerLong = -112.455054;
            centerLat = 41.343983;
            zoom = 700000;
            break;
        case 2:
            centerLong = -111.667910;
            centerLat = 40.680967;
            zoom = 1200000;
            break;
        case 3:
            centerLong = -111.534103;
            centerLat = 40.134867;
            zoom = 1200000;
            break;
        case 4:
            centerLong = -111.662749;
            centerLat = 38.377228;
            zoom = 1400000;
            break;
    }

    let mapFilter = region ? "AND REGION_CD ='" + region + "'" : "";

    require(["esri/Map", "esri/views/MapView", "esri/widgets/Legend", "esri/layers/FeatureLayer", "esri/widgets/Expand", "esri/widgets/BasemapToggle"],
        function (Map, MapView, Legend, FeatureLayer, Expand, BasemapToggle) {
            let selectedCounty = selectedMunicipality = selectedLegislative = selectedStatus = 0;
            //symbols for year lines
            const year2018 = { type: "simple-line", color: "#A87000", width: 4, style: "solid" };
            const year2019 = { type: "simple-line", color: "#4ce600", width: 4, style: "solid" };
            const year2020 = { type: "simple-line", color: "#00a9e6", width: 4, style: "solid" };
            const year2021 = { type: "simple-line", color: "#005ce6", width: 4, style: "solid" };
            const year2022 = { type: "simple-line", color: "#ffaa00", width: 4, style: "solid" };
            const year2023 = { type: "simple-line", color: "#1a1a1a", width: 4, style: "solid" };
            const year2024 = { type: "simple-line", color: "#fc30cd", width: 4, style: "solid" };
            const year2025 = { type: "simple-line", color: "#e64c00", width: 4, style: "solid" };
            const year2026 = { type: "simple-line", color: "#e60000", width: 4, style: "solid" };
            const year2027 = { type: "simple-line", color: "#a87000", width: 4, style: "solid" };
            //values for feature rendering lines
            const STIPRender = {
                type: "unique-value",
                field: "FORECAST_ST_YR",
                uniqueValueInfos: [ // used for specifying unique values
                    { value: "2018", symbol: year2018, label: "2018" },
                    { value: "2019", symbol: year2019, label: "2019" },
                    { value: "2020", symbol: year2020, label: "2020" },
                    { value: "2021", symbol: year2021, label: "2021" },
                    { value: "2022", symbol: year2022, label: "2022" },
                    { value: "2023", symbol: year2023, label: "2023" },
                    { value: "2024", symbol: year2024, label: "2024" },
                    { value: "2025", symbol: year2025, label: "2025" },
                    { value: "2026", symbol: year2026, label: "2026" },
                    { value: "2027", symbol: year2027, label: "2027" }
                ]
            };
            //Map Query Statements
            const filter = ["WORKSHOP_CAT = 'Transportation Investment Funds' AND STIP_WORKSHOP_YR = '2019'", //0 TransportationInvestmentFunds - no records
                "WORKSHOP_CAT = 'Transportation Solutions' AND STIP_WORKSHOP_YR = '2019'",//1 TransportationSolutions
                "WORKSHOP_CAT = 'Contingency Fund' AND STIP_WORKSHOP_YR = '2019'", //2 ContingencyFund - no records
                "STIP_WORKSHOP_YR = '2019' AND (WORKSHOP_CAT = 'Preservation High Volume' OR WORKSHOP_CAT = 'Rehabilitation High Volume')", //3 PavementHighVolume 
                "STIP_WORKSHOP_YR = '2019' AND (WORKSHOP_CAT = 'Preservation Low Volume' OR WORKSHOP_CAT = 'Rehabilitation Low Volume')", //4 PavementLowVolume
                "WORKSHOP_CAT = 'Bridge Preservation' AND STIP_WORKSHOP_YR = '2019'", //5 BridgePreservation
                "WORKSHOP_CAT = 'Bridge Replacement and Rehabilitation' AND STIP_WORKSHOP_YR = '2019'", //6 BridgeReplacementandRehabilitation
                "WORKSHOP_CAT = 'HSIP - Highway Safety Improvement' AND STIP_WORKSHOP_YR = '2019'", //7 HighwaySafetyImprovement
                "WORKSHOP_CAT = 'SSIP - Safety Spot Improvement' AND STIP_WORKSHOP_YR = '2019'", //8 SafetySpotImprovement - I think this one is being retired
                "WORKSHOP_CAT = 'Barrier Treatments' AND STIP_WORKSHOP_YR = '2019'", //9 BarrierTreatments - no records
                "WORKSHOP_CAT = 'Small Area Lighting' AND STIP_WORKSHOP_YR = '2019'", //10 SmallAreaLighting - no records
                "WORKSHOP_CAT = 'Safe Routes to Schools' AND STIP_WORKSHOP_YR = '2019'", //11 SafeRoutestoSchools - no records
                "WORKSHOP_CAT = 'Sign Modification & Replacement' AND STIP_WORKSHOP_YR = '2019'",//12 SignModificationReplacement - no records
                "WORKSHOP_CAT = 'Railway-Highway Grade Crossing' AND STIP_WORKSHOP_YR = '2019'", //13 RailwayHighwayGradeCrossing
                "WORKSHOP_CAT = 'New Traffic Signals' AND STIP_WORKSHOP_YR = '2019'", //14 NewTrafficSignals
                "WORKSHOP_CAT = 'Freight' AND STIP_WORKSHOP_YR = '2019'",//15 Freight - no records
                "WORKSHOP_CAT = 'Off-System Bridge' AND STIP_WORKSHOP_YR = '2019'", //16 OffSystemBridge - no records
                "WORKSHOP_CAT = 'Non-Urban' AND STIP_WORKSHOP_YR = '2019'", //17 NonUrban - no records
                "WORKSHOP_CAT = 'Small Urban' AND STIP_WORKSHOP_YR = '2019'", //18 SmallUrban - no records
                "WORKSHOP_CAT = 'State Park Access' AND STIP_WORKSHOP_YR = '2019'", //19 StateParkAccess - no records
                "WORKSHOP_CAT = 'Transportation Alternatives' AND STIP_WORKSHOP_YR = '2019'", //20 TransportationAlternatives
                "WORKSHOP_CAT = 'Environmental Studies' AND STIP_WORKSHOP_YR = '2019'", //21 EnvironmentalStudies - no records
                "WORKSHOP_CAT = 'ATMS Asset Management' AND STIP_WORKSHOP_YR = '2019'", //22 ATMSAssetManagement - no records
                "WORKSHOP_CAT = 'Federal Lands Access Program' AND STIP_WORKSHOP_YR = '2019'", //23 FederalLandsAccessProgram - no records
                "WORKSHOP_CAT = 'Other' AND STIP_WORKSHOP_YR = '2019'", //24 Other - no records
                "STIP_WORKSHOP_YR = '2019' AND (WORKSHOP_CAT = 'HSIP - Highway Safety Improvement' OR WORKSHOP_CAT = 'Safe Routes to Schools' OR WORKSHOP_CAT = 'New Traffic Signals' OR WORKSHOP_CAT = 'Railway-Highway Grade Crossing')", //25 TrafficSafety - is this one redundant?
                "WORKSHOP_CAT = 'MPO' AND STIP_WORKSHOP_YR = '2019'", //26 LocalGovernmentMPOs no records
                "WORKSHOP_CAT = 'Reconstruction High Volume' AND STIP_WORKSHOP_YR = '2019'", //27 PavementLowVolume
                "STIP_WORKSHOP_YR = '2019'", //noquery
                "STIP_WORKSHOP_YR = '2019' AND (WORKSHOP_CAT = 'Bridge Preservation' OR WORKSHOP_CAT = 'Bridge Replacement and Rehabilitation')" //29 All Structures
            ]

            // Expand widget for the queryFeature div
            let html = makeQueryForm()
            $('#map').append(html);
            console.log(filter[program] + mapFilter);
            let layer = new FeatureLayer({
                url: STIPData, // EPM STIP Service
                renderer: STIPRender, //this gives the line styles
                definitionExpression: filter[program] + mapFilter //change filter to change dataset query
                // popupTemplate: { title: "{CONCEPT_DESC}", content: "{*}" } //the popup change be changed if we want
            });

            let content = [{
                type: "fields",
                fieldInfos: [{
                    fieldName: "STIP_WORKSHOP_YR"
                }, {
                    fieldName: "WORKSHOP_CAT"
                }, {
                    fieldName: "CNTY_NAME"
                }, {
                    fieldName: "PIN_STAT_NM"
                }, {
                    fieldName: "Municipality_Name"
                }, {
                    fieldName: "UT_SENATE_DIST_NAME"
                }, {
                    fieldName: "UT_House_Dist_Name"
                }, {
                    fieldName: "PIN"
                }, {
                    fieldName: "STIP_WORKSHOP"
                }, {
                    fieldName: "PROJECT_MANAGER"
                }, {
                    fieldName: "REGION_CD"
                }, {
                    fieldName: "COMM_APRV_IND"
                }, {
                    fieldName: "PIN_DESC"
                }, {
                    fieldName: "PRIMARY_CONCEPT"
                }, {
                    fieldName: "PROJECT_VALUE"
                }, {
                    fieldName: "PLANNED_CONSTRUCTION_YEAR"
                }, {
                    fieldName: "PROJECTED_START_DATE"
                }, {
                    fieldName: "PROGRAM"
                }, {
                    fieldName: "PUBLIC_DESC"
                }, {
                    fieldName: "FORECAST_ST_YR"
                }, {
                    fieldName: "FED_DOLLARS"
                }, {
                    fieldName: "STATE_DOLLARS"
                }]
            }]
            layer.popupTemplate = { title: "{CONCEPT_DESC}", content: content };


            //initialize map
            let map = new Map({
                basemap: "streets-vector"

            });
            //create map view
            let view = new MapView({
                container: dom,
                map: map,
                center: [centerLong, centerLat], //edit to center base on lat and lon state center 39.631301,-111.693657
                scale: zoom //larger number zooms out, smaller zooms in 
            });
            map.add(layer);
            var legend = new Legend({
                view: view,
                layerInfos: [{
                    layer: layer,
                    title: "Legend"
                }]
            });
            var basemapToggle = new BasemapToggle({
                view: view,
                nextBasemap: "satellite"
            });
            const filterProjects = new Expand({
                expandIconClass: "esri-icon-filter",
                expandTooltip: "Query Projects",
                expanded: false,
                group: "top-left",
                view: view,
                content: document.getElementById("queryProjects")
            });
            view.ui.add(filterProjects, "top-left")
            view.ui.add(legend, "bottom-right");
            view.ui.add(basemapToggle, "top-right");

            layer.when(function () {
                resetQuery()
            });

            function getFeatures(sql, filters) {
                let query = layer.createQuery();
                query.where = sql
                layer.queryFeatures(query).then(function (data) {
                    let features = data.features;
                    collectAttributes(features, filters);
                });
            }

            function resetQuery(){
                selectedCounty = selectedMunicipality = selectedLegislative = selectedStatus = 0;
                const filters = buildFilter()
                let sql = makeQuery();
                getFeatures(sql, filters)
            }

            function buildFilter(){
                filters = []
                console.log(selectedCounty,selectedMunicipality,selectedLegislative,selectedStatus);
         
                if(selectedCounty == 0){
                    filters.push("County")  
                }
                if(selectedMunicipality == 0){
                    filters.push("Municipality")  
                }
                if(selectedLegislative == 0){
                    filters.push("House")  
                    filters.push("Senate")  
                }
                if(selectedStatus == 0){
                    filters.push("Status")  
                }
                
                    return filters
            
            }

            document.getElementById("queryCounty").onchange = function () {
                selectedCounty = document.getElementById("queryCounty").value;
                const filters = buildFilter()
                let sql = makeQuery();
                getFeatures(sql, filters)
            }
            document.getElementById("queryMunicipality").onchange = function () {                
                selectedMunicipality = document.getElementById("queryMunicipality").value;
                const filters = buildFilter()
                let sql = makeQuery();
                getFeatures(sql, filters)
            }
            document.getElementById("queryDistrict").onchange = function () {                
                selectedLegislative = document.getElementById("queryDistrict").value;
                const filters = buildFilter()
                let sql = makeQuery();
                getFeatures(sql, filters)
            }
            document.getElementById("queryStatus").onchange = function () {                
                selectedStatus = document.getElementById("queryStatus").value;
                const filters = buildFilter()
                let sql = makeQuery();
                getFeatures(sql, filters)
            }

            document.getElementById("resetQuery").onclick = function(){
                resetQuery()
            }

            document.getElementById("query").onclick = function () {
                let sql = makeQuery();
                console.log(sql)
                layer.definitionExpression = sql;                
            };

            function makeQuery() {
                let countyQuery = "";
                if (selectedCounty != 0) {
                    countyQuery = ` AND CNTY_NAME like '%${selectedCounty}%' `
                }
                let municipalityQuery = "";
                if (selectedMunicipality != 0) {
                    municipalityQuery = ` AND Municipality_Name like '%${selectedMunicipality}%' `
                }
                let legislativeQuery = "";
                if (selectedLegislative != 0 && selectedLegislative.includes("Senate")) {
                    legislativeQuery = ` AND UT_SENATE_DIST_NAME like '%${selectedLegislative.match(/\d+/)}%'`
                } else if (selectedLegislative != 0 && selectedLegislative.includes("House")) {
                    legislativeQuery = ` AND UT_House_Dist_Name like '%${selectedLegislative.match(/\d+/)}%'`
                }
                let statusQuery = "";
                if (selectedStatus != 0) {
                    statusQuery = ` AND PIN_STAT_NM = '${selectedStatus}'`
                }
                let sql = filter[program] + mapFilter + legislativeQuery + countyQuery + municipalityQuery + statusQuery;

                return sql
            }
            //sort attributes for dropdowns, add house and senate ditrict and combine into legislative
            function sortAttributes(attributeCollection){
                let senate = []
                let house = []
                let newCollection ={}
                
                    for (let key in attributeCollection) {
                        let sortedAttributes = []
                        if(key == "House" || key == "Senate"){
                            sortedAttributes = attributeCollection[key].sort((a, b) => a - b);
                            (key == "House") ? house = sortedAttributes.map(d => `House District ${d}`) : senate = sortedAttributes.map(d => `Senate District ${d}`)                            
                        } else{
                            sortedAttributes = attributeCollection[key].sort();
                            newCollection[key] = sortedAttributes;                             
                        }                      
                    }
                if (senate.length > 0 || house.length >0) { newCollection['District'] = house.concat(senate)}
                
                return newCollection
            }

            //collect attributes from features and put in arrays
            function collectAttributes(features, filters) {
                const attribute_name = { County: 'CNTY_NAME', Municipality: 'Municipality_Name', Status: 'PIN_STAT_NM', House: 'UT_House_Dist_Name', Senate: 'UT_SENATE_DIST_NAME' }
                let attributeCollection = {}
                features.forEach(function (feature) {
                    filters.forEach(function (id) {
                        let current_attribute = feature.attributes[attribute_name[id]]
                        //if more than one value for attribute, split and concat to array
                        if (current_attribute.indexOf(',') > -1) {
                            let existing
                            let cross = current_attribute.split(',');
                            //if key doesn't exist, create value as empty array, else set existing to key value
                            !(id in attributeCollection) ? existing = [] : existing = attributeCollection[id] 
                            let merged = existing.concat(cross);
                            attributeCollection[id] = merged;
                        } else {
                            //if key doesn't exist in object, create with current attribute as first value in array, else push  current attribute
                            !(id in attributeCollection) ? attributeCollection[id] = [current_attribute] : attributeCollection[id].push(current_attribute)
                            
                        }
                    });
                });
                attributeCollection = sortAttributes(attributeCollection);
                //create sets to remove duplicates
                for (let key in attributeCollection) {
                    attributeCollection[key] = new Set(attributeCollection[key])
                }
                console.log(attributeCollection)
                makeDropdown(attributeCollection, filters)
            }

            
            function makeDropdown(attributeCollection) {
                let selectIDs = {County: "queryCounty" ,Municipality: "queryMunicipality",Status: "queryStatus", District:"queryDistrict"}
               
                for(let key in attributeCollection){
                    let select = document.getElementById(selectIDs[key]);
                    select.innerHTML =''
                    let reset = document.createElement("option");
                    reset.value = 0
                    reset.textContent = `Select a ${key}`;
                    select.append(reset);

                    Array.from(attributeCollection[key]).forEach((i) => {
                        let option = document.createElement("option");
                        option.textContent = i;
                        option.value = i;
                        select.appendChild(option);
                    });
                }
                
            }
        });
}
function makeQueryForm() {
    return `<div id="queryProjects" class="editArea-container">
      <div id="queryDiv" style="display:block;">
          <h4 class="list-heading">Filter</h4>
          <div id="queryDiv" class="esri-component esri-widget ">
              <div id="queryForm" class="esri-component scroller esri-widget esri-feature-form">
                  <form class="esri-feature-form__form">

                      <label class="esri-feature-form__label">County
                          <select aria-invalid="false" class="esri-input esri-feature-form__input esri-select"
                              id="queryCounty" maxlength="">
                              <option value="0">Select a County</option>
                          </select>
                      </label>
                      <label class="esri-feature-form__label">Municipality
                        <select aria-invalid="false" class="esri-input esri-feature-form__input esri-select"
                            id="queryMunicipality" maxlength="">
                            <option value="0">Select a Municipality</option>
                        </select>
                      </label>
                      <label class="esri-feature-form__label">Legislative District
                        <select aria-invalid="false" class="esri-input esri-feature-form__input esri-select"
                            id="queryDistrict" maxlength="">
                            <option value="0">Select a District</option>
                        </select>
                      </label>
                      <label class="esri-feature-form__label">PIN Status
                        <select aria-invalid="false" class="esri-input esri-feature-form__input esri-select"
                            id="queryStatus" maxlength="">
                            <option value="0">Select a Status</option>
                        </select>
                      </label>

                  </form>
                  <input type="submit" class="esri-button" value="Filter Projects" id="query">
                  <input type="submit" class="esri-button" value="Reset Filter" id="resetQuery">
              </div>
              
          </div>

      </div>
  </div>`
}