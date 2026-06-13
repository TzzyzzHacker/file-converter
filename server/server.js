const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("API running");
});

app.post("/convert-image", upload.single("file"), async (req, res) => {
  try {
    const file = req.file.path;
    const type = req.query.type || "jpg";

    const outputPath = `uploads/out-${Date.now()}.${type}`;

    let image = sharp(file);

    if (type === "jpg" || type === "jpeg") {
      await image.jpeg().toFile(outputPath);
    } else if (type === "png") {
      await image.png().toFile(outputPath);
    } else if (type === "webp") {
      await image.webp().toFile(outputPath);
    } else {
      return res.status(400).send("unsupported format");
    }

    res.download(outputPath, () => {
      fs.unlinkSync(file);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.listen(3001, () => {
  console.log("backend running on 3001");
});