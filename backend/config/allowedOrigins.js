/** Shared between the Express CORS setup and the Socket.IO CORS setup. */
const allowedOrigins = [
  "https://campusyncweb.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://192.168.0.109:5173",
];

module.exports = allowedOrigins;
