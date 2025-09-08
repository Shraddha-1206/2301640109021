require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const logRoute = require("./routes/logRoute");
const shortRoute = require("./routes/shortRoute");

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use(cors({ origin: ["http://localhost:3000"] }));

app.use("/api/log", logRoute);         
app.use("/shortUrls", shortRoute);     
app.get("/:shortcode", require("./controllers/redirectController").redirectToOriginal);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
