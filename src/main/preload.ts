// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  ipcMain,
  dialog,
} from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import ffmpegstatic from 'ffmpeg-static';

export type Channels = 'ipc-example';

type MapAudioList = {
  EN: string;
  FR: string;
  RU: string;
  SP: string;
  ZH: string;
  AR: string;
};

const electronHandler = {
  mapMultipleAudio: (videoFilePath: string, audioList: MapAudioList) => {
    const outputDirectory = path.dirname(videoFilePath);
    const fileName = path.basename(videoFilePath);
    const outputFilePath = path.join(outputDirectory, 'output-' + fileName);
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

    if (!!audioList.EN) {
      command.input(audioList.EN); // Add English audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map English audio to the correct index
      metadataOptions.push('-metadata:s:a:1 language=eng');
      currentAudioIndex++; // Increment index for the next audio track
    }

    if (!!audioList.FR) {
      command.input(audioList.FR); // Add French audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map French audio
      metadataOptions.push('-metadata:s:a:2 language=fra');
      currentAudioIndex++;
    }

    if (!!audioList.RU) {
      command.input(audioList.RU); // Add Russian audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map Russian audio
      metadataOptions.push('-metadata:s:a:3 language=rus');
      currentAudioIndex++;
    }

    if (!!audioList.SP) {
      command.input(audioList.SP); // Add Spanish audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map Spanish audio
      metadataOptions.push('-metadata:s:a:4 language=spa');
      currentAudioIndex++;
    }

    if (!!audioList.ZH) {
      command.input(audioList.ZH); // Add Chinese audio if it exists
      mapOptions.push(`-map ${currentAudioIndex}:a`); // Map Chinese audio
      metadataOptions.push('-metadata:s:a:5 language=zho');
      currentAudioIndex++;
    }

    if (!!audioList.AR) {
      command.input(audioList.AR); // Add Arabic audio if it exists
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
        console.log('Processing finished successfully');
      })
      .on('error', (err) => {
        console.error('An error occurred: ' + err.message);
      });
  },
  mapLanguageVideo: (videoFilePath: string, audioFilePath: string) => {
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

  trimVideo: (filePath: string, outputFileName: string, ffmpegPath: string) => {
    const outputDirectory = path.dirname(filePath);
    const outputFilePath = path.join(outputDirectory, outputFileName);
    // ffmpeg -ss 00:00:00 -to 00:06:28 -i input.mp4 -c copy output.mp4
    try {
      alert('ffmpeg filepath ' + ffmpegPath);
      ffmpeg.setFfmpegPath(ffmpegPath);

      ffmpeg(filePath)
        .setStartTime('00:00:00')
        .setDuration('00:06:28')
        .output(outputFilePath)
        .videoCodec('copy')
        .audioCodec('copy')
        .on('end', () => {
          console.log('Processing finished successfully');
          alert('yyoooo');
        })
        .on('error', (err) => {
          console.error('Error: ' + err.message);
          alert('error ' + err.message);
        })
        .run();
    } catch (e: any) {
      alert(JSON.stringify(e));
    }
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
