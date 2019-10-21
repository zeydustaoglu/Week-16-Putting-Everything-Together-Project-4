//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-zeyd:test1234@mycluster-qlk57.mongodb.net/dbDuraCloud",
  { useNewUrlParser: true }
);

// const item1 = new Item({
//   name: "Welcome to your todolist!"
// });

// const item2 = new Item({
//   name: "Hit the + button to add a new item."
// });

// const item3 = new Item({
//   name: "<-- Hit this to delete an item."
// });

// const defaultItems = [item1, item2, item3];

const customerSchema = {
  companyName: String,
  email: String,
  password: String,
  phoneNumber: String,
  adres: String
};

const Customer = mongoose.model("Customer", customerSchema);

const orderSchema = {
  companyName: String,
  productName: String,
  piece: String,
  date: String,
  amount: String
};

const Order = mongoose.model("Order", orderSchema);

const productSchema = {
  productName: String,
  price: Number
};

const Product = mongoose.model("Product", productSchema);

app.get("/", function(req, res, next) {
  res.render("index", { page: "Home", menuId: "home", failed: "false" });
});

app.get("/about", function(req, res, next) {
  res.render("about", { page: "About Us", menuId: "about" });
});

app.get("/signup", function(req, res, next) {
  res.render("signup", { page: "Sign up", menuId: "signup" });
});
app.get("/products", function(req, res, next) {
  res.render("products", { page: "Products", menuId: "products" });
});

app.get("/contact", function(req, res, next) {
  res.render("contact", { page: "Contact", menuId: "contact" });
});

app.get("/customers", function(req, res, next) {
  Customer.find({}, function(err, foundCustomers) {
    res.render("customers", {
      page: "Customers",
      menuId: "customers",
      customers: foundCustomers
    });
  });
});

// -------------------------------------------- Log In Post --------------------------------------------
app.post("/", function(req, res) {
  var name = req.body.inputName;
  var email = req.body.inputEmail;
  var password = req.body.inputPassword;

  Customer.findOne({ companyName: name }, function(err, foundList) {
    if (!err) {
      if(!foundList){
                res.render("index", { page: "Home", menuId: "home", failed: "true" });
      }else{
        if (
          foundList.companyName === name &&
          foundList.email === email &&
          foundList.password === password
        ) {
          res.redirect("/my-account/" + name);
        } else {
          res.render("index", { page: "Home", menuId: "home", failed: "true" });
        }
      }
    }
  });
});

app.post("/signup", function(req, res) {
  var name = req.body.inputName;
  let email = req.body.inputEmail;
  let password = req.body.inputPassword;
  let phone = req.body.inputPhone;
  let adres = req.body.inputAdres;

  const customer = new Customer({
    companyName: name,
    email: email,
    password: password,
    phoneNumber: phone,
    adres: adres
  });
  customer.save();
  res.redirect("/my-account/" + name);
});

// -------------------------------------------- My Account Get --------------------------------------------
app.get("/my-account/:name", function(req, res, next) {
  const companyName = req.params.name;

  Customer.findOne({ companyName: companyName }, function(err1, foundList) {
    Order.find({ companyName: companyName }, function(err2, foundOrders) {
      Product.find({}, function(err3, foundProducts) {
        if (!err1 && !err2 && !err3) {
          if (!foundOrders) {
            res.render("my-account", {
              page: "MyAccount",
              menuId: "my-account",
              customer: foundList,
              products: foundProducts,
              orders: []
            });
          } else {
            res.render("my-account", {
              page: "MyAccount",
              menuId: "my-account",
              customer: foundList,
              products: foundProducts,
              orders: foundOrders
            });
          }}
      });
    });
  });
});

app.post("/add-order", function(req, res) {

  let companyName = req.body.companyName;
  let productName = req.body.productName;
  let piece = req.body.piece;
  
  var today = new Date();
  var dd = today.getDate();
  
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();

  let date = dd+'-'+mm+'-'+yyyy

  Product.findOne({ productName: productName }, function(err1, foundList) {
    
    const order = new Order({

      companyName: companyName,
      productName: productName,
      piece: piece,
      date: date,
      amount: Number(foundList.price)*piece

    });  
    
    console.log("Order Added");
    order.save();  

    res.redirect("/my-account/" + companyName);
  });
});

// console.log('Orders:',dbOrders);

// -------------------------------------------- Del Order Delete --------------------------------------------
app.post("/del-order", function(req, res) {
  
  let orderId = req.body.orderId;
  let companyName = req.body.companyName;

  Order.findByIdAndRemove(orderId, function(err){
    if (!err){      
      console.log("Successfully deleted checked item.");      
    res.redirect("/my-account/" + companyName);
    }
  });  
});


let port = process.env.PORT;

if (port == null || port == "") {
  port = 3010;
}

app.listen(port, function() {
  console.log("Server has started successfully!");
});
