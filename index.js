exports.persistenceHandler = function (req, res) {

    var response = "";
    switch (req.body.persistenceType) {
        case "savePlan": response = savePlan(req.body.data); break;
        case "loadPlan": response = loadPlan(req.body.data); break;
        case "saveItem": response = saveItem(req.body.data); break;
        case "loadItem": response = loadItem(req.body.data); break;
        default: response = "Unknown persistenceType";
    }
    res.send(response);
}

function savePlan(data) {
    var periodNum = data.periodNum;
    var periodYear = data.periodYear;
    var actualsOpen = data.actualsOpen;
    var planningOpen = data.planningOpen;

    var logStr = "Saving plan for period " + periodNum + "/" + periodYear + "\n";
    logStr += "Planning is " 
    logStr += planningOpen ? "open.\n" : "closed.\n";
    logStr += "Actuals are " 
    logStr += actualsOpen ? "open.\n" : "closed.\n";
    if (data.items) {
        logStr += "Items:\n";
        for (var i=0; i < data.items.length; i++)
        {
            logStr += "  " + saveItem(data.items[i]) + "\n";
        }
    }
    console.log(logStr);
    return { "periodNum" : periodNum, "periodYear" : periodYear };
}

function loadPlan(data) {
    var periodNum = data.periodNum;
    var periodYear = data.periodYear;
    return "Loading plan for period " + periodNum + "/" + periodYear + "\n";
}

function saveItem(data) {
    return("Saving item " + JSON.stringify(data));
}

function loadItem(data) {
    return("Loading item " + JSON.stringify(data));
}