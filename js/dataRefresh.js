//<script src="http://api.fmeserver.com/js/v3/FMEServer.js" type="text/javascript"></script>
//<script src="js/dataRefresh.js" type="text/javascript"></script>
//<button type="button" id="refreshData" class="btn btn-secondary btn-sm">Refresh Data</button>

const host = "https://fme.udot.utah.gov"
const token = "3d388676e908d7bd24f2693d55ea2f5d034d99e1"
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
        console.log(response);
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