const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");



app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));


mongoose.connect("mongodb+srv://Admin-Harish:Harish-2211@cluster0.doki0xu.mongodb.net/todoDB", {
  useNewUrlParser: true
});


const itemsSchema = {
  name: String,
}

const Item = mongoose.model("Item", itemsSchema);



const item1 = new Item({
  name: "Welcome to ToDo List"
});
const item2 = new Item({
  name: "Click ( + ) To Add Wish TO List"
});
const item3 = new Item({
  name: "<--  Hit Box To Remove List"
});



day = date.getDate();
const defaultItems = [item1, item2, item3];


app.get("/", (req, res) => {


  Item.find({}, function(err, foundItems) {

    if (foundItems === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("sucessfully added DB");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        ListTittle: day,
        newListItems: foundItems
      });

    }
  })

});



const listSchema = {
  name: String,
  items: [itemsSchema]
}



const List = mongoose.model("List", listSchema);


app.get("/:costumeListName", function(req, res) {
  const costumeListName = _.capitalize(req.params.costumeListName);

  List.findOne({
    name: costumeListName
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: costumeListName,
          item: defaultItems,
        });
        list.save();
        res.redirect("/")
      } else {
        res.render("list", {
          ListTittle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

});



app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    });
  }

});



app.post("/delete", function(req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedId, function(err) {
      if (!err) {
        console.log("sucessfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});





app.listen(3000, function() {
  console.log("server litening port 3000");
});
