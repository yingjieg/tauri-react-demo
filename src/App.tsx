import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import {
  readDir,
  writeFile,
  readTextFile,
  FileEntry,
  removeFile,
} from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";

// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";

import "./App.css";

dayjs.extend(utc);
dayjs.extend(timezone);

const DATE_FORMAT = "MM-DD HH:mm";

function App() {
  const timeRef = useRef<null | number>(null);

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(+new Date());
  const [currentFile, setCurrentFile] = useState<null | string>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [inputStr, setInputStr] = useState<string>("");

  useEffect(() => {
    if (timeRef.current === null) {
      timeRef.current = setTimeout(() => {
        setCurrentDate(+new Date());
      }, 1000);
    }

    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
      timeRef.current = null;
    };
  }, [currentDate]);

  const listFiles = async () => {
    const appDataDirPath = await appDataDir();
    const results = await readDir(appDataDirPath);
    setFiles(results);
  };

  useEffect(() => {
    listFiles();
  }, []);

  const handleFileCreate = async () => {
    const appDataDirPath = await appDataDir();
    console.log(appDataDirPath);

    const filepath = await join(appDataDirPath, `${+new Date()}.txt`);
    await writeFile(filepath, inputStr);
    console.log("write file to " + filepath);

    setInputStr("");
    listFiles();
  };

  const handleFileWrite = async (filepath: string, content: string) => {
    await writeFile(filepath, content);
  };

  const handleFileRead = async (filepath: string) => {
    const content = await readTextFile(filepath);
    setInputStr(content);
  };

  const handleFileDel = async (filepath: string) => {
    await removeFile(filepath);
    setInputStr("");
    setCurrentFile(null);
    listFiles();
  };

  return (
    <>
      <div className="time-container">
        <div className="time-box">
          <label>Los Angeles</label>
          <span>
            {dayjs(currentDate).tz("America/Los_Angeles").format(DATE_FORMAT)}
          </span>
        </div>
        <div className="time-box">
          <label>Shanghai</label>
          <span>{dayjs(currentDate).format(DATE_FORMAT)}</span>
        </div>
        <div className="time-box">
          <label>India</label>
          <span>
            {dayjs(currentDate).tz("Asia/Kolkata").format(DATE_FORMAT)}
          </span>
        </div>
      </div>
      <div className="card">
        <ul
          style={{ listStyle: "none", paddingLeft: 8 }}
          className="file-container"
        >
          {files.map((f, idx) => (
            <li
              key={f.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
                paddingLeft: 8,
                paddingRight: 8,
                background: f.path === currentFile ? "#999" : "",
              }}
              onClick={() => {
                handleFileRead(f.path);
                setCurrentFile(f.path);
              }}
            >
              {/* <span style={{ marginRight: 24 }}>{idx + 1}.</span> */}
              <span>{f.name}</span>
              <a
                style={{ marginLeft: 24, color: "red", cursor: "pointer" }}
                onClick={() => {
                  handleFileDel(f.path);
                }}
              >
                del
              </a>
            </li>
          ))}
        </ul>
        <div>
          <textarea
            className="inputarea"
            rows={10}
            value={inputStr}
            style={{ width: "100%" }}
            onChange={(e) => setInputStr(e.target.value)}
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     handleFileCreate();
            //   }
            // }}
          />

          {currentFile ? (
            <>
              <button
                onClick={() => {
                  handleFileWrite(currentFile, inputStr);
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setInputStr("");
                  setCurrentFile(null);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleFileCreate}
              disabled={inputStr.trim().length === 0}
            >
              Create File
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
