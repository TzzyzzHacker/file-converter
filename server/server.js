const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

const app = express();

app.use(cors({ origin: "*" }));

const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.get("/", (req, res) => {
  res.send("API running");
});

app.post("/convert-image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file");

    const input = req.file.path;
    const type = (req.query.type || "jpg").toLowerCase();
    const output = `uploads/out-${Date.now()}.${type}`;

    const img = sharp(input);

    if (type === "jpg" || type === "jpeg") await img.jpeg().toFile(output);
    else if (type === "png") await img.png().toFile(output);
    else if (type === "webp") await img.webp().toFile(output);
    else return res.status(400).send("unsupported");

    res.download(output, () => {
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("fail");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("backend running on", PORT);
});