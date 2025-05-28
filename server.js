const { exec } = require('child_process');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/download', (req, res) => {
  const videoURL = req.query.url;
  if (!videoURL) {
    return res.status(400).send('No URL provided');
  }

  const command = `yt-dlp -f best -o - "${videoURL}"`;

  const process = exec(command, { maxBuffer: Infinity });

  res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
  res.setHeader('Content-Type', 'video/mp4');

  process.stdout.pipe(res);

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  process.on('close', (code) => {
    console.log(`yt-dlp process exited with code ${code}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
