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
    findPlan(periodNum, periodYear, (plan, planKey) => {
        plan.items = loadItems(periodNum, periodYear);
        cb (plan);
    });

}

function saveItem(item, cb) {
    if (item.uuid == null) {
        cb('Invalid item: missing uuid');
        return;
    }

    findItem(item.uuid, (foundItem, itemKey) => {
        if (!itemKey) {
            itemKey = datastore.key(['planItem', item.uuid]);
        }
        var itemStorageObj = {
            key: itemKey,
            data: item
        }

        datastore.save(itemStorageObj, (err) => {
            if (err) {
                console.error (err);
                cb ({});
            } else {
                console.log("Successfully saved item with uuid: " + item.uuid);
                cb({ uuid: item.uuid });
            }
        });
    });
}

function loadItem(identifier, cb) {
    var itemId = identifier.uuid;

    if (itemId == null) {
        cb("No item found.\n");
    }

    findItem(itemId, (item, itemKey) => {
        cb(item);
    });

/*    var periodNum = 1;
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
    };*/
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
        var planKey;
        if (plan) planKey = entities[0][datastore.KEY];
        console.log("Got " + entities.length + " entities from query\n;")
        console.log('planObj: ' + JSON.stringify(plan));
        console.log('planKey: ' + JSON.stringify(planKey));
        cb (plan, planKey);
    });
}

function findItem(uuid, cb) {
    var query = datastore.createQuery('planItem');
    query.filter('uuid', uuid);
    datastore.runQuery(query, function (err, entities) {
        if (entities.length > 1) {
            console.error("Got more than one item for: " + uuid);
        }
        var item = entities[0];
        var itemKey;
        if (item) itemKey = entities[0][datastore.KEY];
        console.log("Got " + entities.length + " entities from query\n;")
        console.log('itemObj: ' + JSON.stringify(item));
        console.log('itemKey: ' + JSON.stringify(itemKey));
        cb (item, itemKey);
    });
    
}