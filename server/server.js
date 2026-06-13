const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const sharp = require("sharp");
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
    if (!req.file) return res.status(400).send("No file");

    const input = req.file.path;
    const type = (req.query.type || "").toLowerCase();
    const output = `uploads/out-${Date.now()}.${type}`;

    const image = ["jpg","jpeg","png","webp"];
    const media = ["mp3","wav","mp4","mov","avi","webm"];

    if (image.includes(type)) {
      await sharp(input).toFile(output);
    }

    else if (media.includes(type)) {
      await new Promise((resolve, reject) => {
        ffmpeg(input)
          .output(output)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });
    }

    else {
      return res.status(400).send("bad format");
    }

    res.download(output, () => {
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    });

  } catch (e) {
    console.log(e);
    res.status(500).send("fail");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("backend running on", PORT);
});