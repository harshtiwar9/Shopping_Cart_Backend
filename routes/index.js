var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongo = require('mongodb');

var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

// /* GET home page. */
// router.get('/', function (req, res, next) {
//   res.json({ test: "express" })

// });


//  C R (done) U (done)D 
router.get('/', function (req, res, next) {

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        dbo.collection(req.query.request).find({}, { projection: { _id: 0 } })
          .toArray(function (err, result) {
            if (err) throw err;
            res.json(result);
            console.log((new Date()).toUTCString());
            db.close();
          })
      }
    )
  } catch (error) {
    console.log(error)
  }

});


router.post('/placeOrder', function (req, res, next) {

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        var items = JSON.parse(req.query.items);
        var myquery = 0;
        var newvalues = 0;
        var updatedStock = 0;
        var modifiedCount = 0;

        items.map((elm, i) => {
          // res.json(elm[1])
          // console.log(elm.id);
          myquery = { id: parseInt(elm.id) };
          updatedStock = ((elm.stock) - 1);
          newvalues = { $set: { stock: parseInt(updatedStock) } };
          dbo.collection("products").updateOne(myquery, newvalues, function (err, result) {
            if (err) throw err;
            // console.log(result.modifiedCount)
            modifiedCount += result.modifiedCount;
            if (i === (items.length - 1)) {
              dbo.collection("cart").drop(function (err, delOK) {
                if (err) throw err;
                if (delOK) console.log("Collection deleted");
                res.json(true);
                // console.log(modifiedCount+" document updated");
                db.close();
              });

            }

          });
        })
      });
  } catch (error) {
    console.log(error)
  }
});


router.post('/insertToCart', function (req, res, next) {

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        var items = JSON.parse(req.query.items);
        var data = [{ items }];

        // items.map((elm, i) => {
        //   data.push(elm)
        // })

        dbo.collection("cart").insertMany([items], function (err, result) {
          if (err) throw err;
          res.json(true);
          console.log("Number of documents inserted: " + result.insertedCount);
          db.close();
        });

      });
  } catch (error) {
    console.log(error)
  }

  // var createStream = fs.createWriteStream(`E:\\MERN\\Backend_Shopping_Cart\\${req.query.params}.txt`);
  // createStream.end();
  // res.json({ filecontent: "file created succfuly" })
});





router.delete('/removefromcart', function (req, res, next) {

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        var id = parseInt(req.query.id);

        var myquery = { id: parseInt(req.query.id) };
        dbo.collection("cart").deleteOne(myquery, function (err, obj) {
          if (err) throw err;
          res.json(true);
          console.log("1 document deleted");
          db.close();
        });

      });
  } catch (error) {
    console.log(error)
  }

  // fs.unlink(`E:\\MERN\\Backend_Shopping_Cart\\${req.query.params}.txt`, (err) => {
  //   if (err) throw err;
  //   res.json({ filecontent: 'path/file.txt was deleted' })

  // });
});


module.exports = router;
