import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { useState } from 'react';
import { dialog } from 'electron';
function Hello() {
  const [filePath, setFilePath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [ffmpegBinaryPath, setFfmpegPath] = useState('/usr/local/bin/ffmpeg');
  function handleSubmit() {
    window.electron.trimVideo(filePath, 'ouptut.mp4', ffmpegBinaryPath);
  }

  return (
    <div className="form-layout">
      <input
        type="text"
        value={ffmpegBinaryPath}
        onChange={(e) => {
          setFfmpegPath(e.target.value);
        }}
      />

      <label className="file-button">
        Choose the file
        <input
          className="file-input"
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files?.length > 0) {
              const path = e.target.files[0].path;
              setFilePath(path);
            }
          }}
        />
      </label>
      <div>{filePath}</div>

      {/* <input type="file" id="ctrl" webkitdirectory directory multiple /> */}

      <br />
      <br />

      <div>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
