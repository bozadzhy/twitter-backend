import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";

import PostModel from "./models/Post.js";

import {
  loginValidation,
  postCreateValidation,
  registValidation,
} from "./validations.js";
import checkAuth from "./utils/checkAuth.js";
import { register, login, getMe, getAllUsers } from "./controllers/UserController.js";
import {
  create,
  createComments,
  getAll,
  getComments,
  getLastTags,
  getOne,
  remove,
  update,
} from "./controllers/PostControllers.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";

mongoose
  .connect(
    "mongodb+srv://boz:boz@cluster0.0g2fq.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connect to mongoDB"))
  .catch((err) => console.log("Error connecting", err));

const app = express();

// хранилище картинок и его методи
const storage = multer.diskStorage({
  destination: (_, __, cd) => {
    cd(null, "uploads");
  },
  filename: (_, file, cd) => {
    cd(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.post("/auth/login", loginValidation, handleValidationErrors, login);
app.post("/auth/register", registValidation, handleValidationErrors, register); // registValidation передаем вторім параметров в пост запрос для валидации
app.get("/auth/me", checkAuth, getMe); // checkAuth проверка нужно ли віполнять функцию дальше с помощью next() (req, res) =>
app.get("/users", getAllUsers); 

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});
// comments
app.post("/posts/:id/comments", checkAuth, createComments);
app.get("/posts/:id/comments", getComments);

// posts
app.get("/posts", getAll);
app.get("/tags", getLastTags);
app.get("/posts/:id", getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  create
);

// delete post
app.delete("/posts/:id", checkAuth, remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  update
);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
});
