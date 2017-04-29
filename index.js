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

function savePlan(plan) {
    var periodNum = plan.periodNum;
    var periodYear = plan.periodYear;
    var actualsOpen = plan.actualsOpen;
    var planningOpen = plan.planningOpen;

    var logStr = "Saving plan for period " + periodNum + "/" + periodYear + "\n";
    logStr += "Planning is " 
    logStr += planningOpen ? "open.\n" : "closed.\n";
    logStr += "Actuals are " 
    logStr += actualsOpen ? "open.\n" : "closed.\n";
    if (plan.items) {
        logStr += "Items:\n";
        for (var i=0; i < plan.items.length; i++)
        {
            logStr += "  " + saveItem(plan.items[i]) + "\n";
        }
    }
    console.log(logStr);
    return { 
        periodNum : periodNum, 
        periodYear : periodYear 
    };
}

function loadPlan(identifier) {
    var periodNum = identifier.periodNum;
    var periodYear = identifier.periodYear;
    var actualsOpen = true;
    var planningOpen = true;
    return { 
        periodNum : periodNum, 
        periodYear : periodYear, 
        actualsOpen : actualsOpen, 
        planningOpen : planningOpen 
    };
}

function saveItem(item) {
    var itemId = item.uuid;
    var periodNum = item.periodNum;
    var periodYear = item.periodYear;
    var description = item.description;
    var amount = item.amount;
    var account = item.account;
    var date = item.date;
    var type = item.type;

    if (itemId == null) itemId = 'this-is-a-generated-uuid';

    var logStr = "Saving item with id " + itemId + "\n";
    logStr += "periodNum = " + periodNum + "\n";
    logStr += "periodYear = " + periodYear + "\n";
    logStr += "description = " + description + "\n";
    logStr += "amount = " + amount + "\n";
    logStr += "account = " + account + "\n";
    logStr += "date = " + date + "\n";
    logStr += "type = " + type + "\n";
    console.log(logStr);

    return { uuid : itemId };
}

function loadItem(identifier) {
    var itemId = identifier.uuid;

    if (itemId == null) return "No item found.\n";

    var periodNum = 1;
    var periodYear = 2017;
    var description = "test description";
    var amount = 42.00;
    var account = "Checking";
    var date = "2017-01-01";
    var type = "ActualItem";
    return {
        uuid : itemId,
        periodNum : periodNum,
        description : description,
        amount : amount,
        account : account,
        date : date,
        type : type
    };
}