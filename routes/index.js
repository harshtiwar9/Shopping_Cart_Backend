var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongo = require('mongodb');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { getDetails, logInformation } = require('../service/Operations');

var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";
let log = "";

router.post('/login', function (req, res, next) {
  // console.log(req.body)
  var hashedPassword = bcrypt.hashSync(req.body.pass, 8);
  // console.log(hashedPassword)

  try {

    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        dbo.collection("users").findOne({email : req.body.email}, { projection: { _id: 0 } }, function (err, result) {
          if (err) throw err;

          console.log(result);
          
          if (result.email === req.body.email) {

            // create a token
            var token = jwt.sign({ id: req.body.email }, "Shopping", {
              expiresIn: 600 * 1000 // expires in 24 hours
            });
            // res.cookie({ auth: true, AuthToken: token, success: true, maxAge: 600 * 1000 });
            res.status(200).send({ auth: true, AuthToken: token, success: true, maxAge: 600 * 1000 });

            log = req.body.email + " Logged in!";
            logInformation(req.method + " " + req.originalUrl, log);
            log = "";
            db.close();
          }

        });

      });

  } catch (error) {
    console.log(error);
  }

})

router.post('/signup', function (req, res, next) {
  // console.log(req.body)
  var hashedPassword = bcrypt.hashSync(req.body.pass, 8);
  // console.log(hashedPassword)

  try {

    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopping");
        var myobj = { email: req.body.email, pass: hashedPassword };
        dbo.collection("users").insertOne(myobj, function (err, result) {
          if (err) throw err;
          if (result.insertedCount > 0) {

            // create a token
            var token = jwt.sign({ id: req.body.email }, "Shopping", {
              expiresIn: 3600 // expires in 24 hours
            });
            // res.cookie({ auth: true, AuthToken: token, success: true, maxAge: 600 * 1000 });
            res.status(200).send({ auth: true, AuthToken: token, success: true, maxAge: 600 * 1000 });

            console.log("Number of documents inserted: " + result.insertedCount);

            log = "Data : " + req.body.email + " added to Users!";
            logInformation(req.method + " " + req.originalUrl, log);
            log = "";
            db.close();
          }
        });

      });

  } catch (error) {
    console.log(error);
  }

  logInformation(req.method + " " + req.originalUrl, JSON.stringify(req.body));
});

router.post('/logout', function (req, res, next) {

  try {
    var token = req.body.token;
    var user = req.body.email;
    // console.log(req.body.token)
    var verificationJWT = jwt.verify(token, "Shopping");
    
    if(user === verificationJWT.id){
      // jwt.destroy(verificationJWT.id);
      res.clearCookie('AuthToken');
      res.status(200).send({ auth: false, success: true});
    }else{
      res.status(401).send({ auth: false, success: false});
    }
    

    // console.log(Date.now() <= verificationJWT.exp * 1000)
    // if (Date.now() <= verificationJWT.exp * 1000) {
    //   console.log(true, 'token is not expired')
    // } else { 
    //   console.log(false, 'token is expired') 
    // }

  } catch (error) {
    console.log(error);
    res.status(401).send(error);
  }

});

router.get('/me', function (req, res) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    res.status(200).send(decoded);
  });
});

router.get('/products', function (req, res, next) {
  const callback = (result) => { res.json(result) };
  getDetails('products', callback);
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
            // console.log("Order can be placed!");

            var delCount = 0;
            cartitems.map((cartItem, j) => {
              products.map((product, i) => {

                if (cartItem.id === product.id) {

                  dbo.collection("products").updateOne({ id: parseInt(cartItem.id) }, { $set: { stock: parseInt((product.stock - 1)) } }, function (err, result) {
                    if (err) throw err;
                    log += "Order Placed for Item : " + product.name + " , Remaining Stock : " + parseInt((product.stock - 1)) + "\n";
                    // cartitems.map((item, index) => {
                    dbo.collection("cart").deleteOne({ id: cartItem.id }, function (err, delOK) {
                      if (err) throw err;
                      if (delOK) console.log("Record deleted!");
                      delCount += 1;
                      console.log(delCount + "===" + cartitems.length)
                      if (delCount === cartitems.length) {
                        console.log(log)
                        logInformation(req.method + " " + req.originalUrl, log);
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
            console.log(itemOutOfStock);
            res.status(500).json(itemOutOfStock);
          }

        }
        getDetails('products', callback);
      });
  } catch (err) {

    console.log(itemOutOfStock);
    res.status(500).json(itemOutOfStock);
    console.log(err)
    err.status = 500;
    err.message = JSON.stringify({ success: false });
    // res.status(500).json({ success: false });
    next(err)
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

            log = "Data : " + items.productNameInCart + " added to Cart!";
            logInformation(req.method + " " + req.originalUrl, log);
            log = "";
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
            log = parseInt(req.params.id);
            logInformation(req.method + " " + req.originalUrl, log);
            console.log("Record deleted!");
            res.json(true);
            db.close();
          }

        });

      });
  } catch (error) {
    console.log(error);
    error.status = 500;
    error.message = JSON.stringify({ success: false });
    next(error)
  }

});

module.exports = router;