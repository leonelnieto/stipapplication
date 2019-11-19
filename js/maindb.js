/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// const STIPData = "https://maps.udot.utah.gov/arcgis/rest/services/EPM_STIPProjects/MapServer/0/" //live data
const STIPData =
  "https://maps.udot.utah.gov/arcgis/rest/services/EPM_STIPProjects2019/MapServer/0/"; //test data
const sourceDataset = STIPData + "query?f=json&returnGeometry=false";
const selectColumns =
  "&outFields=PIN,WORKSHOP_CAT,STIP_WORKSHOP,PROJECT_MANAGER,REGION_CD,COMM_APRV_IND,PIN_DESC,PRIMARY_CONCEPT,PROJECT_VALUE,PLANNED_CONSTRUCTION_YEAR,PROJECTED_START_DATE,PROGRAM,PUBLIC_DESC,FORECAST_ST_YR,FED_DOLLARS,STATE_DOLLARS";
//Helper currency formater
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

//Query Dataset then build table
function dataTableBuilder(pnStatus, program, dom, region) {
  //Build where clause by filter
  let whereClause = whereClauseBuilder(pnStatus, program, region);
  let query = sourceDataset + selectColumns + whereClause;

  fetch("data/onepagers.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(onePages) {
      //then fetch project data
      fetch(query)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          let tableID = "#dataTable" + dom.substring(1);
          let features = data.features;

          if ($.fn.dataTable.isDataTable(tableID)) {
            let table = $(tableID).DataTable();
            table.clear();
            addRows(features, table);
          }

          if (!$.fn.dataTable.isDataTable(tableID)) {
            let columns = [
              { orderable: true },
              { orderable: true },
              { orderable: false },
              { orderable: true },
              { orderable: false }
            ];

            //include column for start year if not unfunded
            if (pnStatus != "unfunded") {
              columns.push({ orderable: true });
            }

            const table = $("#dataTable" + dom.substring(1)).DataTable({
              pagingType: "full_numbers",
              retrieve: true,
              columns: columns,
              dom: "Bfrtip",
              buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"]
            });

            addRows(features, table);
          }
        })
        .catch(function(err) {
          console.log(err);
        });

      function addRows(features, table) {
        features.forEach(function(item) {
          let attributes = item.attributes;
          let region = attributes["REGION_CD"];
          let pin = attributes["PIN"];

          let row = [
            `${region}`,
            `${onePageButtons(pin, region, onePages)}`,
            `<a data-toggle="modal" class="alt-link" data-target="#mapModal" onClick="showMapModal(${pin})" tooltip="Click for Project Map" tooltip-position="top">${
              attributes["PIN_DESC"]
            }</a>`,
            `${attributes["PRIMARY_CONCEPT"]}`,
            `${formatter.format(attributes["PROJECT_VALUE"])}`
          ];

          pnStatus != "unfunded"
            ? row.push(`${attributes["FORECAST_ST_YR"]}`)
            : "";

          table.row.add(row);
        });
        table.draw();
      }
    });
}

function onePageButtons(pin, region, data) {
  //var onePagerButton = '<a href="#" class="btn btn-primary" disabled>No Program Briefing</a>';
  // $(dom).empty();
  let style = `<button type="button" class="btn btn-outline-danger btn-sm" tooltip="No Program Briefing" tooltip-position="top">${pin}</button>`;
  data.forEach(function(page) {
    if (page["Region"] == region && page["PIN"] == pin) {
      style = `<a href="http://maps.udot.utah.gov/wadocuments/Apps/ProgramBriefing/${region}/${pin}.pdf" target="_blank" tooltip="Program Briefing" tooltip-position="top" class="btn btn-outline-success btn-sm" role="button">${pin}</a>`;
    }
  });
  return style;
}

//Drill Chart takes type parameter for table or graph
function drillVisual(
  pnStatus,
  program,
  dom,
  groupOrder,
  aggregate,
  type,
  region
) {
  let whereClause = whereClauseBuilder(pnStatus, program, region);
  let statistic = `[{'statisticType': 'SUM', 'onStatisticField': '${aggregate}', 'outStatisticFieldName': 'aggregate'}]`;
  let vizQueryAgg = `&outStatistics=${statistic}`;
  let vizQueryGroup = `&groupByFieldsForStatistics=${groupOrder}`;
  let vizQueryOrder = `&orderByFields=${groupOrder}`;
  let url =
    sourceDataset + vizQueryAgg + whereClause + vizQueryGroup + vizQueryOrder;

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      let features = data.features;

      //Check type and draw whats requested
      if (type === "chart") {
        let x = [];
        let y = [];
        let trace1 = {
          x: x,
          y: y,
          name: "Project Value",
          type: "bar"
        };
        let data = [trace1];
        let layout = {
          yaxis: { title: "$", hoverformat: "$0f" },
          xaxis: { type: "category" }
        };

        features.forEach(function(item) {
          let attributes = item.attributes;
          x.push(attributes[groupOrder]);
          y.push(formatter.format(attributes["aggregate"])); //TODO
        });

        Plotly.newPlot(dom, data, layout, { responsive: true });
      } else if (type === "table") {
        let col = groupOrder === "REGION_CD" ? "Region" : "Year";
        let html =
          '<table class="table"><thead><tr><th>' +
          col +
          "</th><th>Dollars</th></thead><tbody>";

        features.forEach(function(item) {
          let attributes = item.attributes;
          if (groupOrder === "FORECAST_ST_YR") {
            html += "<tr><td>" + attributes[groupOrder] + "</td>";
            html +=
              '<td class="' +
              attributes[groupOrder] +
              '">' +
              formatter.format(attributes["aggregate"]) +
              "</td></tr>";
          } else {
            html += "<tr><td>" + attributes[groupOrder] + "</td>";
            html +=
              "<td>" + formatter.format(attributes["aggregate"]) + "</td></tr>";
          }
        });

        html += "</tbody></table>";
        document.getElementById(dom).innerHTML = html;
      }
    });
}

//Helper function to build where clause
function whereClauseBuilder(pnStatus, program, region) {
  let whereClause = "";
  let programClause = "";
  let regionClause = "";
  if (program === "all") {
    programClause = "";
  } else {
    programClause = `AND WORKSHOP_CAT in (${program})`;
  }
  if (region === 0 || region === undefined) {
    regionClause = "";
  } else {
    regionClause = `AND REGION_CD='${region}'`;
  }
  switch (pnStatus) {
    case "unfunded":
      whereClause =
        "&where=STIP_WORKSHOP='N' and PIN_STAT_NM='Proposed' " +
        programClause +
        regionClause;
      break;
    case "proposed":
      whereClause =
        "&where=STIP_WORKSHOP='Y' and PIN_STAT_NM='Proposed' " +
        programClause +
        regionClause;
      break;
    case "comapp":
      whereClause =
        "&where=COMM_APRV_IND='Y' and PIN_STAT_NM in('STIP','Scoping','Awarded','Active','Advertised','Under Construction','Substantially Compl','Physically Complete') " +
        programClause +
        regionClause;
      break;
    case "design":
      whereClause =
        "&where=PIN_STAT_NM in('STIP','Scoping','Active','Advertised','Awarded') " +
        programClause +
        regionClause;
      break;
    case "construction":
      whereClause =
        "&where=PIN_STAT_NM in('Under Construction','Substantially Compl','Physically Complete')" +
        programClause +
        regionClause;
      break;
  }
  return whereClause;
}

//Function to show map when pin description is clicked
function showMapModal(pin) {
  let pinMap = '<div class="pinMap" id="pinMap"></div>';
  document.getElementById("mapIframeMody").innerHTML = pinMap;
  document.getElementById("MapModalTitle").innerHTML = `Project ID ${pin} Map`;

  require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer"
  ], function(Map, MapView, FeatureLayer) {
    let layer = new FeatureLayer({
      url: STIPData, // EPM STIP Service
      definitionExpression: `PIN = ${pin}`, //change filter to change dataset query
      popupTemplate: { title: "{CONCEPT_DESC}", content: "{*}" } //the popup change be changed if we want
    });

    layer.renderer = {
      type: "simple",
      symbol: { type: "simple-line", width: 2, color: "black" }
    };

    let map = new Map({
      basemap: "streets-vector"
    });

    map.add(layer);
    let view = new MapView({
      container: "pinMap",
      map: map
    });

    view.when(function() {
      layer.queryExtent().then(function(results) {
        // go to the extent of the results satisfying the query
        view.goTo(results.extent);
      });
    });
  });
}
//Function to parse date string
function dateTransform(str) {
  let datize = new Date(str);
  datize = datize.toDateString();
  return datize;
}

function projectManagers(dom) {
  let stats = `[{"statisticType":"COUNT", "onStatisticField": "PROJECT_MANAGER", "outStatisticFieldName": "pins"}]`;
  let url =
    sourceDataset +
    `&outStatistics=${stats}&groupByFieldsForStatistics=PROJECT_MANAGER`;
  fetch(url)
    .then(function(response) {
      // Convert to JSON
      return response.json();
    })
    .then(function(data) {
      let features = data.features;
      let html = "";
      let thead =
        '<table style="width:100%" id="PMsDataTable" class="table table-striped table-hover">';
      thead += "<thead><tr><th>Project Manager</th>";
      thead += "<th>PINs</th></tr></thead><tbody>";
      html += thead;
      features.forEach(function(item) {
        //Populate rows
        let attributes = item.attributes;
        let PM = attributes["PROJECT_MANAGER"];
        if (PM == null) {
          html +=
            '<tr><td class="text-left"><button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#PMsModal"';
          html += `onclick="pingPMs("No PM","#PMDetails")">No Category</button></td>`;
        } else {
          html +=
            '<tr><td class="text-left"><button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#PMsModal"';
          html += `onclick="pingPMs('${PM}','#PMDetails')">${PM}</button></td>`;
        }
        html += `<td class="sorting">${attributes["pins"]}</td></tr>`;
      });
      let tfoot = "</tbody></table>";
      html += tfoot;
      $(dom).append(html);
      $("#PMsDataTable").DataTable({
        pagingType: "full_numbers",
        columns: [{ orderable: true }, { orderable: true }],
        dom: "Bfrtip",
        buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"]
      });
    })
    .catch(function(err) {
      console.log(err);
    });
}

//documentation.html functions
//summarize categories in dataset
function programCategories(dom) {
  let stats = `[{"statisticType":"COUNT", "onStatisticField": "WORKSHOP_CAT", "outStatisticFieldName": "pins"}]`;
  let url =
    sourceDataset +
    `&outStatistics=${stats}&groupByFieldsForStatistics=WORKSHOP_CAT`;
  fetch(url)
    .then(function(response) {
      // Convert to JSON
      return response.json();
    })
    .then(function(data) {
      let features = data.features;
      let html = "";
      let thead =
        '<table style="width:100%" id="programsDataTable" class="table table-striped table-hover">';
      thead += "<thead><tr><th>Workshop</th>";
      thead += "<th>PINs</th></tr></thead><tbody>";
      html += thead;
      features.forEach(function(item) {
        //Populate rows
        let attributes = item.attributes;
        let category = attributes["WORKSHOP_CAT"];
        if (category == null) {
          html +=
            '<tr><td class="text-left"><button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#workshopPinsModal" ';
          html += `onclick="pingProgram('No Category','#WorkshopPinDetails')">No Category</button></td>`;
        } else {
          html +=
            '<tr><td class="text-left"><button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#workshopPinsModal" ';
          html += `onclick="pingProgram('${category}','#WorkshopPinDetails')">${category}</button></td>`;
        }
        html += `<td class="sorting">${attributes["pins"]}</td></tr>`;
      });
      let tfoot = "</tbody></table>";
      html += tfoot;
      $(dom).append(html);
      $("#programsDataTable").DataTable({
        pagingType: "full_numbers",
        columns: [{ orderable: true }, { orderable: true }],
        dom: "Bfrtip",
        buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"]
      });
    })
    .catch(function(err) {
      console.log(err);
    });
}

function pingPMs(PM, dom) {
  let url = `${sourceDataset}&outFields=PIN,PIN_DESC,REGION_CD,PIN_STAT_NM&where=PROJECT_MANAGER='${PM}'`;
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      let features = data.features;
      let html = "";
      let thead =
        '<table style="width:100%" id="PMPingTable" class="table table-striped table-hover">';
      thead += '<thead><tr><th class="text-left">PINs</th>';
      thead +=
        "<th>Pin Description</th><th>Pin Status</th><th>Region</th></tr></thead><tbody>";
      html += thead;
      features.forEach(function(item) {
        let attributes = item.attributes;
        //Populate rows
        html += "<tr><td>" + attributes["PIN"] + "</td>";
        html += '<td class="text-left">' + attributes["PIN_DESC"] + "</td>";
        html += "<td>" + attributes["PIN_STAT_NM"] + "</td>";
        html += "<td>" + attributes["REGION_CD"] + "</td></tr>";
      });
      let tfoot = "</tbody></table>";
      html += tfoot;
      $("#PMName").empty();
      $(dom).empty();
      $(dom).append(html);
      if ($.fn.dataTable.isDataTable("#PMPingTable")) {
        table = $("#PMPingTable").DataTable();
      } else {
        table = $("#PMPingTable").DataTable({
          pagingType: "full_numbers",
          columns: [
            { orderable: true },
            { orderable: true },
            { orderable: true },
            { orderable: true }
          ]
        });
      }
      $("#PMName").append(PM);
    })
    .catch(function(err) {
      console.log("{*_*}" + err);
    });
}

//Function to ping workship and get list of pin details
function pingProgram(program, dom) {
  let url = `${sourceDataset}&outFields=PIN,PIN_DESC,REGION_CD,PIN_STAT_NM&where=WORKSHOP_CAT='${program}'`;
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      let features = data.features;
      let html = "";
      let thead =
        '<table style="width:100%" id="programPingTable" class="table table-striped table-hover">';
      thead += '<thead><tr><th class="text-left">PINs</th>';
      thead +=
        "<th>Pin Description</th><th>Pin Status</th><th>Region</th></tr></thead><tbody>";
      html += thead;
      features.forEach(function(item) {
        let attributes = item.attributes;
        //Populate rows
        html += "<tr><td>" + attributes["PIN"] + "</td>";
        html += '<td class="text-left">' + attributes["PIN_DESC"] + "</td>";
        html += "<td>" + attributes["PIN_STAT_NM"] + "</td>";
        html += "<td>" + attributes["REGION_CD"] + "</td></tr>";
      });
      let tfoot = "</tbody></table>";
      html += tfoot;
      $("#programName").empty();
      $(dom).empty();
      $(dom).append(html);
      if ($.fn.dataTable.isDataTable("#programPingTable")) {
        table = $("#programPingTable").DataTable();
      } else {
        table = $("#programPingTable").DataTable({
          pagingType: "full_numbers",
          columns: [
            { orderable: true },
            { orderable: true },
            { orderable: true },
            { orderable: true }
          ]
        });
      }
      $("#programName").append(program);
    })
    .catch(function(err) {
      console.log("{*_*}" + err);
    });
}

//One pager summary table
function onepagerSummaryTable(dom) {
  fetch("data/onepagers.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(onePagers) {
      let url =
        sourceDataset + "&outFields=PIN,REGION_CD,WORKSHOP_CAT&where=1=1";
      fetch(url)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          features = data.features;
          let flag = 0;
          let html = "";
          let thead =
            '<table style="width:100%" id="onePagerSummaryTable" class="table table-striped table-hover">';
          thead += '<thead><tr><th class="text-left">Workshop</th>';
          thead +=
            "<th>Region</th><th>PIN</th><th>One Pager</th></tr></thead><tbody>";
          html += thead;
          features.forEach(function(item) {
            attributes = item.attributes;
            html +=
              '<tr><td class="text-left">' +
              attributes["WORKSHOP_CAT"] +
              "</td>";
            html += "<td>" + attributes["REGION_CD"] + "</td>";
            html += "<td>" + attributes["PIN"] + "</td>";
            //Reset the flag
            flag = 0;
            for (let l = 0; l < onePagers.length; l++) {
              //Search for pin in onepager json file, if found flip the flag..
              if (onePagers[l]["PIN"] === attributes["PIN"]) {
                flag = 1;
                break;
              }
            }
            if (flag === 1) {
              html +=
                '<td><a class="text-info" target="new" href="http://maps.udot.utah.gov/wadocuments/Apps/ProgramBriefing/' +
                attributes["REGION_CD"] +
                "/" +
                attributes["PIN"] +
                '.pdf">Yes</a></td></tr>';
            } else {
              html += "<td>No</td></tr>";
            }
          });
          let tfoot = "</tbody></table>";
          html += tfoot;
          $(dom).append(html);
          $("#onePagerSummaryTable").DataTable({
            pagingType: "full_numbers",
            columns: [
              { orderable: true },
              { orderable: true },
              { orderable: true },
              { orderable: true }
            ]
          });
        })
        .catch(function(err) {
          alert("{*_*} Bummer, could not load dataset!!!!" + err);
          console.log("{*_*} Bummer, could not load dataset!!!!" + err);
        });
    })
    .catch(function(err) {
      alert("{*_*} Bummer, could not load onepager data!!!!" + err);
      console.log("{*_*} Bummer, could not load onepager data!!!!" + err);
    });
}

//Show entire dataset in app documentation
function printSourceData(dom) {
  let url =
    sourceDataset +
    "&outFields=PIN,PIN_DESC,PIN_STAT_NM,PROJ_LOC ,PROJECT_VALUE,REGION_CD,PLANNED_CONSTRUCTION_YEAR,FORECAST_ST_YR,WORKSHOP_CAT&where=1=1";
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      let features = data.features;
      let html = "";
      let thead =
        '<table style="width:100%" id="sourceDataTable" class="table table-striped table-hover">';
      thead +=
        "<thead><tr><th>PIN</th><th>PIN Description</th><th>PIN Status</th><th>Project Location</th><th>Project Value</th>";
      thead +=
        "<th>Region</th><th>Planned Construction Year</th><th>Projected Start Year</th><th>Workshop Category</th></tr></thead><tbody>";
      html += thead;
      features.forEach(function(item) {
        let attributes = item.attributes;
        html += "<tr><td>" + attributes["PIN"] + "</td>";
        html += '<td class="text-left">' + attributes["PIN_DESC"] + "</td>";
        html += "<td>" + attributes["PIN_STAT_NM"] + "</td>";
        html += "<td>" + attributes["PROJ_LOC"] + "</td>";
        html +=
          "<td>" + formatter.format(attributes["PROJECT_VALUE"]) + "</td>";
        html += "<td>" + attributes["REGION_CD"] + "</td>";
        html += "<td>" + attributes["PLANNED_CONSTRUCTION_YEAR"] + "</td>";
        html += "<td>" + attributes["FORECAST_ST_YR"] + "</td>";
        html += "<td>" + attributes["WORKSHOP_CAT"] + "</td></tr>";
      });
      let tfoot = "</tbody></table>";
      html += tfoot;
      $(dom).append(html);
      $("#sourceDataTable").DataTable({
        pagingType: "full_numbers",
        columns: [
          { orderable: true },
          { orderable: true },
          { orderable: true },
          { orderable: true },
          { orderable: true },
          { orderable: true },
          { orderable: true },
          { orderable: true },
          { orderable: true }
        ],
        dom: "Bfrtip",
        buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"]
      });
    })
    .catch(function(err) {
      alert("{*_*} Bummer, could not load onepager data!!!!" + err);
      console.log("{*_*} Bummer, could not load onepager data!!!!" + err);
    })
    .catch(function(err) {
      alert("{*_*} Bummer, could not load onepager data!!!!" + err);
      console.log("{*_*} Bummer, could not load onepager data!!!!" + err);
    });
}
