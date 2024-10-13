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

const electronHandler = {
  mapLanguageVideo: (
    videoFilePath: string,
    audioFilePath: string,
    outputFilePath: string,
  ) => {
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
