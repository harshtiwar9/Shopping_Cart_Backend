var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongo = require('mongodb');
const { getDetails } = require('../service/getDetails');

var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/products', function (req, res, next) {
  const callback = (result) => { res.json(result) };
  getDetails('products', callback);
  // console.log(result)
  // res.json(result)
});

router.get('/cart', function (req, res, next) {
  const callback = (result) => { res.json(result) };
  getDetails('cart', callback);
});

router.post('/order', function (req, res, next) {

  var itemOutOfStock = [];

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        const callback = (products) => {
          // console.log(result)

          // console.log(req.body)

          var cartitems = req.body;
          var itemsInStock = 0;

          products.map((product, i) => {
            cartitems.map((cartItem, j) => {

              if (cartItem.id === product.id) {
                if (product.stock > 0) {
                  console.log(cartItem.productNameInCart + " : " + product.stock);
                  itemsInStock += 1;
                } else {
                  itemOutOfStock.push(cartItem.productNameInCart);
                  console.log("Error!");
                }

              }

            })
          })

          if (itemsInStock === cartitems.length) {
            console.log("Order can be placed!");

            var delCount = 0;
            products.map((product, i) => {
              cartitems.map((cartItem, j) => {

                if (cartItem.id === product.id) {

                  dbo.collection("products").updateOne({ id: parseInt(cartItem.id) }, { $set: { stock: parseInt((product.stock - 1)) } }, function (err, result) {
                    if (err) throw err;

                    // cartitems.map((item, index) => {
                    dbo.collection("cart").deleteOne({ id: cartItem.id }, function (err, delOK) {
                      if (err) throw err;
                      if (delOK) console.log("Record deleted!");
                      delCount += 1;
                      console.log(delCount + "===" + cartitems.length)
                      if (delCount === cartitems.length) {
                        res.status(200).json({ success: true });
                        db.close();
                      }
                    });
                    // })

                  });

                }

              })
            })

          } else {
            console.log(itemOutOfStock)
            res.status(500).json(itemOutOfStock);
          }

        }
        getDetails('products', callback);
      });
  } catch (error) {
    console.log(error)
    error.status = 500;
    error.message = JSON.stringify({ success: false });
    // res.status(500).json({ success: false });
    next(error)
  }

});

router.post('/cart', function (req, res, next) {

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        var items = req.body;

        dbo.collection("cart").insertMany([items], function (err, result) {
          if (err) throw err;
          if (result.insertedCount > 0) {
            res.json(true);
            console.log("Number of documents inserted: " + result.insertedCount);
            db.close();
          }
        });

      });
  } catch (error) {
    console.log(error);
    error.status = 500;
    error.message = JSON.stringify({ success: false });
    // res.status(500).json({ success: false });
    next(error)
  }

  // var createStream = fs.createWriteStream(`E:\\MERN\\Backend_Shopping_Cart\\${req.query.params}.txt`);
  // createStream.end();
  // res.json({ filecontent: "file created succfuly" })
});

router.delete('/cart/:id', function (req, res, next) {

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");

        var myquery = { id: parseInt(req.params.id) };
        dbo.collection("cart").deleteOne(myquery, function (err, delOK) {
          if (err) throw err;
          if (delOK.result.n > 0) {
            console.log("Record deleted!");
            res.json(true);
            db.close();
          }

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