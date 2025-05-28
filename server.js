const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

function convertShortsURL(url) {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/shorts/')) {
      const videoId = u.pathname.split('/')[2];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
  } catch {
    return url;
  }
}

app.get('/download', async (req, res) => {
  let videoURL = req.query.url;

  if (!videoURL) {
    return res.status(400).json({ error: 'No url provided' });
  }

  videoURL = convertShortsURL(videoURL);

  try {
    const ytDlp = spawn('yt-dlp', [
      '-f', 'best[ext=mp4]/best',
      '-o', '-', // output to stdout
      videoURL,
    ]);

    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    ytDlp.stdout.pipe(res);

    ytDlp.stderr.on('data', data => {
      console.error(`yt-dlp error: ${data}`);
    });

    ytDlp.on('close', code => {
      if (code !== 0) {
        console.error(`yt-dlp process exited with code ${code}`);
        if (!res.headersSent) {
          res.status(500).end('Failed to download video');
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
