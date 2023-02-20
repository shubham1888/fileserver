const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const UPLOADS_FOLDER = "./uploads";

if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}

const app = express();
// Set up CORS middleware
app.use(cors());

// Set up Multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // specify the directory where the file will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // use the original filename for the uploaded file
  },
});
const upload = multer({ storage });


// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  res.send("File uploaded successfully");
});

// Serve the list of files as JSON
app.get("/files", (req, res) => {
  const directoryPath = "uploads/";
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    const fileList = files.map((file) => ({
      filename: file,
      size: fs.statSync(path.join(directoryPath, file)).size,
    }));
    res.json({ files: fileList });
  });
});

// Serve the uploaded files for download
app.get("/download/:filename", (req, res) => {
  const filepath = path.join(__dirname, "uploads", req.params.filename);
  res.download(filepath, req.params.filename, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
