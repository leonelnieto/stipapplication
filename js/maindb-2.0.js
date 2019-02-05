/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//Global Variables
//Actual Dataset
var sourceDataset = "https://dashboard.udot.utah.gov/resource/d3ck-j69f.json";
//Testing Dataset
//var sourceDataset = "https://dashboard.udot.utah.gov/resource/a6xh-u32h.json";
var selectColumns = "?$select=pin,workshop_cat,stip_workshop,region_cd,comm_aprv_ind,pin_desc,primary_concept,project_value,planned_construction_year,program,public_desc,forecast_st_yr,fed_dollars,state_dollars";
//Use Limit to gurantee more than 1000 rows in dataset
var tail = '&$limit=50000';
//Helper currency formater
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
 //Query Dataset then build table
function dataTableBuilder(pn_status,workshop,dom,region){
    //Build where clause by filter
    var whereClause = whereClauseBuilder(pn_status,workshop,region);
    var query = sourceDataset+selectColumns+whereClause+tail;
    //console.log(query);
    fetch(query)
        .then(function(response){
            return response.json();
        }).then(function(data){
            //Where the magic occurs
            //console.log(data);
            var html = '';
            var thead = '<table style="width:100%" id="dataTable'+dom.substring(1)+'" class="table table-striped table-hover">';
            thead += '<thead><tr><th>Region</th>';
            thead +='<th>PIN</th><th>PIN Description</th><th>Primary Concept</th><th>Project Value</th><th>Planned Year</th></tr></thead><tbody>';
            html += thead;
            for(var i=0; i < data.length;i++){
                //Populate funded rows
                html += '<tr><td class="sorting">'+data[i]['region_cd']+'</td>';
                html += '<td><button type="button" class="btn btn-outline-primary btn-sm" data-toggle="modal" tooltip="Click for PIN Details" tooltip-position="top"';
                html += ' data-target="#myModal" onClick="pingPin('+data[i]['pin']+')">';
                html += data[i]['pin']+'</button></td>';
                html += '<td><a data-toggle="modal" class="alt-link" data-target="#mapModal" onClick="showMapModal('+data[i]['pin']+')" ';
                html += 'tooltip="Click for Project Map" tooltip-position="top">'+data[i]['pin_desc']+'</a></td>';
                html += '<td>'+data[i]['primary_concept']+'</td>';
                html += '<td>'+formatter.format(data[i]['project_value'])+'</td>';
                html += '<td class="'+bgColorClass(data[i]['planned_construction_year'])+'">'+data[i]['planned_construction_year']+'</td></tr>';
            }
            var tfoot = "</tbody></table>";
            html += tfoot;
            $(dom).append(html);
            $('#dataTable'+dom.substring(1)).DataTable( {
                "pagingType": "full_numbers",
                "columns": [
                    { "orderable": true },
                    { "orderable": true },
                    { "orderable": false },
                    { "orderable": true },
                    { "orderable": false },
                    { "orderable": true }
                    ]
            });
        }).catch(function(err){
            console.log("{*_*} Shit, I should not be here!!!!");
            console.log(query);
    });
}
//Drill Chart using plotly
function drillPlotlyChart(pn_status,workshop,dom,groupOrder){
    var whereClause = whereClauseBuilder(pn_status,workshop);
    var vizQueryAgg = "?$select="+groupOrder+",sum(project_value)";
    var vizQueryGroup = "&$group="+groupOrder;
    var vizQueryOrder = "&$order="+groupOrder;
    var url = sourceDataset+vizQueryAgg+whereClause+vizQueryGroup+vizQueryOrder;
    fetch(url).then(function(response){
        return response.json();
    }).then(function(j){
      var x = [];
      var y = [];
      for(var i = 0; i < j.length; i++){
        x.push(j[i][groupOrder]);
        y.push(formatter.format(j[i]["sum_project_value"]));
      }
      var trace1 = {
        x: x,
        y: y,
        name: 'Project Value',
        type: 'bar'
      };
      var data = [trace1];
      var layout = {
        yaxis: {title: 'Project values',hoverformat: '$0f'},xaxis: {type: 'category'},
      };
      Plotly.newPlot(dom, data, layout,{responsive: true});
  });
}
//Drill Chart takes type parameter for table or graph
function drillVisual(pn_status,workshop,dom,groupOrder,aggregate,type,region){
    var whereClause = whereClauseBuilder(pn_status,workshop,region);
    var vizQueryAgg = "?$select="+groupOrder+",sum("+aggregate+") as aggregate";
    var vizQueryGroup = "&$group="+groupOrder;
    var vizQueryOrder = "&$order="+groupOrder;
    var url = sourceDataset+vizQueryAgg+whereClause+vizQueryGroup+vizQueryOrder;
    fetch(url).then(function(response){
        return response.json();
    }).then(function(j){
        //Check type and draw whats requested
        if(type === 'chart'){
            var x = [];
            var y = [];
            for(var i = 0; i < j.length; i++){
                x.push(j[i][groupOrder]);
                y.push(formatter.format(j[i]["aggregate"]));
            }
            var trace1 = {
                x: x,
                y: y,
                name: 'Project Value',
                type: 'bar'
            };
            var data = [trace1];
            var layout = {
                yaxis: {title: '$',hoverformat: '$0f'},xaxis: {type: 'category'},
            };
            Plotly.newPlot(dom, data, layout,{responsive: true});
        } else if(type === 'table'){
            var col = (groupOrder === "region_cd")?"Region":"Year";
            var html = '<table class="table"><thead><tr><th>'+col+'</th><th>Dollars</th></thead><tbody>';
            for(var i=0; i < j.length;i++){
                if(groupOrder === "planned_construction_year") {
                    html += '<tr><td>'+j[i][groupOrder]+'</td>';
                    html += '<td class="'+bgColorClass(j[i][groupOrder])+'">'+formatter.format(j[i]['aggregate'])+'</td></tr>';
                } else {
                    html += '<tr><td>'+j[i][groupOrder]+'</td>';
                    html += '<td>'+formatter.format(j[i]['aggregate'])+'</td></tr>';
                }
            }
            html += '</tbody></table>';
            document.getElementById(dom).innerHTML = html;
        }
  });
}
//Helper function to build where clause
function whereClauseBuilder(pn_status,workshop,region) {
    var whereClause = "";
    if(workshop === "all"){
        workshop = "";
    } else {
        workshop = "and workshop_cat in ("+workshop+") ";
    }
    if(region === 0 || region === undefined){
        region = "";
    } else {
        region = "and region_cd='"+region+"' "
    }
    switch(pn_status){
        case "unfunded":
            whereClause = "&$where=stip_workshop='N' "+workshop+region;
        break;
        case "proposed":
            whereClause = "&$where=stip_workshop='Y' "+workshop+region;
        break;
        case "comapp":
            whereClause = "&$where=comm_aprv_ind='Y'and pin_stat_nm in('STIP','Scoping','Active','Advertised','Under Construction','Substantially Compl','Physically Complete') "+workshop+region;
        break;
        case "design":
            whereClause = "&$where=pin_stat_nm in('STIP','Scoping','Active') "+workshop+region;
        break;
        case "construction":
            whereClause = "&$where=pin_stat_nm in('Advertised','Under Construction','Substantially Compl','Physically Complete','Awarded') "+workshop+region;
        break;
    }
    return whereClause;
}
// Helpfer function gets year and returns bg color class
function bgColorClass(year){
  var bg = '';
  year = year !== undefined ? parseInt(year): 0;
  switch (year) {
    case 2019:
      bg = 'bg2019';
      break;
    case 2020:
      bg = 'bg2020';
      break;
    case 2021:
      bg = 'bg2021';
      break;
    case 2022:
      bg = 'bg2022';
      break;
    case 2023:
      bg = 'bg2023';
      break;
    case 2024:
      bg = 'bg2024';
      break;
    case 2025:
      bg = 'bg2025';
      break;
    case 2026:
      bg = 'bg2026';
      break;
    default:
      bg = 'bgdefault'
  }
  return bg;
}
//Function queries PIN and returns data
function pingPin(pinNum){
    fetch(sourceDataset+'?$where=pin="'+pinNum+'"').then(function(response){
        return response.json();
    }).then(function(data){
        //console.log(data);
        $('#pinNum').empty();
        $('#PinDetails').empty();
        $('#pinNum').html("PIN: "+data[0]['pin']+" - "+data[0]['pin_desc']);
        var pinDetails = "Planned Year: <strong>"+data[0]['planned_construction_year']+"</strong>";
        pinDetails += "<br />Funding Program: <strong>"+data[0]['program']+"</strong>";
        pinDetails += "<br />Public Desctiption: <i>"+data[0]['public_desc']+"</i>";
        pinDetails += "<br />Forcast Start Year: <strong>"+data[0]['forecast_st_yr']+"</strong>";
        pinDetails += "<br />Federal Dollars: <strong>"+formatter.format(data[0]['fed_dollars'])+"</strong>";
        pinDetails += "<br />State Dollars: <strong>"+formatter.format(data[0]['state_dollars'])+"</strong>";
        //Timeline
        //Stip Workwhip approved date if exists
        var projectDates = [];
        var dates;
        if(data[0]['stip_workshop_approved_dt'] !== undefined){
            //pinDetails += "<br />STIP Approved Date: <strong>"+dateTransform(data[0]['stip_workshop_approved_dt'])+"</strong>";
            dates = {
                0:"STIP Approved Date",1:dateTransform(data[0]['stip_workshop_approved_dt'])
            };
            projectDates.push(dates);
        }
        //Adversise data if exsists, else sumbmited for adverstise if exists
        if(data[0]['advertise_date'] !== undefined){
            //pinDetails += "<br />Advertise Date: <strong>"+dateTransform(data[0]['advertise_date'])+"</strong>";
            dates = {
                0:"Advertise Date",1:dateTransform(data[0]['advertise_date'])
            };
            projectDates.push(dates);
        } else if (data[0]['submit_for_advertise_date'] !== undefined){
            //pinDetails += "<br />Submit for Advertise Date: <strong>"+dateTransform(data[0]['submit_for_advertise_date'])+"</strong>";
            dates = {
                0:"Submit for Advertise Date",1:dateTransform(data[0]['submit_for_advertise_date'])
            };
            projectDates.push(dates);
        }
        //Start date if exists, else projected start data if existis, else epm plan start date if exisits
        if(data[0]['start_date'] !== undefined){
            //pinDetails += "<br />Start Date: <strong>"+dateTransform(data[0]['start_date'])+"</strong>";
            dates = {
                0:"Start Date",1:dateTransform(data[0]['start_date'])
            };
            projectDates.push(dates);
        } else if (data[0]['projected_start_date'] !== undefined){
            //pinDetails += "<br />Projected Start Date: <strong>"+dateTransform(data[0]['projected_start_date'])+"</strong>";
            dates = {
                0:"Projected Start Date",1:dateTransform(data[0]['projected_start_date'])
            };
            projectDates.push(dates);
        } else if (data[0]['epm_plan_start_date'] !== undefined){
            //pinDetails += "<br />EPM Planed Start Date: <strong>"+dateTransform(data[0]['epm_plan_start_date'])+"</strong>";
            dates = {
                0:"EPM Planed Start Date",1:dateTransform(data[0]['epm_plan_start_date'])
            };
            projectDates.push(dates);
        }
        //Subtatially complete date if exists, else epm plan end date if exists
        if(data[0]['substantially_complete_date'] !== undefined){
            //pinDetails += "<br />Substantially Complete Date: <strong>"+dateTransform(data[0]['substantially_complete_date'])+"</strong>";
            dates = {
                0:"Substantially Complete Date",1:dateTransform(data[0]['substantially_complete_date'])
            };
            projectDates.push(dates);
        } else if (data[0]['epm_plan_end_date'] !== undefined){
            //pinDetails += "<br />EPM Plan End Date: <strong>"+dateTransform(data[0]['epm_plan_end_date'])+"</strong>";
            dates = {
                0:"EPM Plan End Date",1:dateTransform(data[0]['epm_plan_end_date'])
            };
            projectDates.push(dates);
        }
        //console.log(projectDates.length);
        if(projectDates.length  !== 0){
            pinDetails += timeline(projectDates);
        }
        //One pager link
        $('#PinDetails').html(pinDetails);
        onePagerLink(data[0]['pin'],data[0]['region_cd'],'#programBriefingButton');
    }).catch (function(err) {
        console.log("Error on PingPin:"+err);
    });
}
//Function to show map when pin description is clicked
function showMapModal(pin) {
    var html = '<iframe class="mapIframe" src="https://uplan.maps.arcgis.com/apps/Minimalist/index.html?appid=ef5471033b7644d3a375745b7e436451&searchPIN='+pin+'">Iframes not supported</iframe>';
    document.getElementById('mapIframeMody').innerHTML = html;
    document.getElementById('MapModalTitle').innerHTML = 'Project ID '+pin+' Map';
}
//Function to parse date string
function dateTransform(str){
    var datize = new Date(str);
    datize = datize.toDateString();
    return datize;
}
//Function to build mini timeline
function timeline(projectDates){
    var timeline = "<div id='timelineContent'><p class='center-text'>Timeline</p><ul class='timeline'>";
    for(var i = 0;i < projectDates.length; i++){
        timeline += "<li class='event' data-date='"+projectDates[i][1]+"'>";
        timeline += "<div class='member-infos'><span class='member-title'>"+projectDates[i][0]+"</span></div></li>";
    }
    timeline += "</ul></div>";
    return timeline;
}
//Function to build one pager link 
function onePagerLink(pin,region,dom) {
    var onePagerButton = '<a href="#" class="btn btn-primary" disabled>No Program Briefing</a>';
    $(dom).empty();
    fetch('data/onepagers.json').then(function(response){
        return response.json();
    }).then(function(j){
        //console.log(j);
        for(var i=0;i<j.length;i++){
            if(j[i]['Region']=== region && j[i]['PIN']=== pin){
                onePagerButton = '<a href="http://maps.udot.utah.gov/wadocuments/Apps/ProgramBriefing/'+region+"/"+pin+'.pdf" class="btn btn-primary">Project Briefing</a>';
                break;
            }
        }
        //console.log(onePagerButton);
        $(dom).append(onePagerButton);
    }).catch(function(err){
        console.log(err+" {*_*} Shit, I should not be here!!!!");
    });
}
//Documentation Functions
//Summarize Categories in dataset
function workshopCategories(dom){
    var s = '?$select=workshop_cat,count(pin) as pins&$group=workshop_cat';
    fetch(sourceDataset+s).then(function(response) { 
        // Convert to JSON
        return response.json();
    }).then(function(j) {
        var html = '';
        var thead = '<table style="width:100%" id="workshopsDataTable" class="table table-striped table-hover">';
        thead += '<thead><tr><th>Workshop</th>';
        thead +='<th>PINs</th></tr></thead><tbody>';
        html += thead;
        for(var i=0; i < j.length;i++){
            //Populate rows
            if(j[i]['workshop_cat'] == null){
                html += '<tr><td class="text-left"><button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#workshopPinsModal" ';
                html += 'onclick="pingWorkshop('+"'No Category'"+','+"'#WorkshopPinDetails'"+')">No Category</button></td>';    
            } else {
                html += '<tr><td class="text-left"><button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#workshopPinsModal" '
                html += 'onclick="pingWorkshop('+"'"+j[i]['workshop_cat']+"'"+','+"'#WorkshopPinDetails'"+')">'+j[i]['workshop_cat']+'</button></td>';
            }
            html += '<td class="sorting">'+j[i]['pins']+'</td></tr>';
        }
        var tfoot = "</tbody></table>";
        html += tfoot;
        $(dom).append(html);
        $('#workshopsDataTable').DataTable( {
            "pagingType": "full_numbers",
            "columns": [
                { "orderable": true },
                { "orderable": true }
                ],
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        });
    }).catch(function(err){
        console.log("{*_*} Shit, I should not be here!!!!");
        console.log(sourceDataset+s);
    });
}
//Function to ping workship and get list of pin details 
function pingWorkshop(workshop,dom){
    var s = "?$select=pin,pin_desc,region_cd,pin_stat_nm&$where=workshop_cat='"+workshop+"'";
    fetch(sourceDataset+s).then(function(response){
        return response.json();
    }).then(function(j){
        var html = '';
        var thead = '<table style="width:100%" id="workshopPingTable" class="table table-striped table-hover">';
        thead += '<thead><tr><th class="text-left">PINs</th>';
        thead +='<th>Pin Description</th><th>Pin Status</th><th>Region</th></tr></thead><tbody>';
        html += thead;
        for(var i=0; i < j.length;i++){
            //Populate rows
            html += '<tr><td>'+j[i]['pin']+'</td>';
            html += '<td class="text-left">'+j[i]['pin_desc']+'</td>';
            html += '<td>'+j[i]['pin_stat_nm']+'</td>';
            html += '<td>'+j[i]['region_cd']+'</td></tr>';
        }
        var tfoot = "</tbody></table>";
        html += tfoot;
        $('#workshopName').empty();
        $(dom).empty();
        $(dom).append(html);
        if ( $.fn.dataTable.isDataTable( '#workshopPingTable' ) ) {
            table = $('#workshopPingTable').DataTable();
        }
        else {
            table = $('#workshopPingTable').DataTable( {
                "pagingType": "full_numbers",
                "columns": [
                    { "orderable": true },
                    { "orderable": true },
                    { "orderable": true },
                    { "orderable": true }
                    ]
            });
        }
        $('#workshopName').append(workshop);
    }).catch(function(err){
        console.log("{*_*} Bummer, who ever put this together should get fired!!!!"+err);
    });
}
//One pager summary table
function onepagerSummaryTable (dom){
    fetch('data/onepagers.json').then(function(response){
        return response.json();
    }).then(function(j){
        //console.log(j);
        var OnePagers = j;
        //console.log(OnePagers[3]['PIN']);
        var s = '?$select=pin,region_cd,workshop_cat';
        fetch(sourceDataset+s).then(function(response){
            return response.json();
        }).then(function(d){
            //console.log(OnePagers[3]['PIN']);
            //console.log(d);
            var html = '';
            var thead = '<table style="width:100%" id="onePagerSummaryTable" class="table table-striped table-hover">';
            thead += '<thead><tr><th class="text-left">Workshop</th>';
            thead +='<th>Region</th><th>PIN</th><th>One Pager</th></tr></thead><tbody>';
            html += thead;
            for(var i = 0;i < d.length;i++){
                html += '<tr><td class="text-left">'+d[i]['workshop_cat']+'</td>';
                html += '<td>'+d[i]['region_cd']+'</td>';
                html += '<td>'+d[i]['pin']+'</td>';
                if((OnePagers[i] != undefined) && OnePagers[i]['PIN']=== d[i]["pin"]){
                    html += '<td><a href="http://maps.udot.utah.gov/wadocuments/Apps/ProgramBriefing/'+d[i]['region_cd']+"/"+d[i]['pin']+'.pdf">Yes</a></td></tr>';
                } else{
                    html += '<td>No</td></tr>';
                }
                
            }
            var tfoot = "</tbody></table>";
            html += tfoot;
            $(dom).append(html);
            $('#onePagerSummaryTable').DataTable( {
                "pagingType": "full_numbers",
                "columns": [
                    { "orderable": true },
                    { "orderable": true },
                    { "orderable": true },
                    { "orderable": true }
                    ]
            });

        }).catch(function(err){
            alert("{*_*} Bummer, could not load dataset!!!!"+err);
            console.log("{*_*} Bummer, could not load dataset!!!!"+err);
        });
    }).catch(function(err){
        alert("{*_*} Bummer, could not load onepager data!!!!"+err);
        console.log("{*_*} Bummer, could not load onepager data!!!!"+err);
    });
}
//Show entire dataset in app documentation
function printSourceData(dom){
    var s = "?$select=pin,pin_desc,pin_stat_nm,proj_loc,project_value,region_cd,planned_construction_year,workshop_cat"
    fetch(sourceDataset+s).then(function(response){
        return response.json();
    }).then(function(d){
        //console.log(d);
        var html = '';
        var thead = '<table style="width:100%" id="sourceDataTable" class="table table-striped table-hover">';
        thead += '<thead><tr><th>PIN</th><th>PIN Description</th><th>PIN Status</th><th>Project Location</th><th>Project Value</th>';
        thead +='<th>Region</th><th>Planned Construction Year</th><th>Workshop Category</th></tr></thead><tbody>';
        html += thead;
        for(var i = 0;i < d.length;i++){
            html += '<tr><td>'+d[i]['pin']+'</td>';
            html += '<td class="text-left">'+d[i]['pin_desc']+'</td>';
            html += '<td>'+d[i]['pin_stat_nm']+'</td>';
            html += '<td>'+d[i]['proj_loc']+'</td>';
            html += '<td>'+formatter.format(d[i]['project_value'])+'</td>';
            html += '<td>'+d[i]['region_cd']+'</td>';
            html += '<td>'+d[i]['planned_construction_year']+'</td>';
            html += '<td>'+d[i]['workshop_cat']+'</td></tr>';
        }
        var tfoot = "</tbody></table>";
        html += tfoot;
        $(dom).append(html);
        $('#sourceDataTable').DataTable( {
            "pagingType": "full_numbers",
            "columns": [
                { "orderable": true },
                { "orderable": true },
                { "orderable": true },
                { "orderable": true },
                { "orderable": true },
                { "orderable": true },
                { "orderable": true },
                { "orderable": true }
                ],
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        });
    }).catch(function(err){
        alert("{*_*} Bummer, could not load onepager data!!!!"+err);
        console.log("{*_*} Bummer, could not load onepager data!!!!"+err);
    })
}
//Helper function to get URL Vars
function getAllUrlParams(url) {
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    // we'll store the parameters here
    var obj = {};
    // if query string exists
    if (queryString) {
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
      // split our query string into its component parts
      var arr = queryString.split('&');
      for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
        // set parameter name and value (use 'true' if empty)
        var paramName = a[0];
        var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
        // (optional) keep case consistent
        paramName = paramName.toLowerCase();
        if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {
          // create key if it doesn't exist
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];
          // if it's an indexed array e.g. colors[2]
          if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string'){
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
          }
        }
      }
    }
    return obj;
}
//Path Parser
//This was put together in haste..... Verify and optimize
function pathClearandReload(region){
    var load = '';
    //var id = '';
    if(region === undefined){
        load += window.location.hostname+window.location.pathname;
       //id = 0;
    } else {
        load += window.location.hostname+window.location.pathname+"?region="+region;
        //id = region;
    }
    window.location.href = load;
    //var button = document.getElementById("filterregion"+id);
    //button.classList.add("active");
}
  