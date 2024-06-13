import React, { useState, useEffect } from "react";
import "./dashboardNew.css";

const DashboardNew = () => {
  const [platforms, setPlatforms] = useState(Array(10).fill(null)); // Initialize with 10 platforms
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTrains();
    }, 1000);
    return () => clearInterval(interval);
  }, [trains]);

  const updateTrains = () => {
    const currentTime = new Date().getTime();
    const updatedTrains = trains.map((train) => {
      if (train.departureTime <= currentTime) {
        return { ...train, status: "departed" };
      }
      return train;
    });
    setTrains(updatedTrains);
    allocatePlatforms(updatedTrains);
  };

  const allocatePlatforms = (updatedTrains) => {
    const newPlatforms = platforms.map((platform, index) => {
      const train = updatedTrains.find(
        (train) => train.platform === index + 1 && train.status !== "departed"
      );
      return train || null;
    });
    setPlatforms(newPlatforms);
  };

  const addTrain = (train) => {
    setTrains([...trains, train]);
  };

  return (
    <div className="App">
      <h1>Railway Station Dashboard</h1>
      <div className="platforms">
        {platforms.map((train, index) => (
          <div key={index} className="platform">
            <h2>Platform {index + 1}</h2>
            {train ? (
              <div className="train">
                <p>Train: {train.name}</p>
                <p>Status: {train.status}</p>
              </div>
            ) : (
              <p>No train</p>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          addTrain({
            name: "Train A",
            platform: 1,
            departureTime: new Date().getTime() + 5000,
            status: "arriving",
          })
        }
      >
        Add Train A
      </button>
    </div>
  );
};

export default DashboardNew;
