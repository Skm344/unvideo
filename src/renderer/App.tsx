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
import { AudioCheck } from './AudioChecks';

function Home() {
  return (
    <div className="homepage">
      <img src={UNLogo} alt="UN Logo" className="logo" />{' '}
      {/* Display UN Logo */}
      <h1>FFMPEG Tool</h1>
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
      <footer>
        © 2024 Saleem Mohamed - All Rights Reserved {/* Copyright Footer */}
      </footer>
    </div>
  );
}

function ReplaceAudio() {
  const [videoFilePath, setVideoFilePath] = useState('');
  const [audioFilePath, setAudioFilePath] = useState('');
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

  function handleSubmit() {
    if (!videoFilePath || !audioFilePath) {
      alert(
        'Please upload video and audio files and select an output location.',
      );
      return;
    }

    window.electron.mapLanguageVideo(videoFilePath, audioFilePath);
  }

  return (
    <div className="form-layout">
      <h2>Replace Audio</h2>
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
          accept=".mp3,.wav,.mp4"
          onChange={handleAudioUpload}
        />
      </label>
      <div>{audioFilePath}</div>
      <button onClick={handleSubmit}>Convert</button>
      <br />
      <br />
      <button onClick={() => navigate('/')}>Back to Home</button>{' '}
    </div>
  );
}

function AddLanguageAudio() {
  const [videoFilePath, setVideoFilePath] = useState('');
  const [audioFilePaths, setAudioFilePaths] = useState({
    English: '',
    France: '',
    Russian: '',
    Spanish: '',
    Chinese: '',
    Arabic: '',
  });
  const navigate = useNavigate(); // Hook to navigate back

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const path = e.target.files[0].path;
      setVideoFilePath(path);
    }
  }

  function handleAudioUpload(
    language: keyof typeof audioFilePaths,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (e.target.files && e.target.files.length > 0) {
      const path = e.target.files[0].path;
      setAudioFilePaths((prev) => ({ ...prev, [language]: path }));
    }
  }

  function handleSubmit() {
    if (!videoFilePath) {
      alert('Please upload the original video file.');
      return;
    }

    window.electron.mapMultipleAudio(videoFilePath, audioFilePaths);
  }

  return (
    <div className="form-layout">
      <h2></h2>
      <div className="flex">
        <label className="file-button">
          Upload Original Video
          <input
            className="file-input"
            type="file"
            accept=".mp4,.avi"
            onChange={handleVideoUpload}
          />
        </label>
        <div>
          <AudioCheck path={videoFilePath} />
        </div>
      </div>
      <h3>Upload Language Audio Files</h3>
      {Object.keys(audioFilePaths).map((lang) => (
        <div key={lang} className="InputBox">
          <label className="file-button">
            Upload {lang} Audio
            <input
              className="file-input"
              type="file"
              accept=".mp3,.wav,.mp4"
              onChange={(e) =>
                handleAudioUpload(lang as keyof typeof audioFilePaths, e)
              }
            />
          </label>
          <AudioCheck
            path={audioFilePaths[lang as keyof typeof audioFilePaths]}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Convert</button>
      <br />
      <br />
      <button onClick={() => navigate('/')}>Back to Home</button>{' '}
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
