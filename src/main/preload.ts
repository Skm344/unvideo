// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
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

function getOutputPath(inputPath: string): string {
  const outputDirectory = path.dirname(inputPath);
  const fileName = path.basename(inputPath);
  // Change the output extension to .mp4 for video
  return path.join(
    outputDirectory,
    'output-' + fileName.replace(/\.[^/.]+$/, '.mp4'),
  );
}

function setFfmpegPath(): void {
  const ffmpegPathItem = localStorage.getItem(FFMPEG_PATH_KEY);

  if (!ffmpegPathItem) {
    console.warn('FFmpeg path not set in local storage.');
    return;
  }

  try {
    const ffmpegPath = JSON.parse(ffmpegPathItem);
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    } else {
      console.warn('FFmpeg path is empty or invalid.');
    }
  } catch (error) {
    console.error('Error parsing FFmpeg path from local storage:', error);
  }
}

const electronHandler = {
  combinePhotoAndAudio(imageFilePath: string, audioFilePath: string): void {
    console.log('Image File:', imageFilePath);
    console.log('Audio File:', audioFilePath);

    // Check if files exist
    const fs = require('fs');
    if (!fs.existsSync(imageFilePath)) {
      console.error('Image file not found:', imageFilePath);
      return;
    }
    if (!fs.existsSync(audioFilePath)) {
      console.error('Audio file not found:', audioFilePath);
      return;
    }

    setFfmpegPath();
    const outputFilePath = getOutputPath(imageFilePath);
    console.log('Output File:', outputFilePath);

    ffmpeg()
      .input(imageFilePath)
      .inputOption('-loop 1')
      .input(audioFilePath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('192k')
      .outputOption('-shortest')
      .outputOption('-loglevel', 'verbose') // Enable detailed logging
      .on('start', (cmd) => console.log('FFmpeg command:', cmd))
      .on('progress', (progress) =>
        console.log('Processing progress:', progress),
      )
      .on('end', () => {
        console.log('Conversion completed successfully!');
        alert('Conversion completed successfully!'); // Alert for successful conversion
      })
      .on('error', (err) => console.error('An error occurred:', err.message))
      .save(outputFilePath);
  },

  addMetadata(videoFilePath: string): void {
    setFfmpegPath();
    const outputFilePath = getOutputPath(videoFilePath);

    ffmpeg(videoFilePath)
      .outputOptions([
        '-map 0',
        '-map -0:a:7',
        '-c copy',
        '-metadata:s:a:0 language=ina',
        '-metadata:s:a:1 language=eng',
        '-metadata:s:a:2 language=fra',
        '-metadata:s:a:3 language=rus',
        '-metadata:s:a:4 language=spa',
        '-metadata:s:a:5 language=zho',
        '-metadata:s:a:6 language=ara',
      ])
      .save(outputFilePath)
      .on('end', () => alert('Metadata added successfully!'))
      .on('error', (err) => alert('An error occurred: ' + err.message));
  },

  mapMultipleAudio(videoFilePath: string, audioList: MapAudioList): void {
    setFfmpegPath();
    const outputFilePath = getOutputPath(videoFilePath);
    const command = ffmpeg()
      .input(videoFilePath)
      .audioCodec('copy')
      .videoCodec('copy');

    const mapOptions: string[] = [];
    const metadataOptions: string[] = [];
    let currentAudioIndex = 1;

    mapOptions.push('-map 0:v', '-map 0:a');
    metadataOptions.push('-metadata:s:a:0 language=ina');

    Object.entries(audioList).forEach(([lang, path]) => {
      if (path) {
        command.input(path);
        mapOptions.push(`-map ${currentAudioIndex}:a`);
        const languageCode = lang.toLowerCase();
        metadataOptions.push(
          `-metadata:s:a:${currentAudioIndex} language=${languageCode}`,
        );
        currentAudioIndex++;
      }
    });

    command
      .outputOptions([...mapOptions, ...metadataOptions])
      .save(outputFilePath)
      .on('end', () => alert('Processing finished successfully'))
      .on('error', (err) => alert('An error occurred: ' + err.message));
  },

  mapLanguageVideo(videoFilePath: string, audioFilePath: string): void {
    setFfmpegPath();
    const outputFilePath = getOutputPath(videoFilePath);

    ffmpeg()
      .input(videoFilePath)
      .input(audioFilePath)
      .audioCodec('copy')
      .videoCodec('copy')
      .outputOptions('-map', '0:v:0', '-map', '1:a:0')
      .save(outputFilePath)
      .on('end', () => alert('Language video mapped successfully!'))
      .on('error', (err) => {
        console.error('Error during mapping:', err);
        alert(
          'An error occurred during the mapping process. Please try again.',
        );
      });
  },

  importVideoWithLanguages(
    videoFilePath: string,
    audioFilePaths: { [key: string]: string },
  ): void {
    setFfmpegPath();
    const outputFilePath = getOutputPath(videoFilePath);
    const ffmpegCommand = ffmpeg(videoFilePath);

    Object.entries(audioFilePaths).forEach(([lang, audioPath]) => {
      ffmpegCommand.input(audioPath);
    });

    const mappingOptions: string[] = ['-map', '0:v', '-map', '0:a'];
    const metadataOptions: string[] = [];

    Object.keys(audioFilePaths).forEach((lang, index) => {
      mappingOptions.push('-map', `${index + 1}:a`);
      metadataOptions.push(
        `-metadata:s:a:${index} language=${lang.toLowerCase()}`,
      );
    });

    ffmpegCommand
      .outputOptions(mappingOptions)
      .outputOptions(metadataOptions)
      .output(outputFilePath)
      .on('end', () =>
        alert('Importing with languages completed successfully!'),
      )
      .on('error', (err) => {
        console.error('Error during import:', err);
        alert('An error occurred during import. Please try again.');
      })
      .run();
  },

  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]): void {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void): () => void {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void): void {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
