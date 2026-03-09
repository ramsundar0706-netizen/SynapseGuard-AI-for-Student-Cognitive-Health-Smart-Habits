const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SynapseGuard Backend Running");
});

app.post("/analyze-health", (req, res) => {
  const data = req.body;

  const result = {
    efficiency: "68%",
    burnoutRisk: "High",
    sleepRecovery: "Increase sleep by 2 hours",
    concentrationTip: "Use Pomodoro technique"
  };

  res.json(result);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});