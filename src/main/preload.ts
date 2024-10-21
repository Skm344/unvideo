// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export type Channels = 'ipc-example';

type MapAudioList = {
  English: string;
  French: string;
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

const electronHandler = {
  mapMultipleAudio: (videoFilePath: string, audioList: MapAudioList) => {
    const outputFilePath = getOutputPath(videoFilePath);
    const command = ffmpeg()
      .input(videoFilePath) // Video input
      .audioCodec('copy')
      .videoCodec('copy');

    // Array to keep track of mappings and metadata options
    const mapOptions = [];
    const metadataOptions = [];

    // Map the video stream from the first input
    mapOptions.push('-map 0:v'); // Map the video stream from the first input
    mapOptions.push('-map 0:a'); // Map the original audio stream (index 0)
    metadataOptions.push('-metadata:s:a:0 language=ina'); // Set metadata for the original audio track

    // Function to map audio file if it exists, setting metadata for the correct language code
    const fs = require('fs');
    console.log('Audio list:', audioList);

    const addAudioMapping = (audioFilePath, languageCode, index) => {
      if (audioFilePath) {
        // Log the file path being checked
        console.log('Checking audio file:', audioFilePath);

        if (fs.existsSync(audioFilePath)) {
          command.input(audioFilePath); // Add audio input if it exists
          mapOptions.push(`-map ${index}:a`); // Map the audio track to the specified index
          metadataOptions.push(
            `-metadata:s:a:${index} language=${languageCode}`,
          ); // Set language metadata
          console.log(`Added ${languageCode} audio track at index ${index}`);
        } else {
          console.error(`Audio file not found: ${audioFilePath}`);
        }
      }
    };
    // Start counting the audio inputs from index 1 (for languages)
    let audioInputIndex = 1; // Starts from 1 because 0 is reserved for video

    // Check each audio file and map accordingly
    if (audioList.English) {
      addAudioMapping(audioList.English, 'eng', audioInputIndex++);
    }
    if (audioList.French) {
      addAudioMapping(audioList.French, 'fra', audioInputIndex++);
    }
    if (audioList.Russian) {
      addAudioMapping(audioList.Russian, 'rus', audioInputIndex++);
    }
    if (audioList.Spanish) {
      addAudioMapping(audioList.Spanish, 'spa', audioInputIndex++);
    }
    if (audioList.Chinese) {
      addAudioMapping(audioList.Chinese, 'zho', audioInputIndex++);
    }
    if (audioList.Arabic) {
      addAudioMapping(audioList.Arabic, 'ara', audioInputIndex++);
    }
    // Check if we have added any additional audio tracks
    if (audioInputIndex === 1) {
      alert('Please provide at least one audio track.');
      return; // Exit if no audio files are provided
    }
    console.log('Number of audio inputs added:', audioInputIndex);
    if (audioInputIndex === 1) {
      alert('Please provide at least one audio track.');
      return; // Exit if no audio files are provided
    }

    // Add the map and metadata options to the ffmpeg command
    command.outputOptions([...mapOptions, ...metadataOptions]);

    // Save the output file
    command
      .save(outputFilePath)
      .on('end', () => {
        alert('Processing finished successfully!');
      })
      .on('error', (err) => {
        alert('An error occurred: ' + err.message);
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

  trimVideo: (filePath: string, outputFileName: string) => {
    const outputDirectory = path.dirname(filePath);
    const outputFilePath = path.join(outputDirectory, outputFileName);
    // ffmpeg -ss 00:00:00 -to 00:06:28 -i input.mp4 -c copy output.mp4
    try {
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
