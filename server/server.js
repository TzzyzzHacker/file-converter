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

// Render-safe upload
const upload = multer({ dest: "/tmp" });

// health check
app.get("/", (req, res) => {
  res.send("API running");
});

// main converter
app.post("/convert-image", upload.single("file"), async (req, res) => {
  try {
    const file = req.file.path;
    const type = req.query.type;

    const outputPath = `/tmp/out-${Date.now()}.${type}`;

    // -----------------------
    // IMAGE (8 formats)
    // -----------------------
    if (["jpg", "jpeg", "png", "webp", "avif", "tiff", "gif", "bmp"].includes(type)) {
      const img = sharp(file);

      if (type === "jpg" || type === "jpeg") await img.jpeg().toFile(outputPath);
      else if (type === "png") await img.png().toFile(outputPath);
      else if (type === "webp") await img.webp().toFile(outputPath);
      else if (type === "avif") await img.avif().toFile(outputPath);
      else if (type === "tiff") await img.tiff().toFile(outputPath);
      else if (type === "gif") await img.gif().toFile(outputPath);
      else if (type === "bmp") await img.png().toFile(outputPath);
    }

    // -----------------------
    // AUDIO (4 formats)
    // -----------------------
    else if (["mp3", "wav", "ogg", "aac"].includes(type)) {
      await new Promise((resolve, reject) => {
        ffmpeg(file)
          .toFormat(type)
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });
    }

    // -----------------------
    // VIDEO (4 formats)
    // -----------------------
    else if (["mp4", "webm", "avi", "mov"].includes(type)) {
      await new Promise((resolve, reject) => {
        ffmpeg(file)
          .toFormat(type)
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });
    }

    else {
      return res.status(400).send("unsupported format");
    }

    // download result
    res.download(outputPath, () => {
      fs.unlinkSync(file);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

// port (Render safe)
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("backend running on " + PORT);
});