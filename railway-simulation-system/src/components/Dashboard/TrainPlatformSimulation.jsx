// src/components/TrainPlatformAnimation.js

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./TrainPlatformAnimation.css"; // Create this CSS file

const TrainPlatformAnimation = () => {
  const [trains, setTrains] = useState([]);

  // Simulate train arrivals and departures (you can replace this with actual data)
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random train arrival and departure times
      const randomArrival = Math.floor(Math.random() * 1000);
      const randomDeparture = randomArrival + Math.floor(Math.random() * 200);

      // Update the trains state
      setTrains((prevTrains) => [
        ...prevTrains,
        { arrival: randomArrival, departure: randomDeparture },
      ]);
    }, 2000); // Adjust the interval as needed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="train-platform-container">
      {trains.map((train, index) => (
        <motion.div
          key={index}
          className="train-rectangle"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: train.arrival / 1000 }}
        >
          Train {index + 1}
        </motion.div>
      ))}
      <div className="platform-line" />
    </div>
  );
};

export default TrainPlatformAnimation;
