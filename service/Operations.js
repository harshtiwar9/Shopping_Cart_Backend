var mongo = require('mongodb');
var fs = require('fs');
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

const getDetails = (collectionName, callback) => {

    try {
        MongoClient.connect(url,
            { useUnifiedTopology: true },
            function (err, db) {
                if (err) throw err;
                var dbo = db.db("shopping");
                dbo.collection(collectionName).find({}, { projection: { _id: 0 } })
                    .toArray(function (err, result) {
                        if (err) throw err;
                        // res.json(result);
                        callback(result)
                        db.close();
                        // console.log(result)
                        // return result;
                    })
            }
        )
    } catch (error) {
        console.log(error)
    }

}

function logInformation(action, data) {

    let log = "";

    console.log(action + " : " + data)

    try {
        if (action === "POST /cart") {

            fs.appendFile('log.txt', data, function (err) {
                if (err) return console.log(err);
                console.log(log);
            });
        } else if (action === "DELETE /cart/" + data) {

            const callback = (products) => {
                products.map((product, i) => {
                    if (product.id === data) {
                        log = product.name + " deleted from cart!";
                        fs.appendFile('log.txt', log, function (err) {
                            if (err) return console.log(err);
                            console.log(log);
                        });
                    }
                });
            };
            getDetails('products', callback);

        } else if (action === "POST /order") {

            fs.appendFile('log.txt', data, function (err) {
                if (err) return console.log(err);
                console.log(log);
            });


        } else if (action === "error") {

            fs.appendFile('log.txt', data, function (err) {
                if (err) return console.log(err);
                console.log(log);
            });

        }
    } catch (error) {
        fs.appendFile('log.txt', error, function (err) {
            if (err) return console.log(err);
            console.log(log);
        });
    }

}

exports.getDetails = getDetails;
exports.logInformation = logInformation;