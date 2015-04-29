/*473 Assignment 9 - Modify Chapter 7 Amazeriffic to use SocketIO
**<http://socket.io/get-started/chat/> to understand how to integrate socket.io
*/

/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */
"use strict";

var express = require("express"),
    app = express(),
    http = require("http"),
    server = http.createServer(app),
    // import the mongoose library
    mongoose = require("mongoose"),
    //add socket and initialize a new instance of socket.io by passing http server object
	io = require("socket.io")(server);

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect("mongodb://localhost/amazeriffic");

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

io.on("connection", function (socket){
	console.log("a user connected");
	socket.on("add newToDo", function (newToDo){
		console.log("newToDo: " + newToDo.description);
		//broadcast to everyone when a ToDo item is added
		io.emit("newToDo", newToDo);
	});
	socket.on("disconnect", function() {
		console.log("user disconnected");
	});
});

server.listen(3000);
console.log("Server is listening on port 3000");

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log(req.body);
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // our client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}
		res.json(result);
	    });
	}
    });
});

