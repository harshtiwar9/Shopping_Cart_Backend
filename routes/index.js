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

  MongoClient.connect(url,
    { useUnifiedTopology: true },
    function (err, db) {
      if (err) throw err;
      var dbo = db.db("shopping");
      dbo.collection("products").find({}, { projection: { _id: 0 } })
        .toArray(function (err, result) {
          if (err) throw err;
          res.json(result);
          db.close();
        })
    }
  )

  // console.log(req)
  // const fileContent = fs.readFileSync('E:\\MERN\\Backend_Shopping_Cart\\test.txt', { encoding: 'utf8', flag: 'r' });
  // res.json({ filecontent: fileContent })
});





router.post('/update', function (req, res, next) {

  console.log(req)
  try {
    fs.appendFileSync('E:\\MERN\\Backend_Shopping_Cart\\test.txt', req.body.data.vb.dfg.g, { encoding: 'utf8', flag: 'a' });
    res.json({ filecontent: "file read suss=cfuly" })
  } catch (err) {
    res.status(500)
    res.json({ filecontent: "file read unsuccefukt" })
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
