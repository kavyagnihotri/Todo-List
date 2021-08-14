const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

// mongoose update
mongoose.connect('mongodb://localhost:27017/todolistDB', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
    name: "food"
});
const item2 = new Item ({
    name: "Hit + button to add a new item"
});
const item3 = new Item ({
    name: "Check checkbox to delete item"
});

const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

// HOME ROUTE
app.get("/", function(req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items!");
                } 
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: date.getDate(), newListItems: foundItems});
        }
    });
});

// CUSTOM LIST ROUTE
app.get("/:customList", function(req, res) {
    const customList = _.capitalize(req.params.customList);

    List.findOne({name: customList}, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                // create a new list
                const list = new List({
                    name: customList,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customList);

            } else {
                // show existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item ({
        name: itemName
    });

    if (listName === date.getDate()) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

// DELETE OPTION
app.post("/delete", function(req, res) {
    const itemID = req.body.checkbox;
    const listName = req.body.lst;
    if (listName === date.getDate()) {
        Item.findByIdAndRemove(itemID, function(err) {
            if (!err) {
                console.log("Successfully deleted checked item!");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, 
            {$pull: {items: {_id: itemID}}}, 
            // {new: true}, 
            function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/about", function(req, res) {
    res.render("about");
});

//
app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on port 3000");
});