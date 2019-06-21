/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
 //Query Dataset
function buildTable(query,dop,status) {
    fetch(query)
        .then(function(response){
            return response.json();
        }).then(function(data){
            //populate dom with table, dom id th document object to be populated
            var tableNum;
            if(status === "Unfunded"){
                tableNum = 1;
            }else if(status === "Advertised"){
                tableNum = 2;
            }else if(status === "Proposed"){
                tableNum = 3;
            }else if(status === "Scoping"){
                tableNum = 4;
            }else if(status === "Under Construction"){
                tableNum = 5;
            }
            if(dop === "#unfundedtbl" && status === "Unfunded"){
                status = "Proposed";
            }
            var html = '';
            var thead = '<table style="width:100%" id="dataTable'+tableNum+'" class="table table-striped table-hover">';
            thead += '<thead><tr><th>Region</th>';
            thead +='<th>PIN</th><th>PIN Description</th><th>Primary Concept</th><th>Project Value</th><th>Workshop Year</th></tr></thead><tbody>';
            html += thead;
            for(var i=0; i < data.length;i++){
                if(data[i]["pin_stat_nm"] === status){
                    //Populate funded rows
                    html += '<tr><td class="sorting">'+data[i]['region_cd']+'</td>';
                    html += '<td><button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-target="#myModal" tooltip="Click for PIN Details" ';
                    html += ' tooltip-position="buttom" onClick="pingPin('+data[i]['pin']+')">';
                    html += data[i]['pin']+'</button></td>';
                    html += '<td>'+data[i]['pin_desc']+'</td>';
                    html += '<td>'+data[i]['primary_concept']+'</td>';
                    html += '<td>'+formatter.format(data[i]['project_value'])+'</td>';
                    html += '<td class="'+bgColorClass(data[i]['stip_workshop_yr'])+'">'+data[i]['stip_workshop_yr']+'</td></tr>';
                }
            }
            var tfoot = "</tbody></table>";
            html += tfoot;
            $(dop).append(html);
            $('#dataTable'+tableNum).DataTable( {
                "pagingType": "full_numbers",
                "columns": [
                    { "orderable": true },
                    { "orderable": false },
                    { "orderable": false },
                    { "orderable": false },
                    { "orderable": false },
                    { "orderable": true }
                  ]
            });
            //Draw Charts
            //drawChart(query,'byRegiontbl'+tableNum,'region_cd');
        }).catch(function(err){
            console.log("Error :(");
    });
}
function dataTableBuilder(query,dom){
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
            html += '<td><button type="button" class="btn btn-primary btn-xs" data-toggle="modal" tooltip="Click for PIN Details" tooltip-position="top"';
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
                  { "orderable": false },
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
//
function dataTableBuilderEPM(query,dom){
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
              html += '<td><button type="button" class="btn btn-primary btn-xs" data-toggle="modal" tooltip="Click for PIN Details" tooltip-position="top"';
              html += ' data-target="#myModal" onClick="pingPin('+data[i]['pin']+')">';
              html += data[i]['pin']+'</button></td>';
              html += '<td><a data-toggle="modal" class="alt-link" data-target="#mapModal" onClick="showMapModal('+data[i]['pin']+')" ';
              html += 'tooltip="Click for Project Map" tooltip-position="top">'+data[i]['pin_description']+'</a></td>';
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
                    { "orderable": false },
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
//Function gets year and returns bg color class
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
    fetch('https://opendata.arcgis.com/datasets/a7ee5e6cc85742978d25449aae6c1941_0.geojson?$where=pin="'+pinNum+'"').then(function(response){
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
//Morris Charts
function drawChart(url,dop,xkey) {
    fetch(url).then(function(response){
        return response.json();
    }).then(function(data){
        //console.log(data);
        new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: dop,
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: data,
        // The name of the data record attribute that contains x-values.
        xkey: xkey,
        // A list of names of data record attributes that contain y-values.
        ykeys: ['sum_fed_dollars','sum_state_dollars','sum_project_value'],
        // Labels for the ykeys -- will be displayed when you hover over the
        // chart.
        labels: ['Fed $','State $','Proj Value $']
        });
    });
}
function drillChart(dop,groupOrder,workshop,status){
    var vizQueryFilter;
    if(workshop === 'all'){
      if(status === "Unfunded"){
        vizQueryFilter = "&$where=pin_stat_nm='Proposed' and comm_aprv_ind = 'N'";
      } else if(status === "Advertised") {
        vizQueryFilter = "&$where=pin_stat_nm='"+status+"'or pin_stat_nm='Funding'";
      } else {
        vizQueryFilter = "&$where=pin_stat_nm='"+status+"'";
      }
    } else{
      if(status === "Unfunded"){
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and pin_stat_nm='Proposed' and comm_aprv_ind = 'N'";
      } else if(status === "Advertised") {
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and pin_stat_nm='"+status+"'or pin_stat_nm='Funding'";
      } else {
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and pin_stat_nm='"+status+"'";
      }
    }
    var vizDataset = "https://opendata.arcgis.com/datasets/a7ee5e6cc85742978d25449aae6c1941_0.geojson";
    var vizQueryAgg = "?$select="+groupOrder+",sum(fed_dollars),sum(state_dollars),sum(project_value)";
    var vizQueryGroup = "&$group="+groupOrder;
    var vizQueryOrder = "&$order="+groupOrder;
    var url = vizDataset+vizQueryAgg+vizQueryFilter+vizQueryGroup+vizQueryOrder;
    //console.log(url + " : "+ dop);
    fetch(url).then(function(response){
        return response.json();
    }).then(function(data){
        //console.log(data);
        new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: dop,
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: data,
        // The name of the data record attribute that contains x-values.
        xkey: groupOrder,
        // A list of names of data record attributes that contain y-values.
        ykeys: ['sum_fed_dollars','sum_state_dollars','sum_project_value'],
        // Labels for the ykeys -- will be displayed when you hover over the
        // chart.
        labels: ['Fed $','State $','Proj Value $']
        });
    });
}
//Drill Chart using plotly
function drillPlotlyChart(dop,groupOrder,workshop,status){
    var vizQueryFilter;
    if(workshop === 'all'){
      if(status === "Unfunded"){
        vizQueryFilter = "&$where=pin_stat_nm='Proposed' and comm_aprv_ind = 'N'";
      } else if(status === "Advertised") {
        vizQueryFilter = "&$where=pin_stat_nm='"+status+"'or pin_stat_nm='Funding'";
      } else {
        vizQueryFilter = "&$where=pin_stat_nm='"+status+"'";
      }
    } else{
      if(status === "Unfunded"){
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and pin_stat_nm='Proposed' and comm_aprv_ind = 'N'";
      } else if(status === "Advertised") {
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and (pin_stat_nm='"+status+"'or pin_stat_nm='Funding')";
      } else {
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and pin_stat_nm='"+status+"'";
      }
    }
    var vizDataset = "https://opendata.arcgis.com/datasets/a7ee5e6cc85742978d25449aae6c1941_0.geojson";
    var vizQueryAgg = "?$select="+groupOrder+",sum(project_value)";
    var vizQueryGroup = "&$group="+groupOrder;
    var vizQueryOrder = "&$order="+groupOrder;
    var url = vizDataset+vizQueryAgg+vizQueryFilter+vizQueryGroup+vizQueryOrder;
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
        yaxis: {title: 'Project values'},xaxis: {type: 'category'}
      };
      Plotly.newPlot(dop, data, layout,{responsive: true});
  });
}
//Summary Table Function
function summaryTable(dop,groupOrder,workshop,status){
    var vizQueryFilter;
    if(status === "Unfunded"){
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and pin_stat_nm='Proposed' and comm_aprv_ind = 'N'";
    } else {
        vizQueryFilter = "&$where=workshop_cat="+workshop+" and pin_stat_nm='"+status+"'";
    }
    var vizDataset = "https://opendata.arcgis.com/datasets/a7ee5e6cc85742978d25449aae6c1941_0.geojson";
    var vizQueryAgg = "?$select="+groupOrder+",sum(fed_dollars),sum(state_dollars),sum(project_value)";
    var vizQueryGroup = "&$group="+groupOrder;
    var vizQueryOrder = "&$order="+groupOrder;
    var url = vizDataset+vizQueryAgg+vizQueryFilter+vizQueryGroup+vizQueryOrder;
    console.log(url + " : "+ dop);
    fetch(url).then(function(response){
        return response.json();
    }).then(function(data){
        var col = (groupOrder === "region_cd")?"Region":"Year";
        var html = '<table class="table"><thead><tr><th>'+col+'</th><th>Federal Dollars</th><th>State Dollars</th><th>Project Value</th></tr></thead><tbody>';
        for(var i=0; i < data.length;i++){
            html += '<tr><td>'+data[i][groupOrder]+'</td>';
            html += '<td>'+formatter.format(data[i]['sum_fed_dollars'])+'</td>';
            html += '<td>'+formatter.format(data[i]['sum_state_dollars'])+'</td>';
            html += '<td>'+formatter.format(data[i]['sum_project_value'])+'</td></tr>';
        }
        html += '</tbody></table>';
        $(dop).append(html);
    });
}
//Function to sort table
function sortTable(n,tbnm) {
    //First input is the column index, second input is the table num
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("dataTable"+tbnm);
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc";
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}
//Table Search Function
function tableSearch(sbNum) {
    //sbNum is the search bar number which is also the table number
  var input, filter, table, tr, td, i;
  input = document.getElementById("searchBar"+sbNum);
  filter = input.value.toUpperCase();
  table = document.getElementById("dataTable"+sbNum);
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
