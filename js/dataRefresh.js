//<script src="http://api.fmeserver.com/js/v3/FMEServer.js" type="text/javascript"></script>
//<script src="js/dataRefresh.js" type="text/javascript"></script>
//<button type="button" id="refreshData" class="btn btn-secondary btn-sm">Refresh Data</button>

const host = "https://fme.udot.utah.gov"
const token =  "9227939636261347716e7e32d4f2707a2c906c56"
const repository = 'NewGate'; 
const workspaceName = 'EPM_EGDB_FGDB_STIP_ONLY.fmw'; 

FMEServer.init({server : host,token : token}) 
 
document.getElementById("refreshData").onclick = () => refreshData();
// dom.byId("equipAdd").onclick = () => equipPress("Add");

function refreshData(){
    
    FMEServer.getWorkspaceParameters(repository, workspaceName, getParameters);

    function getParameters(response){
        document.getElementById("refreshData").disabled = true;
        document.getElementById("refreshData").innerHTML = "Refreshing - This may take up to 15 minutes";

        let params = []
        response.forEach(function(param){
            params.push({name: param["name"], value: param["defaultValue"]})
        });
        
        let parameters = {"publishedParameters": params}

        
        FMEServer.submitSyncJob(repository, workspaceName, parameters, fmeFinish)
    }

    function fmeFinish(response){
        console.log(response);
    }    
}