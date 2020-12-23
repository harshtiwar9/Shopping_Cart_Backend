var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongo = require('mongodb');

var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ test: "express" })

});


//  C R (done) U (done)D 
router.get('/getproducts', function (req, res, next) {

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        dbo.collection("products").find({}, { projection: { _id: 0 } })
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


  // console.log(req)
  // const fileContent = fs.readFileSync('E:\\MERN\\Backend_Shopping_Cart\\test.txt', { encoding: 'utf8', flag: 'r' });
  // res.json({ filecontent: fileContent })
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
              res.json(true);
              // console.log(modifiedCount+" document updated");
              db.close();
            }

          });
        })
      });
  } catch (error) {
    console.log(error)
  }
});


router.post('/create', function (req, res, next) {

  var createStream = fs.createWriteStream(`E:\\MERN\\Backend_Shopping_Cart\\${req.query.params}.txt`);
  createStream.end();
  res.json({ filecontent: "file created succfuly" })
});





router.delete('/delete', function (req, res, next) {

  fs.unlink(`E:\\MERN\\Backend_Shopping_Cart\\${req.query.params}.txt`, (err) => {
    if (err) throw err;
    res.json({ filecontent: 'path/file.txt was deleted' })

  });
});


module.exports = router;
