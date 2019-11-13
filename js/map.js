require(["esri/Map", "esri/views/MapView", "esri/widgets/Legend", "esri/layers/FeatureLayer", "esri/widgets/Expand", "esri/widgets/BasemapToggle"],
    function (Map, MapView, Legend, FeatureLayer, Expand, BasemapToggle) {
        let program =28;
        let centerLong = -111.693657;
        let centerLat = 39.631301;
        let zoom = 2500000;
        let region;

        let mapFilter = region ? `AND REGION_CD ="${region}"` : "";
        let selectedCounty = selectedMunicipality = selectedLegislative = selectedStatus =selectedMPO= 0;
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
        const programQuery = ["WORKSHOP_CAT = 'Transportation Investment Funds'", //0 TransportationInvestmentFunds - no records
            "WORKSHOP_CAT = 'Transportation Solutions'",//1 TransportationSolutions
            "WORKSHOP_CAT = 'Contingency Fund'", //2 ContingencyFund - no records
            "WORKSHOP_CAT = 'Preservation High Volume' OR WORKSHOP_CAT = 'Rehabilitation High Volume'", //3 PavementHighVolume 
            "WORKSHOP_CAT = 'Preservation Low Volume' OR WORKSHOP_CAT = 'Rehabilitation Low Volume'", //4 PavementLowVolume
            "WORKSHOP_CAT = 'Bridge Preservation'", //5 BridgePreservation
            "WORKSHOP_CAT = 'Bridge Replacement and Rehabilitation'", //6 BridgeReplacementandRehabilitation
            "WORKSHOP_CAT = 'HSIP - Highway Safety Improvement'", //7 HighwaySafetyImprovement
            "WORKSHOP_CAT = 'SSIP - Safety Spot Improvement'", //8 SafetySpotImprovement - I think this one is being retired
            "WORKSHOP_CAT = 'Barrier Treatments'", //9 BarrierTreatments - no records
            "WORKSHOP_CAT = 'Small Area Lighting'", //10 SmallAreaLighting - no records
            "WORKSHOP_CAT = 'Safe Routes to Schools'", //11 SafeRoutestoSchools - no records
            "WORKSHOP_CAT = 'Sign Modification & Replacement'",//12 SignModificationReplacement - no records
            "WORKSHOP_CAT = 'Railway-Highway Grade Crossing'", //13 RailwayHighwayGradeCrossing
            "WORKSHOP_CAT = 'New Traffic Signals'", //14 NewTrafficSignals
            "WORKSHOP_CAT = 'Freight'",//15 Freight - no records
            "WORKSHOP_CAT = 'Off-System Bridge'", //16 OffSystemBridge - no records
            "WORKSHOP_CAT = 'Non-Urban'", //17 NonUrban - no records
            "WORKSHOP_CAT = 'Small Urban'", //18 SmallUrban - no records
            "WORKSHOP_CAT = 'State Park Access'", //19 StateParkAccess - no records
            "WORKSHOP_CAT = 'Transportation Alternatives'", //20 TransportationAlternatives
            "WORKSHOP_CAT = 'Environmental Studies'", //21 EnvironmentalStudies - no records
            "WORKSHOP_CAT = 'ATMS Asset Management'", //22 ATMSAssetManagement - no records
            "WORKSHOP_CAT = 'Federal Lands Access Program'", //23 FederalLandsAccessProgram - no records
            "WORKSHOP_CAT = 'Other'", //24 Other - no records
            "WORKSHOP_CAT = 'HSIP - Highway Safety Improvement' OR WORKSHOP_CAT = 'Safe Routes to Schools' OR WORKSHOP_CAT = 'New Traffic Signals' OR WORKSHOP_CAT = 'Railway-Highway Grade Crossing'", //25 TrafficSafety - is this one redundant?
            "WORKSHOP_CAT = 'MPO'", //26 LocalGovernmentMPOs no records
            "WORKSHOP_CAT = 'Reconstruction High Volume'", //27 PavementLowVolume
            "", //28 noquery
            "WORKSHOP_CAT = 'Bridge Preservation' OR WORKSHOP_CAT = 'Bridge Replacement and Rehabilitation'" //29 All Structures
        ]

        // Expand widget for the queryFeature div               
        let layer = new FeatureLayer({
            url: STIPData, // EPM STIP Service
            renderer: STIPRender, //this gives the line styles
            // definitionExpression: filter[program] + mapFilter //change filter to change dataset query
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
            container: "map",
            map: map,
            center: [centerLong, centerLat], //edit to center base on lat and lon state center 39.631301,-111.693657
            scale: zoom //larger number zooms out, smaller zooms in 
        });
        map.add(layer);
        let legend = new Legend({
            view: view,
            layerInfos: [{
                layer: layer,
                title: "Legend"
            }]
        });
        let basemapToggle = new BasemapToggle({
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

        window.mapLoaderDynamic = function (reg, prog) {
            program = prog;
            region = reg;
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
            resetQuery()
        }
        function getFeatures(sql, filters) {
            let query = layer.createQuery();
            query.where = sql
            
            layer.queryFeatures(query).then(function (data) {
                let features = data.features;
                console.log(features)
                
                
                collectAttributes(features, filters);
            });
        }

        function resetQuery() {
            selectedCounty = selectedMunicipality = selectedLegislative = selectedStatus = selectedMPO = 0;
            const filters = buildFilter()
            let sql = makeQuery();
            layer.definitionExpression = sql;
            getFeatures(sql, filters)
        }

        function buildFilter() {
            filters = []
            if (selectedMPO == 0){
                filters.push("MPO")
            }
            if (selectedCounty == 0) {
                filters.push("County")
            }
            if (selectedMunicipality == 0) {
                filters.push("Municipality")
            }
            if (selectedLegislative == 0) {
                filters.push("House")
                filters.push("Senate")
            }
            if (selectedStatus == 0) {
                filters.push("Status")
            }
            return filters
        }

        document.getElementById("queryMPO").onchange = function () {         
            selectedMPO = document.getElementById("queryMPO").value;
            const filters = buildFilter()
            let sql = makeQuery();
            getFeatures(sql, filters)
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

        document.getElementById("resetQuery").onclick = function () {
            resetQuery()
        }

        document.getElementById("query").onclick = function () {
            let sql = makeQuery();
            
            layer.definitionExpression = sql;
        };

        function makeQuery() {

            let countyQuery = "";
            if (selectedCounty != 0) {
                countyQuery = ` AND CNTY_NAME like '%${selectedCounty}%' `
            }

            let mpoQuery = ""
            if(selectedMPO !=0){
                mpoQuery = ` AND MPO_Name like '%${selectedMPO}%'`
            }
            
            let municipalityQuery = "";
            if (selectedMunicipality != 0) {
                municipalityQuery = ` AND Municipality_Name like '%${selectedMunicipality}%' `
            }
            
            let legislativeQuery = "";
            if (selectedLegislative != 0 && selectedLegislative.includes("Senate")) {
                legislativeQuery = ` AND UT_SENATE_DIST_NAME like '${selectedLegislative}'`
            } else if (selectedLegislative != 0 && selectedLegislative.includes("House")) {
                legislativeQuery = ` AND UT_House_Dist_Name like '${selectedLegislative}'`
            }
           
            let statusQuery = "";
            if (selectedStatus != 0) {
                statusQuery = ` AND PIN_STAT_NM = '${selectedStatus}'`
            }
           
            let sql = programQuery[program] + mapFilter + legislativeQuery + countyQuery + municipalityQuery + statusQuery + mpoQuery;
            console.log(sql)

            return sql
        }
        //sort attributes for dropdowns, add house and senate ditrict and combine into legislative
        function sortAttributes(attributeCollection) {
            let senate = []
            let house = []
            let newCollection = {}

            for (let key in attributeCollection) {
                let sortedAttributes = []
                if (key == "House" || key == "Senate") {
                    let stripped = attributeCollection[key].map(leg => leg.replace(/[^0-9\.]+/g, ""));
                    sortedAttributes = stripped.sort((a, b) => a - b);
                    (key == "House") ? house = sortedAttributes.map(d => `House District ${d}`) : senate = sortedAttributes.map(d => `Senate District ${d}`)
                } else {
                    sortedAttributes = attributeCollection[key].sort();
                    newCollection[key] = sortedAttributes;
                }
            }
            if (senate.length > 0 || house.length > 0) { newCollection['District'] = house.concat(senate) }

            return newCollection
        }

        //collect attributes from features and put in arrays
        function collectAttributes(features, filters) {
            
            const attribute_name = { County: 'CNTY_NAME', Municipality: 'Municipality_Name', Status: 'PIN_STAT_NM', House: 'UT_House_Dist_Name', Senate: 'UT_SENATE_DIST_NAME', MPO: 'MPO_Name'}
            let attributeCollection = {}
            features.forEach(function (feature) {
                filters.forEach(function (id) {
                  
                    let currentAttribute = feature.attributes[attribute_name[id]]
                    //if more than one value for attribute, split and concat to array
                    
                    if (currentAttribute.indexOf(',') > -1) {
                        let existing;
                        let cross = currentAttribute.split(',');
                        //if key doesn't exist, create value as empty array, else set existing to key value
                        !(id in attributeCollection) ? existing = [] : existing = attributeCollection[id]
                        let merged = existing.concat(cross);
                        attributeCollection[id] = merged;
                    } else {
                        //if key doesn't exist in object, create with current attribute as first value in array, else push  current attribute
                        !(id in attributeCollection) ? attributeCollection[id] = [currentAttribute] : attributeCollection[id].push(currentAttribute)

                    }
                });
            });
            attributeCollection = sortAttributes(attributeCollection);
            //create sets to remove duplicates
            for (let key in attributeCollection) {
                attributeCollection[key] = new Set(attributeCollection[key])
            }            
            
            makeDropdown(attributeCollection, filters)
        }

 
        function makeDropdown(attributeCollection) {
            let selectIDs = { County: "queryCounty", Municipality: "queryMunicipality", Status: "queryStatus", District: "queryDistrict", MPO: "queryMPO" }

            for (let key in attributeCollection) {
                let select = document.getElementById(selectIDs[key]);
                select.innerHTML = ''
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