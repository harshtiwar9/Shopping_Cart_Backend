var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

const getDetails =  (collectionName, callback) => {

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

exports.getDetails = getDetails;