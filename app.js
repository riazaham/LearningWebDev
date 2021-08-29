import express from "express";
import { getDate, getDay } from "./date.js";
import mongoose from "mongoose";
import _ from "lodash";

//const __dirname = path.resolve();
const app = express();
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//Connect to db
const url =
	"mongodb+srv://riazaham:riazaham@udemytodo.bjfnq.mongodb.net/todoListDB";

mongoose.connect(
	url,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err) => {
		if (err) console.log(err);
		else console.log("Connected to Todo List DB");
	}
);

//Todo Schema
const todoSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Todo item cannot be empty"],
	},
});

//Todo Model
const Todo = new mongoose.model("Todos", todoSchema);

//default todo items
const todo1 = new Todo({
	name: "Welcome to your brand new Todo list!",
});

const todo2 = new Todo({
	name: "Hit the + button below to add a new todo",
});

const todo3 = new Todo({
	name: "<== Hit this checkbox to cancel out a todo",
});

const defaultItems = [todo1, todo2, todo3];

// List schema
const listSchema = new mongoose.Schema({
	name: String,
	todos: [todoSchema],
});

//List model
const List = new mongoose.model("Lists", listSchema);

app.get("/", (req, res) => {
	Todo.find({}, (err, todos) => {
		if (todos.length === 0) {
			Todo.insertMany([todo1, todo2, todo3], (err) => {
				if (err) console.log(err);
				else console.log("Successfully inserted todos");
			});
			res.redirect("/");
		} else {
			res.render("list.ejs", {
				listTitle: "Today",
				todos: todos,
			});
		}
	});
});

app.get("/:listType", (req, res) => {
	const listType = _.capitalize(req.params.listType);

	List.findOne({ name: listType }, (err, results) => {
		if (err) console.log(err);
		if (results !== null) {
			res.render("list.ejs", {
				listTitle: listType,
				todos: results.todos,
			});
		} else {
			const list = new List({
				name: listType,
				todos: defaultItems,
			});
			list.save((err) => {
				if (err) console.log.log(err);
				else {
					console.log("Successfully added new List");
					res.redirect("/" + listType);
				}
			});
		}
	});
});

app.post("/", (req, res) => {
	const todoName = req.body.newTodo;
	const listType = req.body.listType;

	const newTodo = new Todo({ name: todoName });

	if (listType === "Today") {
		newTodo.save((err, docs) => {
			if (err) console.log(err);
			else console.log("Successfully added new Todo");
		});
		res.redirect("/");
	} else {
		List.findOne({ name: listType }, (err, results) => {
			if (err) console.log(err);
			else {
				results.todos.push(newTodo);
				results.save((err) => {
					if (err) console.log(err);
					else {
						console.log("Successfully added new Todo");
						res.redirect("/" + listType);
					}
				});
			}
		});
	}
});

app.post("/delete", (req, res) => {
	const todoId = req.body.todoId;
	const listType = req.body.listType;

	if (listType === "Today") {
		Todo.deleteOne({ _id: todoId }, (err, docs) => {
			if (err) console.log(err);
			else {
				console.log("Successfully deleted:", docs);
				res.redirect("/");
			}
		});
	} else {
		List.findOneAndUpdate(
			{ name: listType },
			{ $pull: { todos: { _id: todoId } } },
			{ useFindAndModify: false },
			(err, docs) => {
				if (err) console.log(err);
				else {
					console.log("Successfully removed todo");
					res.redirect("/" + listType);
				}
			}
		);
	}
});

app.get("/about", (req, res) => {
	res.render("about.ejs");
});

app.listen(3000, () => console.log("Server started on port 3000"));
