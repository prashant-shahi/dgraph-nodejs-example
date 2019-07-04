const dgraph = require("dgraph-js");
const grpc = require("grpc");
const express = require('express');
const fs = require('fs');

// Creating express server
const app = express();

// Creating dgraph client
const dgraph_address = process.env.DGRAPH_SERVER || "localhost:9080";
console.log("dgraph_address: ", dgraph_address);
const dgraphClientStub = newClientStub(dgraph_address);
const dgraphClient = newClient(dgraphClientStub);

app.use('/clear', (req, res) => {
    dropAll().then(() => {
        console.log("\nDONE!");
        res.json({
            status: "success",
            response: "Successfully cleared all data"
        })
    }).catch((e) => {
        console.log("ERROR: ", e);
        res.json({
            status: "error",
            response: "Error while clearing data",
            error: e
        })
    });
});

app.use('/load-data', (req, res) => {
    loadData().then(() => {
        console.log("\nSuccessfully loaded the sample data");
        res.json({
            status: "success",
            response: "Successfully loaded the sample data"
        })
    }).catch((e) => {
        console.log("ERROR: ", e);
        res.json({
            status: "error",
            response: "Error occured while loading data",
            error: e
        })
    });
});

app.use('/query', (req, res) => {
    (async () => {
        var responseData = await queryData();
        console.log(responseData);
        console.log("responseData: ", responseData);
        res.json({
            status: "success",
            response: "Success while querying the sample data",
            data: responseData
        })
    })()
});

app.use('/', (req, res) => res.json({
    status: "success",
    response: "server up"
}));

// Clearing data, setting schema, and loading sample data.
async function loadData() {
    console.log(`dropAll()`);
    await dropAll();
    console.log(`setSchema()`);
    await setSchema();
    console.log(`createData()`);
    await createData();
    console.log(`end of loadData`);
}

// Create a client stub.
function newClientStub(dgraph_address) {
    return new dgraph.DgraphClientStub(dgraph_address, grpc.credentials.createInsecure());
}

// Create a client.
function newClient(clientStub) {
    return new dgraph.DgraphClient(clientStub);
}

// Drop All - discard all data and start from a clean slate.
async function dropAll() {
    const op = new dgraph.Operation();
    op.setDropAll(true);
    await dgraphClient.alter(op);
}

// Set schema.
async function setSchema() {
    //const schema = fs.readFileSync('./schema.graphql', {encoding: 'utf8'});
    const schema = fs.readFileSync('./schema.graphql').toString();
    const op = new dgraph.Operation();
    op.setSchema(schema);
    await dgraphClient.alter(op);
}

// Create data using JSON.
async function createData() {
    // Create a new transaction.
    const txn = dgraphClient.newTxn();
    try {
        // Create data.
        const sample_data = fs.readFileSync('./sample-data.nq', {encoding: 'utf8'});

        // Run mutation.
        const mu = new dgraph.Mutation();
        mu.setSetNquads(sample_data);
        const assigned = await txn.mutate(mu);

        // Commit transaction.
        await txn.commit();

        // Get uid of the outermost object (person named "Alice").
        // Assigned#getUidsMap() returns a map from blank node names to uids.
        // For a json mutation, blank node names "blank-0", "blank-1", ... are used
        // for all the created nodes.
        console.log(`Created person named "Alice" with uid = ${assigned.getUidsMap().get("blank-0")}\n`);

        console.log("All created nodes (map from blank node names to uids):");
        assigned.getUidsMap().forEach((uid, key) => console.log(`${key} => ${uid}`));
        console.log();
    } finally {
        // Clean up. Calling this after txn.commit() is a no-op
        // and hence safe.
        await txn.discard();
    }
}

// Query for data.
async function queryData() {
    // Run query.
    const query = `query all($a: string) {
        all(func: eq(user.name, $a)) {
            uid
            user.name
            age
            works.for {
                company.name
                location
            }
            connection {
                user.name
                works.for {
                    company.name
                }
            }
        }
    }`;
    const vars = { $a: "Alan" };
    const res = await dgraphClient.newTxn().queryWithVars(query, vars);
    const ppl = res.getJson();

    // Print results.
    console.log(`Number of people named "Alan": ${ppl.all.length}`);
    ppl.all.forEach((person) => console.log(person));
    return ppl
}

// Running server and listening on port 4000
app.listen(4000,() => {
    console.log('now listening for requests on port 4000');
});