var datastore = require('@google-cloud/datastore')({
    projectId: 'arcane-antler-164801'
});
var async = require('async');

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

    async.each(plan.items, saveItem, (err) => {
        if (err) {
            console.error("Error saving items: " + err);
        }
        // the items are saved, so delete them for a cleaner storage of the plan
        delete plan.items;

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
                    console.error('ERROR: ' + err);
                    cb ({});
                } else {
                    cb( {
                        periodNum : periodNum, 
                        periodYear : periodYear 
                    });
                }
            });
        });
    });
}

function loadPlan(identifier, cb) {
    var periodNum = identifier.periodNum;
    var periodYear = identifier.periodYear;
    findPlan(periodNum, periodYear, (plan, planKey) => {
        loadItems(periodNum, periodYear, (items) => {
            if (items && items.length > 0) plan.items = items;
            cb (plan);
        });
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
}

function loadItems(periodNum, periodYear, cb) {
    var query = datastore.createQuery('planItem');
    query.filter('periodNum', periodNum);
    query.filter('periodYear', periodYear);
    datastore.runQuery(query, function (err, entities) {
        if (err) {
            console.error("Error querying data store for: " + periodNum + "/" + periodYear + ": " + err);
            cb([]);
        } else {
            cb(entities);
        }
    });
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