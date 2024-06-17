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

  useEffect(() => {
    console.log("csv data = ", CSVData);
    if (CSVData && CSVData.data && CSVData.data.length > 0) {
      console.log("setting earliest arrival time", CSVData.data[1][1]);
      const [hours, minutes] = CSVData.data[1][1].split(":").map(Number);

      console.log("hours = ", hours, "minutes = ", minutes);
      // Create a Date object for the epoch start date (January 1, 1970)
      const epochStart = new Date(1970, 0, 1, hours, minutes);

      // Calculate the epoch time in seconds
      const epochTime = Math.floor(epochStart.getTime() / 60000);
      console.log("epoch time = ", epochStart);
      setEarliestArrivalTime(epochTime);
    }
  }, [CSVData]);

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
          trainHeap[parentIndex].arrival > currentValue.arrival))
    ) {
      swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
      parentIndex = parent(currentIndex);
    }
  };

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
          trainHeap[leftChildIndex].arrival < currentValue.arrival))
    ) {
      minIndex = leftChildIndex;
    }

    if (
      rightChildIndex < trainHeap.length &&
      (trainHeap[rightChildIndex].priority < trainHeap[minIndex].priority ||
        (trainHeap[rightChildIndex].priority === trainHeap[minIndex].priority &&
          trainHeap[rightChildIndex].arrival < trainHeap[minIndex].arrival))
    ) {
      minIndex = rightChildIndex;
    }

    if (minIndex !== currentIndex) {
      swap(currentIndex, minIndex);
      bubbleDown(minIndex);
    }
  };

  const insertValue = (value) => {
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

  // Main scheduling function
  function scheduleTrains(platforms, trainsData) {
    // const [scheduledTrains, setScheduledTrains] = useState([]);
    let scheduledTrains = [];
    // let [waitingTrains,setWaitingTrains] = new MinHeap();
    // const [waitingTrains, setWaitingTrains] = useState([]);
    let waitingTrainsLocal = [];
    // const [availablePlatforms, setAvailablePlatforms] = useState(
    //   Array(0).fill(null)
    // );

    let availablePlatformsLocal = Array(0).fill(null);
    let platformArrLocal = Array.from({ length: platformNumber }, (e, i) => i);

    // const [platformArr, setPlatformArr] = useState(
    //   Array.from({ length: platforms }, (e, i) => i)
    // );

    // Convert train data to Train instances
    let trains = trainsData.map((train) => new Train(...train));

    // Iterate over each minute of the day

    // for (let time = 0; time < 1439; time++) {
    // Free up platforms if departure time has passed
    // availablePlatforms = availablePlatforms.filter(
    //   (train) => train === null || train.departure > time
    // );
    let time = 0;
    setInterval(() => {
      while (time <= 1439) {
        let newAvailablePlatforms = Array(0);

        for (let i = 0; i < availablePlatformsLocal.length; i++) {
          if (
            availablePlatformsLocal[i] === null ||
            availablePlatformsLocal[i].departure > time
          ) {
            newAvailablePlatforms.push(availablePlatformsLocal[i]);
          } else {
            platformArrLocal.push(availablePlatformsLocal[i].platform - 1);
          }
        }
        availablePlatformsLocal = newAvailablePlatforms;

        // // Schedule waiting trains if platforms are available
        // while (
        //   waitingTrains.size() > 0 &&
        //   newAvailablePlatforms.length < platforms
        // ) {
        //   const nextTrain = waitingTrains.extractMin();
        //   nextTrain.waitingTime += time - nextTrain.arrival;
        //   nextTrain.platform = platformArr.shift() + 1; // Assign platform number
        //   availablePlatformsLocal.push(nextTrain);
        //   scheduledTrains.push(nextTrain);
        // }

        // Schedule waiting trains if platforms are available
        while (size() > 0 && availablePlatformsLocal.length < platforms) {
          const nextTrain = extractMin();
          nextTrain.waitingTime += time - nextTrain.arrival;
          nextTrain.platform = platformArrLocal.shift() + 1; // Assign platform number
          availablePlatformsLocal.push(nextTrain);
          scheduledTrains.push(nextTrain);
        }

        // Schedule arriving trains or add them to the waiting list
        while (trains.length > 0 && trains[0].arrival - 1 <= time) {
          const arrivingTrain = trains.shift();
          insertValue(arrivingTrain);
        }
        // }
        // setTrainsArrivedAtPlatform({...sc})
      }
    }, 5000);

    // return scheduledTrains.map((train) => ({
    //   number: train.number,
    //   arrival: train.arrival,
    //   departure: train.departure,
    //   priority: train.priority,
    //   waitingTime: train.waitingTime,
    //   platform: train.platform, // Include platform in the result
    // }));
  }

  const startSimulation = () => {
    CSVData.data.sort((a, b) => {
      // Convert time strings to date objects
      const timeA = new Date(`1970/01/01 ${a[1]}`);
      const timeB = new Date(`1970/01/01 ${b[1]}`);

      // Compare the date objects
      return timeA - timeB;
    });

    setCSVData({ ...CSVData });

    // const sortedArray = [...CSVData.data].sort((a, b) => {
    //   const timeA = new Date(`1970/01/01 ${a[1]}:00`);
    //   const timeB = new Date(`1970/01/01 ${b[1]}:00`);
    //   return timeA - timeB;
    // });
    // console.log("sorted array = ", sortedArray);

    // setCSVData(sortedArray);

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

    console.log("update simulation called");
    let currentDate = new Date();
    let currentHour;
    let currentMinutes;
    if (currentDate.getHours() < 10) {
      currentHour = "0" + currentDate.getHours();
    } else {
      currentHour = currentDate.getHours();
    }

    if (currentDate.getMinutes() < 10) {
      currentMinutes = "0" + currentDate.getMinutes();
    } else {
      currentMinutes = currentDate.getMinutes();
    }

    let currentTime = currentHour + ":" + currentMinutes;

    let scheduledTrains = [];
    let waitingTrainsLocal = [];
    let availablePlatformsLocal = Array(0).fill(null);
    let platformArrLocal = Array.from({ length: maxPlatforms }, (e, i) => i);

    let trains = trainsData.map((train) => new Train(...train));
    let time = 0;
    setInterval(() => {
      while (time <= 1439) {
        let newAvailablePlatforms = Array(0);
        for (let i = 0; i < availablePlatformsLocal.length; i++) {
          if (
            availablePlatformsLocal[i] === null ||
            availablePlatformsLocal[i].departure > time
          ) {
            newAvailablePlatforms.push(availablePlatformsLocal[i]);
          } else {
            platformArrLocal.push(availablePlatformsLocal[i].platform - 1);
          }
        }
        availablePlatformsLocal = newAvailablePlatforms;
        while (size() > 0 && availablePlatformsLocal.length < maxPlatforms) {
          const nextTrain = extractMin();
          nextTrain.waitingTime += time - nextTrain.arrival;
          nextTrain.platform = platformArrLocal.shift() + 1; // Assign platform number
          availablePlatformsLocal.push(nextTrain);
          scheduledTrains.push(nextTrain);
        }

        // Schedule arriving trains or add them to the waiting list
        while (trains.length > 0 && trains[0].arrival - 1 <= time) {
          const arrivingTrain = trains.shift();
          insertValue(arrivingTrain);
        }
      }
    }, 5000);

    setTrainsArrivedAtPlatform({ ...scheduledTrains });

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
    // let CSVDataLocal = dataOutput.data.sort((a, b) => {
    //   if (a[1] != "Arrival Time" && b[1] != "Arrival Time") {
    //     // Convert time strings to date objects
    //     const timeA = new Date(`1970/01/01 ${a[1]}:00`);
    //     const timeB = new Date(`1970/01/01 ${b[1]}:00`);

    //     // Compare the date objects
    //     return timeA - timeB;
    //   }
    // });

    // setCSVData(CSVDataLocal);
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
