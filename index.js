var datastore = require('@google-cloud/datastore')({
    projectId: 'arcane-antler-164801'
});

exports.persistenceHandler = function (req, res) {

    switch (req.body.persistenceType) {
        case "savePlan": response = savePlan(req.body.data, (response) => { res.send(response); }); break;
        case "loadPlan": response = loadPlan(req.body.data, (response) => { res.send(response); }); break;
        case "saveItem": response = saveItem(req.body.data, (response) => { res.send(response); }); break;
        case "loadItem": response = loadItem(req.body.data, (response) => { res.send(response); }); break;
        default: response = res.send("Unknown persistenceType");
    }
}

function savePlan(plan, cb) {
    var periodNum = plan.periodNum;
    var periodYear = plan.periodYear;
    var actualsStatus = plan.actualsStatus;
    var planningStatus = plan.planningStatus;

    var logStr = "Saving plan for period " + periodNum + "/" + periodYear + "\n";
    logStr += "Planning is " + planningStatus + "\n"; 
    logStr += "Actuals are " + actualsStatus +"\n";    
    if (plan.items) {
        logStr += "Items:\n";
        for (var i=0; i < plan.items.length; i++)
        {
            logStr += "  " + saveItem(plan.items[i]) + "\n";
        }
        // after saving the items delete them from the object so we don't store them in the plan table
        delete plan.items;
    }

    findPlan(periodNum, periodYear, (foundPlan, planKey) => {
        if (!planKey) {
            planKey = datastore.key('plan');
        }
        var planStorageObj = {
            key: planKey,
            data: plan
        }

        datastore.save(planStorageObj, (err) => {
            if (err) {
                logStr += 'ERROR: ' + err + '\n';
                console.log(logStr);
                cb ({});
            } else {
                console.log(logStr);
                logStr += 'Saved plan\n';
                cb( {
                    periodNum : periodNum, 
                    periodYear : periodYear 
                });
            }
        });
    });
}

function loadPlan(identifier, cb) {
    var periodNum = identifier.periodNum;
    var periodYear = identifier.periodYear;
    var actualsStatus = "OPEN";
    var planningStatus = "OPEN";
    findPlan(periodNum, periodYear, (plan, planKey) => {
        plan.items = loadItems(periodNum, periodYear);
        cb (plan);
    });

}

function saveItem(item, cb) {
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

function loadItem(identifier, cb) {
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

function loadItems(periodNum, periodYear, cb) {
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

function findPlan(periodNum, periodYear, cb) {
    var query = datastore.createQuery('plan');
    query.filter('periodNum', periodNum);
    query.filter('periodYear', periodYear);
    datastore.runQuery(query, function (err, entities) {
        if (entities.length > 1) {
            console.error("Got more than one plan for: " + periodNum + "/" + periodYear);
        }
        var plan = entities[0];
        var planKey = entities[0][datastore.KEY];
        console.log("Got " + entities.length + " entities from query\n;")
        console.log('planObj: ' + JSON.stringify(plan));
        console.log('planKey: ' + JSON.stringify(planKey));
        cb (plan, planKey);
    });
}