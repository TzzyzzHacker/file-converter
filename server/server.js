const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.get("/", (req, res) => {
  res.send("API running");
});

app.post("/convert-image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const inputPath = req.file.path;
    const type = (req.query.type || "").toLowerCase();

    const outputPath = `uploads/out-${Date.now()}.${type}`;

    const imageFormats = ["jpg","jpeg","png","webp","avif","tiff","gif"];
    const mediaFormats = ["mp3","wav","ogg","aac","mp4","webm","avi","mov"];

    // ---------------- IMAGE ----------------
    if (imageFormats.includes(type)) {
      let img = sharp(inputPath);

      if (type === "jpg" || type === "jpeg") img = img.jpeg();
      else if (type === "png") img = img.png();
      else if (type === "webp") img = img.webp();
      else if (type === "avif") img = img.avif();
      else if (type === "tiff") img = img.tiff();
      else if (type === "gif") img = img.gif();

      await img.toFile(outputPath);
    }

    // ---------------- AUDIO / VIDEO ----------------
    else if (mediaFormats.includes(type)) {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setFfmpegPath(ffmpegPath)
          .output(outputPath)
          .on("start", (cmd) => console.log("FFMPEG:", cmd))
          .on("end", resolve)
          .on("error", (err) => {
            console.log("FFMPEG ERROR:", err.message);
            reject(err);
          })
          .run();
      });
    }

    // ---------------- INVALID ----------------
    else {
      return res.status(400).send("unsupported format");
    }

    res.download(outputPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).send("conversion failed");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("backend running on " + PORT);
});