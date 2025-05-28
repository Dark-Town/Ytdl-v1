const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Convert shorts URLs to standard watch URLs
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

app.get('/', (req, res) => {
  res.send('✅ YouTube Downloader API is live.');
});

app.get('/download', async (req, res) => {
  let videoURL = req.query.url;

  if (!videoURL) {
    return res.status(400).json({ error: 'No url provided' });
  }

  videoURL = convertShortsURL(videoURL);

  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, '') || 'video';

    const format = ytdl.chooseFormat(info.formats, f =>
      f.container === 'mp4' && f.hasAudio && f.hasVideo
    );

    if (!format) {
      return res.status(404).json({ error: 'No suitable video format found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="\${title}.mp4"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    if (format.contentLength) {
      res.setHeader('Content-Length', format.contentLength);
    }

    const stream = ytdl.downloadFromInfo(info, { format });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).end('Error streaming video');
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download video' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port \${PORT}`);
});
