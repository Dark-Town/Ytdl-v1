// server.js
const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('YouTube Downloader API is running');
});

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || 'highest';

  if (!videoURL || !ytdl.validateURL(videoURL)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

    ytdl(videoURL, {
      quality: quality,
      filter: format => format.container === 'mp4'
    }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to download video');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
