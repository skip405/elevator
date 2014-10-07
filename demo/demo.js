document.addEventListener('DOMContentLoaded', function(){
    function isNumeric(string){
        return /^[0-9]+$/.test(string);
    }

    var buildingData = {};

    buildingData.entrances = prompt('How many entrances should the house have?', "2");
    buildingData.storeys = prompt('How many storeys should the house have?', "5");

    if( ! isNumeric(buildingData.entrances) ) {
        alert('You didn\'t provide a good number so I\'ll use a default of 2');
        buildingData.entrances = 2;
    }
    if( ! isNumeric(buildingData.storeys) ) {
        alert('You didn\'t provide a good number so I\'ll use a default of 5');
        buildingData.storeys = 5;
    }

    new House(buildingData);
});