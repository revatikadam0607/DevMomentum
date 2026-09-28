/* =====================================================
   DevMomentum REST API — Entry Point (src/server.js)
   ===================================================== */
"use strict";

require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`DevMomentum API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
