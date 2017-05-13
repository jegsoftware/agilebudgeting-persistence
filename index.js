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
    var actualsStatus = plan.actualsStatus;
    var planningStatus = plan.planningStatus;

    var logStr = "Saving plan for period " + periodNum + "/" + periodYear + "\n";
    logStr += "Planning is " + planningStatus + "\n"; 
    logStr += planningOpen ? "open.\n" : "closed.\n";
    logStr += "Actuals are " + actualsStatus +"\n"; 
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
    var actualsStatus = "OPEN";
    var planningStatus = "OPEN";
    var plan = { 
        periodNum : periodNum, 
        periodYear : periodYear, 
        actualsStatus : actualsStatus, 
        planningStatus : planningStatus,
        items : loadItems(periodNum, periodYear)
    };
    return plan;
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
        periodYear : periodYear,
        description : description,
        amount : amount,
        account : account,
        date : date,
        type : type
    };
}

function loadItems(periodNum, periodYear) {
    var items = [];
    for (var i = 0; i < periodNum; i++) {
        var item = {
            uuid : "uuid-for-item-" + i,
            periodNum : periodNum,
            periodYear : periodYear,
            description : "description for item " + i,
            amount : 42.00 + i,
            account : "Checking",
            date : periodNum + "/" + (i+1) + "/2017",
            type : "PlannedItem"
        }
        items.push(item);
    }
    return items;
}