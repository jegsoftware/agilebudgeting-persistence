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
    return("Saving plan: " + JSON.stringify(data));
}

function loadPlan(data) {
    return("Loading plan " + JSON.stringify(data));
}

function saveItem(data) {
    return("Saving item " + JSON.stringify(data));
}

function loadItem(data) {
    return("Loading item " + JSON.stringify(data));
}