let x = 2;
var express = require("express");
var router = express.Router();
var fs = require("fs");

var orders = [];

fileManager = {
  read: function () {
    const stat = fs.statSync("ordersData.json");
    if (stat.size !== 0) {
      const rawdata = fs.readFileSync("ordersData.json");
      orders = JSON.parse(rawdata);
    }
  },

  write: function () {
    let data = JSON.stringify(orders);
    fs.writeFileSync("ordersData.json", data);
  },
};

const mongoose = require("mongoose");

const OrderSchema = require("../orderSchema");

const ordersDbConnectionString =
  "mongodb+srv://viktoriiavmorozova:<password>@victoriacluster.hrvllid.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(ordersDbConnectionString).then(
  () => {
    console.log("Database connection established!");
  },
  (err) => {
    console.log("Error connecting Database instance due to: ", err);
  }
);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.sendFile("index.html");
});

/* Print posted Order to console */
router.post("/PrintOrder", function (req, res) {
  const newOrder = req.body;
  console.log(newOrder);
  var response = {
    status: 200,
    success: "Printed Successfully",
  };
  res.end(JSON.stringify(response));
});

/* Add one new Order */
router.post("/AddOrder", async function (req, res) {
  const newOrder = new OrderSchema(req.body);
  try {
    await newOrder.save();
    var response = {
      status: 200,
      success: "Added Successfully",
    };
    res.end(JSON.stringify(response));
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/RevenueByStore", async function (req, res) {
  try {
    const revenueByStore = await OrderSchema.aggregate([
      {
        $group: {
          _id: { StoreID: "$StoreID" },
          StoreRevenue: {
            $sum: "$PricePaid",
          },
        },
      },
    ]);
    const content = JSON.stringify(revenueByStore);
    console.log(content);
    res.end(content);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/RevenueBySalesPerson", async function (req, res) {
  try {
    const revenueBySalesPerson = await OrderSchema.aggregate([
      {
        $group: {
          _id: { SalesPersonID: "$SalesPersonID" },
          Revenue: {
            $sum: "$PricePaid",
          },
        },
      },
    ]);
    const content = JSON.stringify(revenueBySalesPerson);
    console.log(content);
    res.end(content);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
module.exports = router;
