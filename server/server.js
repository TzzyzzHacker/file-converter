const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

const app = express();

ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors({ origin: "*" }));

const upload = multer({ dest: "/tmp" });

app.get("/", (req, res) => {
  res.send("API running");
});

/* ---------------- IMAGE ---------------- */
app.post("/convert-image", upload.single("file"), async (req, res) => {
  try {
    const input = req.file.path;
    const type = (req.query.type || "jpg").toLowerCase();
    const output = `/tmp/out-${Date.now()}.${type}`;

    const img = sharp(input);

    if (type === "jpg" || type === "jpeg") await img.jpeg().toFile(output);
    else if (type === "png") await img.png().toFile(output);
    else if (type === "webp") await img.webp().toFile(output);
    else return res.status(400).send("unsupported");

    res.download(output, () => {
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("error");
  }
});

/* ---------------- AUDIO/VIDEO ---------------- */
app.post("/convert-media", upload.single("file"), async (req, res) => {
  try {
    const input = req.file.path;
    const type = (req.query.type || "mp3").toLowerCase();
    const output = `/tmp/out-${Date.now()}.${type}`;

    ffmpeg(input)
      .toFormat(type)
      .on("end", () => {
        res.download(output, () => {
          fs.unlinkSync(input);
          fs.unlinkSync(output);
        });
      })
      .on("error", (err) => {
        console.log(err);
        res.status(500).send("conversion error");
      })
      .save(output);

  } catch (e) {
    console.log(e);
    res.status(500).send("error");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("backend running on", PORT);
});