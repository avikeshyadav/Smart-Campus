const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require("./routes/routes.js");
const {generalLimiter} = require("./middleware/rateLimiter.js");
const app = express();
const rbacController = require("./controllers/rbacController.js");
const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";
app.set('trust proxy', 1);
app.use("/api",generalLimiter);
const allowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  "http://127.0.0.1:5173",
  "https://127.0.0.1:5173",
  "https://192.168.2.111:5173",
  "https://10.174.32.232:5173",
  "https://10.224.98.232:5173",
  "https://10.174.32.232:5173",
  "https://10.26.168.232:5173",
  "https://192.168.2.109:5173",
  "https://172.16.186.126:5173"
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
app.use(express.json({ limit: '2mb' })); // body size limit - DoS se bachne ke liye
app.use(cookieParser());

//==============================Routes ============
app.use("/api", routes);

app.listen(port, host, () => {
  console.log(`Auth server running on http://${host}:${port}`);
});
