const express = require("express");
const date = require(__dirname + "/date.js");

const app = express();

let items = ["food", "water","milk"];
let workItems = [];

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

// HOME ROUTE
app.get("/", function(req, res) {
    let day = date.getDate();
    res.render("list", {listTitle: day, newListItems: items});
});


app.post("/", function(req, res) {
    let item = req.body.newItem;
    if (req.body.list === "Work List") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});


// WORK ROUTE
app.get("/work", function(req, res) {
    res.render("list", {listTitle: "Work List", newListItems: workItems})
});

app.post("/work", function(req, res) {
    let item = req.body.newItem;
    workItems.push(item);
});

//
app.get("/about", function(req, res) {
    res.render("about");
});

//
app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on port 3000");
});