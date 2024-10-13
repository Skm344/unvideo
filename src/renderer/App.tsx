import {
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import UNLogo from './UN_logo.png'; // Import the UN logo
import './App.css';
import { useState } from 'react';

function Home() {
  return (
    <div className="homepage">
      <img src={UNLogo} alt="UN Logo" className="logo" />{' '}
      {/* Display UN Logo */}
      <h1>UN Web TV Tool</h1>
      <div className="buttons">
        <Link to="/replace-audio">
          <button>Replace Audio File</button>{' '}
          {/* Button for Replace Audio Page */}
        </Link>
        <Link to="/add-language">
          <button>Add Language Audio</button>{' '}
          {/* Button for Add Language Audio Page */}
        </Link>
      </div>
    </div>
  );
}

function ReplaceAudio() {
  const [videoFilePath, setVideoFilePath] = useState('');
  const [audioFilePath, setAudioFilePath] = useState('');
  const [outputFilePath, setOutputFilePath] = useState('');
  const navigate = useNavigate(); // Hook to navigate back

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const path = e.target.files[0].path;
      setVideoFilePath(path);
    }
  }

  function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const path = e.target.files[0].path;
      setAudioFilePath(path);
    }
  }

  function handleOutputFileSelect() {
    const outputPath = dialog.showSaveDialogSync({
      title: 'Save Converted File',
      defaultPath: 'newaudio.mp4',
      filters: [{ name: 'Videos', extensions: ['mp4'] }],
    });

    if (outputPath) {
      setOutputFilePath(outputPath);
    }
  }

  function handleSubmit() {
    if (!videoFilePath || !audioFilePath || !outputFilePath) {
      alert(
        'Please upload video and audio files and select an output location.',
      );
      return;
    }

    window.electron.mapLanguageVideo(
      videoFilePath,
      audioFilePath,
      outputFilePath,
    );
  }

  return (
    <div className="form-layout">
      <button onClick={() => navigate('/')}>Back to Home</button>{' '}
      {/* Back Button */}
      <h2>Replace Audio in Video</h2>
      <label className="file-button">
        Upload Video File
        <input
          className="file-input"
          type="file"
          accept=".mp4"
          onChange={handleVideoUpload}
        />
      </label>
      <div>{videoFilePath}</div>
      <label className="file-button">
        Upload Audio File
        <input
          className="file-input"
          type="file"
          accept=".mp3,.wav"
          onChange={handleAudioUpload}
        />
      </label>
      <div>{audioFilePath}</div>
      <button onClick={handleOutputFileSelect}>Select Output File</button>
      <div>{outputFilePath}</div>
      <button onClick={handleSubmit}>Convert</button>
    </div>
  );
}

function AddLanguageAudio() {
  const navigate = useNavigate(); // Hook to navigate back

  return (
    <div className="form-layout">
      <button onClick={() => navigate('/')}>Back to Home</button>{' '}
      {/* Back Button */}
      <h2>Add Language Audio Tracks</h2>
      {/* Additional input fields for language tracks can go here */}
      {/* You can add more functionality for language track handling */}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home Route */}
        <Route path="/replace-audio" element={<ReplaceAudio />} />{' '}
        {/* Replace Audio Route */}
        <Route path="/add-language" element={<AddLanguageAudio />} />{' '}
        {/* Add Language Route */}
      </Routes>
    </Router>
  );
}
