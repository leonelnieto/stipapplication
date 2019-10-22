var gridItemArray = document.querySelectorAll("grid item");

gridItemArray.forEach(function(element){
    element.addEventListener("click", function(event){
        gridItemArray.forEach(function(elem){
            elem.classList.remove("selected");
        })
        event.target.className = "selected";
        document.querySelectorAll(".clicklist").forEach(function(elem){
            elem.classList.remove("show");
        })
        document.getElementById(event.target.innerHTML.replace(/\s/g,'').toLowerCase()).className += " show"; 
    })
});