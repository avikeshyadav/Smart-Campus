const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const routes = require("./routes/routes.js");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";
const allowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  "http://127.0.0.1:5173",
  "https://127.0.0.1:5173",
  "http://192.168.2.103:5173",
  "https://192.168.2.103:5173"

];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("BLOCK:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


app.use(
  "/media",
  express.static(path.join(__dirname, "media"))
);
app.use(helmet()); // secure HTTP headers
app.use(express.json({ limit: '3mb' })); // body size limit - DoS se bachne ke liye
app.use(cookieParser());
app.set('trust proxy', 1);

//==============================Routes ============
app.use("/api", routes);
app.listen(port, host, () => {
  console.log(`Auth server running on http://${host}:${port}`);
});
