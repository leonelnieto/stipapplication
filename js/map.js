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
                definitionExpression: filter[program] + mapFilter, //change filter to change dataset query
                popupTemplate: { title: "{CONCEPT_DESC}", content: "{*}" } //the popup change be changed if we want
            });
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
                const filterChanges = ["County", "Municipality", "House", "Senate", "Status"]
                let sql = makeQuery();
                getFeatures(sql, filterChanges)
            });

            function getFeatures(sql, filterChanges) {
                let query = layer.createQuery();
                query.where = sql
                layer.queryFeatures(query).then(function (data) {
                    let features = data.features;
                    processFeatures(features, filterChanges);
                });
            }

            document.getElementById("queryCounty").onchange = function () {
                selectedCounty = document.getElementById("queryCounty").value;
                let sql = makeQuery();
                getFeatures(sql, filterChanges)
            }
            document.getElementById("queryMunicipality").onchange = function () {
                selectedMunicipality = document.getElementById("queryMunicipality").value;
                let sql = makeQuery();
                getFeatures(sql, filterChanges)
            }
            document.getElementById("queryLegislative").onchange = function () {
                selectedLegislative = document.getElementById("queryLegislative").value;
                let sql = makeQuery();
                getFeatures(sql, filterChanges)
            }
            document.getElementById("queryStatus").onchange = function () {
                selectedStatus = document.getElementById("queryStatus").value;
                let sql = makeQuery();
                getFeatures(sql, filterChanges)
            }

            document.getElementById("query").onclick = function () {
                let sql = makeQuery();
                console.log(sql)
                layer.definitionExpression = sql;
                // resetQuery();
            };

            function makeQuery() {
                let countyQuery = "";
                if (selectedCounty != 0) {
                    countyQuery = ` AND CNTY_NAME = '${selectedCounty}' `
                }
                let municipalityQuery = "";
                if (selectedMunicipality != 0) {
                    municipalityQuery = ` AND Municipality_Name = '${selectedMunicipality}' `
                }
                let legislativeQuery = "";
                if (selectedLegislative != 0 && selectedLegislative.includes("Senate")) {
                    legislativeQuery = ` AND UT_SENATE_DIST_NAME = '${selectedLegislative.match(/\d+/)}'`
                } else if (selectedLegislative != 0 && selectedLegislative.includes("House")) {
                    legislativeQuery = ` AND UT_House_Dist_Name = '${selectedLegislative.match(/\d+/)}'`
                }
                let statusQuery = "";
                if (selectedStatus != 0) {
                    statusQuery = ` AND PIN_STAT_NM = '${selectedStatus}'`
                }
                let sql = filter[program] + mapFilter + legislativeQuery + countyQuery + municipalityQuery + statusQuery;

                return sql
            }
            // let filterChanges = ["queryCounty", "queryMunicipality", "queryLegislative", "queryStatus"]
            function processFeatures(features, filters) {
                const attribute_name = { County: 'CNTY_NAME', Municipality: 'Municipality_Name', Status: 'PIN_STAT_NM', House: 'UT_House_Dist_Name', Senate: 'UT_SENATE_DIST_NAME' }
                let attribute_collection = { County: [], Municipality: [], Status: [], House: [], Senate: [] }
                features.forEach(function (feature) {
                    filters.forEach(function (id) {
                        let current_attribute = feature.attributes[attribute_name[id]]
                        if (current_attribute.indexOf(',') > -1) {
                            let existing = attribute_collection[id];
                            let cross = current_attribute.split(',');
                            let merged = existing.concat(cross);
                            attribute_collection[id] = merged;
                        } else {
                            attribute_collection[id].push(current_attribute)
                        }
                    });
                });
                console.log(attribute_collection)
                for (let key in attribute_collection) {
                    attribute_collection[key] = new Set(attribute_collection[key])                
                }
                console.log(attribute_collection)
                // makeDropdown(attribute_collection, filter)
            }

            function makeDropdown(counties, municipalities, legislative, status) {
                let countyReset = document.createElement("option");
                countyReset.value = 0;
                let countyID = document.getElementById("queryCounty");
                countyID.innerHTML = '';
                countyReset.textContent = 'Select a County';
                countyID.appendChild(countyReset);
                Array.from(counties).sort().forEach((i) => {
                    let option = document.createElement("option");
                    option.textContent = i;
                    option.value = i;
                    countyID.appendChild(option);
                });
                let municipalityID = document.getElementById("queryMunicipality")
                let muniReset = document.createElement("option");
                municipalityID.innerHTML = '';
                muniReset.textContent = 'Select a Municipality';
                municipalityID.appendChild(muniReset);
                Array.from(municipalities).sort().forEach((i) => {
                    let option = document.createElement("option")
                    option.textContent = i;
                    option.value = i;
                    municipalityID.appendChild(option);
                });
                //TODO: sorting numbers not quite right
                let legislativeID = document.getElementById("queryLegislative")
                legislativeID.innerHTML = '';
                let legReset = document.createElement("option");
                legReset.textContent = 'Select a District';
                legislativeID.appendChild(legReset);
                Array.from(legislative).sort().forEach((i) => {
                    let option = document.createElement("option")
                    option.textContent = i;
                    option.value = i;
                    legislativeID.appendChild(option);
                });
                let statusID = document.getElementById("queryStatus")
                statusID.innerHTML = '';
                let statReset = document.createElement("option");
                statReset.textContent = 'Select a Status';
                statusID.appendChild(statReset);
                Array.from(status).sort().forEach((i) => {
                    let option = document.createElement("option");
                    option.textContent = i;
                    option.value = i;
                    statusID.appendChild(option);
                });
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
                            id="queryLegislative" maxlength="">
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
                 <!-- <input type="submit" class="esri-button" value="Reset Filter" id="resetQuery"> -->
              </div>
              
          </div>

      </div>
  </div>`
}