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
function dataTableBuilder(pn_status,workshop,dom){
    //Build where clause by filter
    var whereClause = whereClauseBuilder(pn_status,workshop);
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
function drillVisual(pn_status,workshop,dom,groupOrder,aggregate,type){
    var whereClause = whereClauseBuilder(pn_status,workshop);
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
function whereClauseBuilder(pn_status,workshop) {
    var whereClause = "";
    if(workshop === "all"){
        workshop = "";
    } else {
        workshop = "and workshop_cat='"+workshop+"'";
    }
    switch(pn_status){
        case "unfunded":
            whereClause = "&$where=stip_workshop='N' "+workshop;
        break;
        case "proposed":
            whereClause = "&$where=stip_workshop='Y' "+workshop;
        break;
        case "comapp":
            whereClause = "&$where=comm_aprv_ind='Y'and pin_stat_nm in('STIP','Scoping','Active','Advertised','Under Construction','Substantially Compl','Physically Complete') "+workshop;
        break;
        case "design":
            whereClause = "&$where=pin_stat_nm in('STIP','Scoping','Active') "+workshop;
        break;
        case "construction":
            whereClause = "&$where=pin_stat_nm in('Advertised','Under Construction','Substantially Compl','Physically Complete','Awarded') "+workshop;
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
    fetch('https://dashboard.udot.utah.gov/resource/a6xh-u32h.json?$where=pin="'+pinNum+'"').then(function(response){
        return response.json();
    }).then(function(data){
        //console.log(data);
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
        pinDetails += '<br ><br ><a href="http://maps.udot.utah.gov/wadocuments/apps/ProgramBriefing/'+data[0]['region_cd']+'/'+data[0]['pin']+'.pdf"'+' class="btn btn-primary" target="new">Project Briefing</a>';
        $('#PinDetails').html(pinDetails);
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
function onePagerLink(pin,region) {
    var onePagerButton = "";
    var onePagerURL = "http://maps.udot.utah.gov/wadocuments/apps/ProgramBriefing/"+region+"/"+pin+".pdf";
    $.get(onePagerURL).done(function () {
        onePagerButton = '<a href="'+onePagerURL+'" class="btn btn-primary">Project Briefing</a>';
    }).fail(function () {
        onePagerButton = '<a href="#" class="btn btn-primary">Project Briefing</a>';
    });
    return onePagerButton;
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
                html += '<tr><td class="sorting">No Category</td>';    
            } else {
                html += '<tr><td class="sorting">'+j[i]['workshop_cat']+'</td>';
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
                ]
        });
    }).catch(function(err){
        console.log("{*_*} Shit, I should not be here!!!!");
        console.log(sourceDataset+s);
    });
}