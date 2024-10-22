// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  ipcMain,
  dialog,
  app,
} from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import ffmpegstatic from 'ffmpeg-static';
import { FFMPEG_PATH_KEY } from '../renderer/Settings';

export type Channels = 'ipc-example';

type MapAudioList = {
  English: string;
  France: string;
  Russian: string;
  Spanish: string;
  Chinese: string;
  Arabic: string;
};

function getOutputPath(inputPath: string) {
  const outputDirectory = path.dirname(inputPath);
  const fileName = path.basename(inputPath);
  const outputFilePath = path.join(outputDirectory, 'output-' + fileName);
  return outputFilePath;
}

function setFfmpegPath() {
  const ffmpegPath = JSON.parse(localStorage.getItem(FFMPEG_PATH_KEY) || '');
  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }
}

const electronHandler = {
  addMetadata: (videoFilePath: string) => {
    setFfmpegPath();
    const outputFilePath = getOutputPath(videoFilePath);
    ffmpeg(videoFilePath)
      .outputOptions([
        '-map 0', // Map all streams from the input
        '-map -0:a:7', // Exclude the 7th audio track
        '-c copy', // Copy the codec without re-encoding
        '-metadata:s:a:0 language=ina', // Set language metadata for each track
        '-metadata:s:a:1 language=eng',
        '-metadata:s:a:2 language=fra',
        '-metadata:s:a:3 language=rus',
        '-metadata:s:a:4 language=spa',
        '-metadata:s:a:5 language=zho',
        '-metadata:s:a:6 language=ara',
      ])
      .save(outputFilePath)
      .on('end', () => {
        alert('Conversion completed successfully!');
      })
      .on('error', (err) => {
        alert('An error occurred: ' + err.message);
      });
  },
  mapMultipleAudio: (videoFilePath: string, audioList: MapAudioList) => {
    setFfmpegPath();

    const outputFilePath = getOutputPath(videoFilePath);
    const command = ffmpeg()
      .input(videoFilePath) // Video input
      .audioCodec('copy')
      .videoCodec('copy');

    // Array to keep track of mappings and metadata options
    const mapOptions = [];
    const metadataOptions = [];

    // Map video and audio files if they exist
    let currentAudioIndex = 1; // Start mapping audio streams at index 1
    mapOptions.push('-map 0:v'); // Map the video stream from the first input
    mapOptions.push('-map 0:a'); // Map the audio stream from the video file (index 0)
    metadataOptions.push('-metadata:s:a:0 language=ina'); // Metadata for the main audio

    if (!!audioList.English) {
      command.input(audioList.English); // Add English audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map English audio to the correct index
      metadataOptions.push('-metadata:s:a:1 language=eng');
      currentAudioIndex++; // Increment index for the next audio track
    }

    if (!!audioList.France) {
      command.input(audioList.France); // Add French audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map French audio
      metadataOptions.push('-metadata:s:a:2 language=fra');
      currentAudioIndex++;
    }

    if (!!audioList.Russian) {
      command.input(audioList.Russian); // Add Russian audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map Russian audio
      metadataOptions.push('-metadata:s:a:3 language=rus');
      currentAudioIndex++;
    }

    if (!!audioList.Spanish) {
      command.input(audioList.Spanish); // Add Spanish audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map Spanish audio
      metadataOptions.push('-metadata:s:a:4 language=spa');
      currentAudioIndex++;
    }

    if (!!audioList.Chinese) {
      command.input(audioList.Chinese); // Add Chinese audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map Chinese audio
      metadataOptions.push('-metadata:s:a:5 language=zho');
      currentAudioIndex++;
    }

    if (!!audioList.Arabic) {
      command.input(audioList.Arabic); // Add Arabic audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map Arabic audio
      metadataOptions.push('-metadata:s:a:6 language=ara');
      currentAudioIndex++;
    }

    // Add map and metadata options to the command
    command.outputOptions([...mapOptions, ...metadataOptions]);

    // Save the output file
    command
      .save(outputFilePath)
      .on('end', () => {
        alert('Processing finished successfully');
      })
      .on('error', (err) => {
        alert('An error occurred: ' + err.message);
      });
  },
  mapLanguageVideo: (videoFilePath: string, audioFilePath: string) => {
    setFfmpegPath();

    const outputDirectory = path.dirname(videoFilePath);
    const fileName = path.basename(videoFilePath);
    const outputFilePath = path.join(outputDirectory, 'output-' + fileName);
    ffmpeg()
      .input(videoFilePath)
      .input(audioFilePath)
      .audioCodec('copy')
      .videoCodec('copy')
      .outputOptions('-map', '0:v:0', '-map', '1:a:0')
      .save(outputFilePath)
      .on('end', () => {
        alert('Conversion completed successfully!');
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err);
        alert(
          'An error occurred during the conversion process. Please try again.',
        );
      });
  },
  importVideoWithLanguages: (
    videoFilePath: string,
    audioFilePaths: {
      [key: string]: string; // Key is language code, value is audio file path
    },
  ) => {
    setFfmpegPath();

    const outputDirectory = path.dirname(videoFilePath);
    const fileName = path.basename(videoFilePath, path.extname(videoFilePath));
    const outputFilePath = path.join(outputDirectory, `output-${fileName}.mp4`);

    // Create an ffmpeg command
    const ffmpegCommand = ffmpeg(videoFilePath);

    // Add the audio files based on the provided audioFilePaths
    Object.entries(audioFilePaths).forEach(([lang, audioPath]) => {
      ffmpegCommand.input(audioPath);
    });

    // Set mapping options for each language
    const mappingOptions = ['-map', '0:v', '-map', '0:a']; // Video and original audio
    let metadataOptions = [];

    Object.keys(audioFilePaths).forEach((lang, index) => {
      mappingOptions.push('-map', `${index + 1}:a`);
      const langCode = lang.toLowerCase();
      metadataOptions.push(`-metadata:s:a:${index} language=${langCode}`);
    });

    // Execute the ffmpeg command with mapping and metadata options
    ffmpegCommand
      .outputOptions(mappingOptions)
      .outputOptions(metadataOptions)
      .output(outputFilePath)
      .on('end', () => {
        alert('Processing completed successfully!');
      })
      .on('error', (err) => {
        console.error('Error during processing:', err);
        alert('An error occurred during processing. Please try again.');
      })
      .run();
  },

  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
