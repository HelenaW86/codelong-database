import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/books-cal";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const Author = mongoose.model("Author", {
  name: String,
});

const Book = mongoose.model("Book", {
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  },
});

//if you write RESET_DATABASE in the console before npm run dev.
if (process.env.RESET_DATABASE) {
  console.log("resetting db");
}
const seedDatabase = async () => {
  await Author.deleteMany();
  const tolkien = new Author({ name: "Tolkien" });
  await tolkien.save();

  const rowling = new Author({ name: "Rowling" });
  await rowling.save();

  await new Book({
    title: "Harry Potter and the Philosopher´s Stone",
    author: tolkien,
  }).save();
};

seedDatabase();
// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/authors", async (req, res) => {
  const authors = await Author.find();
  res.json(authors);
});

app.get("/books", async (req, res) => {
  const books = await Book.find().populate("author");
  res.json(books);
});

app.get("/authors/:id", async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    res.json(author);
  } else {
    res.status(404).json({ error: "Author not found" });
  }
});

app.get("/authors/:id/books", async (req, res) => {
  const author = await Author.findById(req.params.id);
  const books = await Book.find({ author: mongoose.Types.ObjectId(author.id) });
  if (author) {
    res.json(books);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
