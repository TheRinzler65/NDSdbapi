const express = require("express");
const router = express.Router();

function formatUptime(uptimeInSeconds) {
  uptimeInSeconds = Math.floor(uptimeInSeconds);

  const years = Math.floor(uptimeInSeconds / (365 * 24 * 3600));
  uptimeInSeconds %= 365 * 24 * 3600;
  const months = Math.floor(uptimeInSeconds / (30 * 24 * 3600));
  uptimeInSeconds %= 30 * 24 * 3600;
  const days = Math.floor(uptimeInSeconds / (24 * 3600));
  uptimeInSeconds %= 24 * 3600;
  const hours = Math.floor(uptimeInSeconds / 3600);
  uptimeInSeconds %= 3600;
  const minutes = Math.floor(uptimeInSeconds / 60);
  const seconds = uptimeInSeconds % 60;

  let uptimeMessage = "Server uptime is";
  if (years) uptimeMessage += ` ${years} years,`;
  if (months) uptimeMessage += ` ${months} months,`;
  if (days) uptimeMessage += ` ${days} days,`;
  if (hours) uptimeMessage += ` ${hours} hours,`;
  if (minutes) uptimeMessage += ` ${minutes} minutes,`;
  uptimeMessage += ` and ${seconds} seconds.`;

  return uptimeMessage;
}

router.get("/uptime", (req, res) => {
  const uptimeInSeconds = process.uptime();

  res.json({
    uptime_string: formatUptime(uptimeInSeconds),
    uptime_seconds: uptimeInSeconds,
  });
});

module.exports = router;
