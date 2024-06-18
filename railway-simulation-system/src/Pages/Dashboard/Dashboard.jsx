import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import { motion } from "framer-motion";
import UploadCSV from "../../components/UploadCSV/UploadCSV";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import RailwaysLogo from "../../assets/railway.jpg";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import Input from "@mui/material/Input";

import "./dashboard.css";

function Dashboard() {
  const [showSimulation, setShowSimulation] = useState("none");
  const [trainsArrivedAtPlatform, setTrainsArrivedAtPlatform] = useState({});
  const [CSVData, setCSVData] = useState({});
  const [scheduledTrains, setScheduledTrains] = useState([]);
  const [trainNumberToUpdateDelay, setTrainNumberToUpdateDelay] = useState();
  const [trainsYetToArrive, setTrainsYetToArrive] = useState([]);
  const [earliestArrivalTime, setEarliestArrivalTime] = useState("");
  const [stationName, setStationName] = useState("");
  const [delayTimeToUpdate, setDelayTimeToUpdate] = useState();
  const [showUpdateDelayModal, setShowUpdateDelayModal] = useState(false);
  const [maxPlatforms, setMaxPlatforms] = useState(0);
  const handleUpdateDelayModalClose = () => setShowUpdateDelayModal(false);
  const handleUpdateDelayModalShow = () => setShowUpdateDelayModal(true);
  const handleTrainNumberToUpdateDelay = (e) => {
    setTrainNumberToUpdateDelay(e.target.value);
  };

  const handleDelayTimeToUpdate = (e) => {
    setDelayTimeToUpdate(e.target.value);
  };

  const handleStationName = (e) => {
    setStationName(e.target.value);
  };

  const handlePlatformInput = (e) => {
    setMaxPlatforms(e.target.value);
  };

  // const ref = useRef(3);

  const boxStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#37474f",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const Line = ({ platformNumber, y }) => (
    <>
      {trainsArrivedAtPlatform["P" + platformNumber] != "" ? (
        <motion.div
          style={{
            width: "500px",
            height: "20px",
            backgroundColor: "black",
            position: "relative",
            // top: `${y}px`,
            marginBottom: "20px",
            display: `${showSimulation}`,
          }}
          key={platformNumber}
          className="train-rectangle"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Train {trainsArrivedAtPlatform["P" + platformNumber]}
        </motion.div>
      ) : (
        <div style={{ marginBottom: "20px", display: `${showSimulation}` }}>
          No Train
        </div>
      )}
      <motion.div
        style={{
          width: "600px",
          height: "2px",
          backgroundColor: "black",
          position: "relative",
          // top: `${y}px`,
          display: `${showSimulation}`,
        }}
      ></motion.div>
      <div style={{ display: `${showSimulation}`, marginBottom: "20px" }}>
        Platform {platformNumber}
      </div>
    </>
  );

  // useEffect(() => {
  //   console.log("csv data = ", CSVData);
  //   if (CSVData && CSVData.data && CSVData.data.length > 0) {
  //     console.log("setting earliest arrival time", CSVData.data[1][1]);
  //     const [hours, minutes] = CSVData.data[1][1].split(":").map(Number);

  //     console.log("hours = ", hours, "minutes = ", minutes);
  //     // Create a Date object for the epoch start date (January 1, 1970)
  //     const epochStart = new Date(1970, 0, 1, hours, minutes);

  //     // Calculate the epoch time in seconds
  //     const epochTime = Math.floor(epochStart.getTime() / 60000);
  //     console.log("epoch time = ", epochStart);
  //     setEarliestArrivalTime(epochTime);
  //   }
  // }, [CSVData]);

  const getMinute = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const epochStart = new Date(1970, 0, 1, hours, minutes);
    const epochTime = Math.floor(epochStart.getTime() / 60000);
    return epochTime;
  };

  class Train {
    constructor(number, arrival, departure, priority) {
      this.number = number;
      this.arrival = arrival;
      this.departure = departure;
      this.priority = priority;
      this.waitingTime = 0; // Time spent waiting for a platform
      this.platform = null; // Platform where the train stopped
    }
  }

  useEffect(() => {
    console.log("earliest arrival time = ", earliestArrivalTime);
  }, [earliestArrivalTime]);

  var trainHeap = [];
  const swap = (i, j) => {
    [trainHeap[i], trainHeap[j]] = [trainHeap[j], trainHeap[i]];
  };

  const parent = (i) => {
    return Math.floor((i - 1) / 2);
  };

  const leftChild = (i) => {
    return 2 * i + 1;
  };

  const rightChild = (i) => {
    return 2 * i + 2;
  };

  const bubbleUp = (index) => {
    let currentIndex = index;
    const currentValue = trainHeap[currentIndex];
    let parentIndex = parent(currentIndex);

    while (
      currentIndex > 0 &&
      (trainHeap[parentIndex].priority > currentValue.priority ||
        (trainHeap[parentIndex].priority === currentValue.priority &&
          getMinute(trainHeap[parentIndex].arrival) >
            getMinute(currentValue.arrival)))
    ) {
      swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
      parentIndex = parent(currentIndex);
    }
  };

  //   while (
  //     currentIndex > 0 &&
  //     (trainHeap[parentIndex][3] > currentValue[3] ||
  //       (trainHeap[parentIndex][3] === currentValue[3] &&
  //         getMinute(trainHeap[parentIndex][1]) > getMinute(currentValue[1])))
  //   ) {
  //     swap(currentIndex, parentIndex);
  //     currentIndex = parentIndex;
  //     parentIndex = parent(currentIndex);
  //   }
  // };

  const bubbleDown = (index) => {
    let currentIndex = index;
    const currentValue = trainHeap[currentIndex];
    let leftChildIndex = leftChild(currentIndex);
    let rightChildIndex = rightChild(currentIndex);
    let minIndex = currentIndex;

    if (
      leftChildIndex < trainHeap.length &&
      (trainHeap[leftChildIndex].priority < currentValue.priority ||
        (trainHeap[leftChildIndex].priority === currentValue.priority &&
          getMinute(trainHeap[leftChildIndex].arrival) <
            getMinute(currentValue.arrival)))
    ) {
      minIndex = leftChildIndex;
    }

    // if (
    //   leftChildIndex < trainHeap.length &&
    //   (trainHeap[leftChildIndex][3] < currentValue[3] ||
    //     (trainHeap[leftChildIndex][3] === currentValue[3] &&
    //       getMinute(trainHeap[leftChildIndex][1]) < getMinute(currentValue[1])))
    // ) {
    //   minIndex = leftChildIndex;
    // }

    if (
      rightChildIndex < trainHeap.length &&
      (trainHeap[rightChildIndex].priority < trainHeap[minIndex].priority ||
        (trainHeap[rightChildIndex].priority === trainHeap[minIndex].priority &&
          getMinute(trainHeap[rightChildIndex].arrival) <
            getMinute(trainHeap[minIndex].arrival)))
    ) {
      minIndex = rightChildIndex;
    }

    // if (
    //   rightChildIndex < trainHeap.length &&
    //   (trainHeap[rightChildIndex][3] < trainHeap[minIndex][3] ||
    //     (trainHeap[rightChildIndex][3] === trainHeap[minIndex][3] &&
    //       getMinute(trainHeap[rightChildIndex][1]) <
    //         getMinute(trainHeap[minIndex][1])))
    // ) {
    //   minIndex = rightChildIndex;
    // }

    if (minIndex !== currentIndex) {
      swap(currentIndex, minIndex);
      bubbleDown(minIndex);
    }
  };

  const insert = (value) => {
    trainHeap.push(value);
    bubbleUp(trainHeap.length - 1);
  };

  const extractMin = () => {
    if (trainHeap.length === 0) return null;
    if (trainHeap.length === 1) return trainHeap.pop();

    const minValue = trainHeap[0];
    trainHeap[0] = trainHeap.pop();
    bubbleDown(0);

    return minValue;
  };

  const peek = () => {
    return trainHeap[0];
  };

  const size = () => {
    return trainHeap.length;
  };

  const startSimulation = () => {
    CSVData.data.sort((a, b) => {
      // Convert time strings to date objects
      const timeA = new Date(`1970/01/01 ${a[1]}`);
      const timeB = new Date(`1970/01/01 ${b[1]}`);

      // Compare the date objects
      return timeA - timeB;
    });

    setCSVData({ ...CSVData });

    setShowSimulation("block");
    let obj = {};
    for (let platform = 2; platform <= maxPlatforms; platform++) {
      obj[`P${platform}`] = "";
    }
    setTrainsArrivedAtPlatform(obj);
    updateSimulation();
  };

  useEffect(() => {
    console.log("earliest arrival time = ", earliestArrivalTime);
  }, [earliestArrivalTime]);

  const updateSimulation = () => {
    let trainsArrivedAtPlatformLocal = {};
    for (let platform = 2; platform <= maxPlatforms; platform++) {
      trainsArrivedAtPlatformLocal[`P${platform}`] = "";
    }

    let scheduledTrains = [];
    let availablePlatforms = Array(0).fill(null);
    let platformArr = Array.from({ length: maxPlatforms }, (e, i) => i);
    console.log("platform ARR = ", platformArr);
    let trains = CSVData.data.map((train) => new Train(...train));
    console.log("trains = ", trains);
    let time = 0;
    let interval = setInterval(() => {
      time += 10;
      let newAvailablePlatforms = Array(0);
      for (let i = 0; i < availablePlatforms.length; i++) {
        if (
          availablePlatforms[i] === null ||
          availablePlatforms[i].departure > time
        ) {
          newAvailablePlatforms.push(availablePlatforms[i]);
        } else {
          platformArr.push(availablePlatforms[i].platform - 1);
        }
      }
      availablePlatforms = newAvailablePlatforms;
      while (size() > 0 && availablePlatforms.length < maxPlatforms) {
        const nextTrain = extractMin();
        // nextTrain.waitingTime += time - nextTrain.arrival;
        nextTrain.platform = platformArr.shift() + 1; // Assign platform number
        availablePlatforms.push(nextTrain);
        scheduledTrains.push(nextTrain);
      }
      console.log("scheduled train = ", scheduledTrains);

      // Schedule arriving trains or add them to the waiting list
      while (trains.length > 0 && getMinute(trains[0].arrival) - 1 <= time) {
        const arrivingTrain = trains.shift();
        insert(arrivingTrain);
      }
      scheduledTrains.forEach((train) => {
        for (const platform in trainsArrivedAtPlatformLocal) {
          if (
            trainsArrivedAtPlatformLocal[platform].length < 1 &&
            platform == `P${platform}`
          ) {
            trainsArrivedAtPlatformLocal = {
              ...trainsArrivedAtPlatformLocal,
              [platform]: train.number,
            };
            break;
          }
        }
      });

      setTrainsArrivedAtPlatform(trainsArrivedAtPlatformLocal);
      if (time > 1440) {
        clearInterval(interval);
      }
    }, 5000);
    console.log("scheduled trains = ", scheduledTrains);

    // setTrainsArrivedAtPlatform({ ...scheduledTrains });

    // if (CSVData.data != null && CSVData.data.length > 0) {
    //   CSVData.data.forEach((data, index) => {
    //     if (index != 0) {
    //       if (data[1] <= currentTime && currentTime < data[2]) {
    //         for (const platform in trainsArrivedAtPlatformLocal) {
    //           if (trainsArrivedAtPlatformLocal[platform].length < 1) {
    //             trainsArrivedAtPlatformLocal = {
    //               ...trainsArrivedAtPlatformLocal,
    //               [platform]: data[0],
    //             };
    //             break;
    //           }
    //         }
    //       }
    //     }
    //   });
    //   setTrainsArrivedAtPlatform(trainsArrivedAtPlatformLocal);
    // }
  };

  useEffect(() => {
    console.log("scheduled train");
  }, [scheduledTrains]);

  useEffect(() => {
    console.log("trains arrived at platform = ", trainsArrivedAtPlatform);
  }, [trainsArrivedAtPlatform]);

  const stopSimulation = () => {
    setShowSimulation("none");
  };

  const updateTrainDelayTime = () => {
    let newCSVData = CSVData;
    newCSVData.data.map((value, index) => {
      if (value[0] == trainNumberToUpdateDelay) {
        newCSVData.data[index][2] = delayTimeToUpdate;
        setCSVData(newCSVData);
      }
    });
    handleUpdateDelayModalClose();
  };

  const handleCSVData = (dataOutput) => {
    dataOutput.data.splice(0, 1);
    setCSVData(dataOutput);
  };

  const lines = Array.from({ length: maxPlatforms - 1 }, (_, i) => i * 50);

  return (
    <>
      <Modal open={showUpdateDelayModal} onClose={handleUpdateDelayModalClose}>
        <Box sx={boxStyle}>
          <Typography
            variant="h6"
            component="h2"
            id="modal-title"
            sx={{ marginBottom: "30px" }}
          >
            Update Arrival Delay Time Train Number
          </Typography>
          <FormControl>
            <InputLabel htmlFor="train-number" sx={{ color: "white" }}>
              Enter Train Number
            </InputLabel>
            <Input
              type="number"
              id="train-number"
              placeholder="e.g. 221133"
              name="trainNumberToUpdateDelay"
              value={trainNumberToUpdateDelay}
              onChange={handleTrainNumberToUpdateDelay}
              required
              sx={{ marginRight: "20px", color: "white" }}
            />
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="arrival-time" sx={{ color: "white" }}>
              Enter updated departure time
            </InputLabel>

            <Input
              type="text"
              id="arrival-time"
              placeholder="10:00"
              name="delayTimeToUpdate"
              value={delayTimeToUpdate}
              onChange={handleDelayTimeToUpdate}
              required
              sx={{ color: "white" }}
            />
          </FormControl>

          <Button
            sx={{ marginTop: "80px" }}
            variant="contained"
            onClick={updateTrainDelayTime}
            color="success"
          >
            Save Changes
          </Button>
          <Button
            variant="contained"
            sx={{ marginTop: "80px", marginLeft: "10px" }}
            onClick={handleUpdateDelayModalClose}
            color="success"
          >
            Close
          </Button>
        </Box>
      </Modal>
      <div id="bg"></div>
      <header>
        <div id="title_card" className="card">
          <div>
            <img id="photo" src={RailwaysLogo} />
          </div>

          <h1 id="title">Railway Simulation System</h1>
          <span id="description"></span>
        </div>
      </header>
      <main>
        <div id="simulation_card" className="card">
          <section className="tab">
            <div className="title">Upload Train Schedule</div>
            <div className="content">
              <section className="element">
                <UploadCSV sendCSVDataToParent={handleCSVData} />
              </section>

              <div className="title" style={{ marginTop: "20px" }}>
                Enter Station Name
              </div>

              <TextField
                className="title"
                id="standard-basic"
                variant="standard"
                onChange={handleStationName}
                sx={{ input: { color: "white" } }}
              />

              <div className="title" style={{ marginTop: "20px" }}>
                Enter number of platforms between 2 and 20
              </div>

              <TextField
                className="title"
                id="standard-basic"
                variant="standard"
                type="number"
                onChange={handlePlatformInput}
                sx={{ input: { color: "white" } }}
              />
            </div>
          </section>
        </div>

        <div id="options_card" className="card">
          <section className="tab">
            <div className="title">Options</div>

            <div className="content">
              <Button
                variant="contained"
                color="success"
                onClick={startSimulation}
              >
                Start / Update Simulation
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={stopSimulation}
              >
                Stop Simulation
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpdateDelayModalShow}
              >
                Update Delay
              </Button>
            </div>
          </section>
        </div>

        <div id="simulation_card" className="card simulation-card">
          <section className="tab">
            {/* <div className="title">Simulation of {stationName}</div> */}
            <div className="title">Simulation</div>
            <div className="content">
              <section className="element">
                <div
                  style={{
                    position: "relative",
                    // height: "200px",
                    marginTop: "50px",
                    marginLeft: "50px",
                  }}
                >
                  {lines.map((y, index) => {
                    return (
                      <>
                        <Line platformNumber={index + 2} key={index} y={y} />
                      </>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
