import { Link } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

export const FFMPEG_PATH_KEY = 'ffmpeg_path';
export default function Settings() {
  const [value, setValue] = useLocalStorage(
    FFMPEG_PATH_KEY,
    '/usr/local/bin/ffmpeg',
  );

  return (
    <div>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />

      <br />
      <br />
      <div>
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
    </div>
  );
}
