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
    let title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, '') || 'video';
    title = title.trim().replace(/\s+/g, '_');

    const format = ytdl.chooseFormat(info.formats, f =>
      f.container === 'mp4' && f.hasAudio && f.hasVideo
    );

    if (!format) {
      return res.status(404).json({ error: 'No suitable video format found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Cache-Control', 'no-cache');

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
