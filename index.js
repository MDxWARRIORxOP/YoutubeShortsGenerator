import { mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { nanoid } from "nanoid";
import fetch from "node-fetch";
import Editly from "editly";
import config from "./config.json" assert { type: "json" };
import { fileURLToPath } from "url";
import gTTS from "gtts";
import { upload, comment } from "youtube-videos-uploader";

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async function () {
  console.log("starting video protocol.");
  const videos = await readdirSync(join(__dirname, "./bg-vids")).filter((v) =>
    v.endsWith("mp4")
  );
  const rand = await random(1, videos.length);
  const randVid = videos[rand];

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": config.JOKES_API_KEY,
      "X-RapidAPI-Host": config.JOKES_API_HOST,
      Accept: "application/json",
    },
  };
  console.log("video protocol successful. Starting jokes protocol");

  const { body: dadJokes } = await fetch(
    "https://dad-jokes.p.rapidapi.com/random/joke?count=5",
    options
  ).then((res) => res.json());

  console.log("jokes protocol successful. starting voice protocol.");

  const vidId = nanoid();
  const path = join(__dirname, "vids", vidId);
  mkdirSync(path);

  for (let i = 0; i < dadJokes.length; i++) {
    const gtts = new gTTS(
      dadJokes[i].setup + "  " + dadJokes[i].punchline,
      "en-uk"
    );

    gtts.save(join(path, `voice-${i}.mp3`), (err, result) => {
      if (err) console.error(err);
      if (result) console.log(result);
    });
  }

  /**
   * @type {Editly.Config}
   */
  const editlySpec = {
    outPath: join(path, "video.mp4"),
    width: 1080,
    height: 1920,
    // fast: true, // - for quick previewing
    defaults: {
      duration: 60,
      layer: {
        fontPath: join(__dirname, "fonts/inter.ttf"),
      },
    },
    clips: [
      {
        duration: 60,
        layers: [
          {
            type: "video",
            path: join(__dirname, "bg-vids", randVid),
          },
          {
            type: "title",
            fontPath: join(__dirname, "fonts/Inter-ExtraBold.ttf"),
            text: "DAD JOKES",
          },
          {
            type: "subtitle",
            text: dadJokes[0].setup + "\n" + dadJokes[0].punchline,
            start: 0,
            stop: 9,
          },
          {
            type: "subtitle",
            text: dadJokes[1].setup + "\n" + dadJokes[1].punchline,
            start: 10,
            stop: 19,
          },
          {
            type: "subtitle",
            text: dadJokes[2].setup + "\n" + dadJokes[2].punchline,
            start: 20,
            stop: 29,
          },
          {
            type: "subtitle",
            text: dadJokes[3].setup + "\n" + dadJokes[3].punchline,
            start: 30,
            stop: 39,
          },
          {
            type: "subtitle",
            text: dadJokes[4].setup + "\n" + dadJokes[4].punchline,
            start: 40,
            stop: 49,
          },
        ],
      },
    ],
    audioTracks: [
      {
        path: join(__dirname, "vids", vidId, "voice-0.mp3"),
        start: 0,
      },
      {
        path: join(__dirname, "vids", vidId, "voice-1.mp3"),
        start: 10,
      },
      {
        path: join(__dirname, "vids", vidId, "voice-2.mp3"),
        start: 20,
      },
      {
        path: join(__dirname, "vids", vidId, "voice-3.mp3"),
        start: 30,
      },
      {
        path: join(__dirname, "vids", vidId, "voice-4.mp3"),
        start: 40,
      },
    ],
  };

  console.log("Voice protocol successful. Starting editly protocol.");

  await Editly(editlySpec);

  const video = {
    path: join(path, "video.mp4"),
    title: "Hilarious Dad Jokes #shorts #bot #generator",
    description:
      "Hilarious Dad Jokes made by a bot.\nfetched from https://dadjokes.io \nvisit https://github.com/MDxWARRIORxOP/YoutubeShortsGenerator for the source code.",
    language: "en-uk",
    tags: [
      "github",
      "english",
      "dadjokes",
      "jokes",
      "memes",
      "funny",
      "fun",
      "dad",
      "generator",
      "bot",
      "automatic",
    ],
    onSuccess: console.log,
    skipProcessingWait: false,
    onProgress: console.log,
    publishType: "unlisted",
  };

  console.log("editly protocol successful. Starting video upload protocol.");

  await upload(config.YOUTUBE_CREDENTIALS, [video]).then((link) => {
    console.log(`video upload protocol successful. Link: ${link}.`);

    const comment1 = {
      link,
      comment:
        "This video was made by a bot.\nLink: https://github.com/MDxWARRIORxOP/YoutubeShortsGenerator",
    };

    comment(config.YOUTUBE_CREDENTIALS, [comment1]).then(console.log);

    console.log("Shutting Down.");
  });
})();
