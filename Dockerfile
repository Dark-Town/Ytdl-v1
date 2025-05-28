FROM node:18

# Install yt-dlp
RUN apt update && apt install -y wget ffmpeg python3-pip
RUN pip3 install yt-dlp

# App setup
WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "server.js"]
