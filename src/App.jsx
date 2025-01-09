import React, { useState, useEffect } from 'react';

    function App() {
      const [currentDate, setCurrentDate] = useState(new Date());
      const [selectedDate, setSelectedDate] = useState(null);
      const [events, setEvents] = useState(() => {
        const storedEvents = localStorage.getItem('calendarEvents');
        return storedEvents ? JSON.parse(storedEvents) : {};
      });
      const [selectedHour, setSelectedHour] = useState(null);
      const [videoFile, setVideoFile] = useState(null);
      const [videoDuration, setVideoDuration] = useState(1);

      useEffect(() => {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
      }, [events]);

      const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      };

      const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      };

      const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      };

      const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      };

      const handleDayClick = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateKey = date.toISOString().split('T')[0];
        setSelectedDate(dateKey);
        setSelectedHour(null);
      };

      const handleHourClick = (hour) => {
        setSelectedHour(hour);
      };

      const handleFileChange = (event) => {
        setVideoFile(event.target.files[0]);
      };

      const handleSaveVideo = () => {
        if (videoFile && selectedDate && selectedHour !== null) {
          const videoUrl = URL.createObjectURL(videoFile);
          setEvents(prevEvents => {
            const updatedEvents = { ...prevEvents };
            const dateEvents = updatedEvents[selectedDate] || {};
            for (let i = 0; i < videoDuration; i++) {
              const hour = selectedHour + i;
              if (hour < 24) {
                if (!dateEvents[hour]) {
                  dateEvents[hour] = [];
                }
                dateEvents[hour] = [...dateEvents[hour], videoUrl];
              }
            }
            updatedEvents[selectedDate] = dateEvents;
            return updatedEvents;
          });
          setVideoFile(null);
        }
      };

      const days = [];
      const dateStart = firstDayOfMonth(currentDate);
      const numDays = daysInMonth(currentDate);

      for (let i = 0; i < dateStart; i++) {
        days.push(<div key={`empty-${i}`} className="day"></div>);
      }

      for (let i = 1; i <= numDays; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateKey = date.toISOString().split('T')[0];
        const hasVideos = Object.keys(events[dateKey] || {}).length > 0;
        days.push(
          <div
            key={i}
            className={`day ${hasVideos ? 'has-videos' : ''}`}
            onClick={() => handleDayClick(i)}
          >
            {i}
          </div>
        );
      }

      const timelineHours = [];
      for (let i = 0; i < 24; i++) {
        const hasVideo = selectedDate && Object.keys(events[selectedDate] || {}).some(hour =>
          events[selectedDate][hour].length > 0 && parseInt(hour) === i
        );
        const isVideoStart = selectedDate && events[selectedDate]?.[i]?.length > 0;

        timelineHours.push(
          <div
            key={i}
            className={`timeline-hour ${selectedHour === i ? 'selected' : ''} ${hasVideo ? 'has-video' : ''}`}
            onClick={() => handleHourClick(i)}
          >
            {i}:00
            {isVideoStart && <span className="video-start-indicator"></span>}
          </div>
        );
      }

      return (
        <div>
          <h2>
            <button onClick={prevMonth}>&lt;</button>
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            <button onClick={nextMonth}>&gt;</button>
          </h2>
          <div className="calendar-container">{days}</div>

          {selectedDate && (
            <div>
              <h3>{new Date(selectedDate).toLocaleDateString()}</h3>
              <div className="timeline-container">{timelineHours}</div>
              {selectedHour !== null && (
                <div>
                  <h4>Hour: {selectedHour}:00</h4>
                  <input type="file" accept="video/mp4" onChange={handleFileChange} />
                  <label>
                    Duration (hours):
                    <select value={videoDuration} onChange={(e) => setVideoDuration(parseInt(e.target.value))}>
                      {[...Array(24 - selectedHour)].map((_, index) => (
                        <option key={index + 1} value={index + 1}>{index + 1}</option>
                      ))}
                    </select>
                  </label>
                  <button onClick={handleSaveVideo} disabled={!videoFile}>Save</button>
                  <div className="video-container">
                    {(events[selectedDate]?.[selectedHour] || []).map((videoUrl, index) => (
                      <video key={index} src={videoUrl} controls width="200" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    export default App;
