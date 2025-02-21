import React, { useState, useEffect, useRef } from 'react';
//import './CineSync.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const videoRef = useRef(null);
  const [isLeader, setIsLeader] = useState(true); // Assume the current user is the leader
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Track current video time

  // Simulate real-time synchronized playback
  const handlePlayPause = () => {
    if (isLeader) {
      setIsPlaying(!isPlaying);
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      console.log(`Leader ${isPlaying ? 'paused' : 'played'} the video`);
    }
  };

  // Handle seeking (rewind/fast-forward)
  const handleSeek = (time) => {
    if (isLeader) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      console.log(`Leader seeked to ${time} seconds`);
    }
  };

  // Sync late joiners to the current timestamp
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime; // Sync to the current time
    }
  }, [currentTime]);

  // Update current time as the video plays
  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Handle sending messages
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: 'User',
        text: inputMessage,
        timestamp: new Date().toLocaleTimeString(),
        isVisible: true,
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
    }
  };

  // Handle unsending messages
  const handleUnsendMessage = (id) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === id ? { ...msg, isVisible: false } : msg
      )
    );
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newMediaFile = {
        id: mediaFiles.length + 1,
        user: 'User',
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image') ? 'image' : 'video',
      };
      setMediaFiles([...mediaFiles, newMediaFile]);
    }
  };

  return (
    <div className="cine-sync-container">
      {/* Video Player */}
      <div className="video-container">
        <video
          ref={videoRef}
          className="cine-sync-video"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          controls={isLeader}
          autoPlay={isPlaying}
        />
        <div className="video-controls">
          <button onClick={handlePlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => handleSeek(currentTime - 10)}>Rewind 10s</button>
          <button onClick={() => handleSeek(currentTime + 10)}>Forward 10s</button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <h3>Chat</h3>
        <ul className="messages">
          {messages.map(
            (msg) =>
              msg.isVisible && (
                <li key={msg.id} className="message">
                  <span className="message-user">{msg.user}:</span>
                  <span>{msg.text}</span>
                  <span className="timestamp">{msg.timestamp}</span>
                  <button
                    className="unsend-button"
                    onClick={() => handleUnsendMessage(msg.id)}
                  >
                    Unsend
                  </button>
                </li>
              )
          )}
        </ul>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="media-gallery">
        <h3>Media Gallery</h3>
        <div className="gallery">
          {mediaFiles.map((file) => (
            <div key={file.id} className="media-item">
              {file.type === 'image' ? (
                <img src={file.url} alt={`Media by ${file.user}`} />
              ) : (
                <video controls src={file.url} />
              )}
              <div className="media-user">{file.user}</div>
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            accept="image/*, video/*"
          />
          <label htmlFor="file-upload" className="file-upload-button">
            Upload Media
          </label>
        </div>
      </div>
    </div>
  );
};

export default App;
