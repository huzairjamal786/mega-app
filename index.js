import bodyParser from "body-parser";
import express from "express";
import ejs from "ejs";
import { Storage } from "megajs";
import accounts from "./accounts.js";

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

for await (const acc of accounts) {
  let storage = new Storage({
    email: acc.email,
    password: acc.password,
    userAgent: "ExampleClient/1.0",
  });
  await storage.ready;
  let info = await storage.getAccountInfo();
  acc.freeSpace = (20 - info.spaceUsed * 9.31 * 10 ** -10).toFixed(2) + " GB";
  acc.files = [];
  acc.fileSize = [];
  acc.fileLinks = [];
  storage.root.children.forEach(function (child) {
    child.link((error, link) => {
      if (error) console.error(error);
      acc.fileLinks.push(link);
      acc.files.push(child.name);
      acc.fileSize.push(child.size);
    });
  });
}

app.get("/", (req, res) => {
  res.render("main", { accounts: accounts });
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
  console.log("http://localhost:3000");
});
