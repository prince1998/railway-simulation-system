import React, { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { CSVLink } from "react-csv";

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
  const intervalRef = useRef();
  const [trainsArrivedAtPlatform, setTrainsArrivedAtPlatform] = useState({});
  const [CSVData, setCSVData] = useState({});
  const [disableStartSimulationBtn, setDisableStartSimulationBtn] =
    useState(false);
  const [scheduledTrains, setScheduledTrains] = useState([]);
  const [trainNumberToUpdateDelay, setTrainNumberToUpdateDelay] = useState();
  const [trainsYetToArrive, setTrainsYetToArrive] = useState([]);
  const [showExportButton, setShowExportButton] = useState(false);

  const [earliestArrivalTime, setEarliestArrivalTime] = useState("");
  const [exportTrainsData, setExportTrainsData] = useState([]);
  // const [stationName, setStationName] = useState("");
  const [currentSimulationTime, setCurrentSimulationTime] = useState("");
  const [delayTimeToUpdate, setDelayTimeToUpdate] = useState();
  const [trainsWaitingForPlatform, setTrainsWaitingForPlatform] = useState([]);
  const [showUpdateDelayModal, setShowUpdateDelayModal] = useState(false);
  const [maxPlatforms, setMaxPlatforms] = useState();

  const handleUpdateDelayModalClose = () => setShowUpdateDelayModal(false);
  const handleUpdateDelayModalShow = () => setShowUpdateDelayModal(true);
  const handleTrainNumberToUpdateDelay = (e) => {
    setTrainNumberToUpdateDelay(e.target.value);
  };

  const handleDelayTimeToUpdate = (e) => {
    setDelayTimeToUpdate(e.target.value);
  };

  // const handleStationName = (e) => {
  //   setStationName(e.target.value);
  // };

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

  const headers = [
    "Train Number",
    "Arrival Time",
    "Departure Time",
    "Priority",
  ];

  const Line = ({ platformNumber, y }) => (
    <>
      {trainsArrivedAtPlatform["P" + platformNumber] != null &&
      trainsArrivedAtPlatform["P" + platformNumber] !== "" ? (
        <motion.div
          style={{
            width: "500px",
            height: "20px",
            backgroundColor: "black",
            position: "relative",
            // top: `${y}px`,
            marginBottom: "20px",
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
        <div style={{ marginBottom: "20px" }}>No Train</div>
      )}
      <motion.div
        style={{
          width: "600px",
          height: "2px",
          backgroundColor: "black",
          position: "relative",
          // top: `${y}px`,
        }}
      ></motion.div>
      <div style={{ marginBottom: "20px" }}>Platform {platformNumber + 2}</div>
    </>
  );

  const getMinute = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const epochStart = new Date(1970, 0, 1, hours, minutes);
    return epochStart.getHours() * 60 + epochStart.getMinutes();
  };

  const getCurrentTimeFromMinutes = (totalMinutes) => {
    let newHours = Math.floor(totalMinutes / 60) % 24; // Use % 24 to handle overflow
    let newMinutes = totalMinutes % 60;

    // Pad single digit minutes with a leading zero
    let newHoursStr = newHours.toString().padStart(2, "0");
    let newMinutesStr = newMinutes.toString().padStart(2, "0");
    return `${newHoursStr}:${newMinutesStr}`;
  };

  class Train {
    constructor(number, arrival, departure, priority) {
      this.number = number;
      this.arrival = arrival;
      this.departure = departure;
      this.priority = priority[1];
      this.waitingTime = 0; // Time spent waiting for a platform

      this.platform = null; // Platform where the train stopped
    }
  }

  class ExportTrain {
    constructor(number, arrival, departure, priority, waitingTime) {
      this.number = number;
      this.priority = priority;
      this.scheduledArrival = arrival;
      this.actualArrival = getCurrentTimeFromMinutes(
        getMinute(arrival) + waitingTime
      );
      this.scheduledDeparture = getCurrentTimeFromMinutes(
        getMinute(departure) - waitingTime
      );
      this.actualDeparture = departure;
      this.delayInArrival = waitingTime;
      this.delayInDeparture = waitingTime;
    }
  }

  useEffect(() => {}, [earliestArrivalTime]);
  const timeDifference = 10; // Time difference of the simulation, time between each refresh.
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

  const bubbleDown = (index) => {
    let currentIndex = index;
    const currentValue = trainHeap[currentIndex];
    let leftChildIndex = leftChild(currentIndex);
    let rightChildIndex = rightChild(currentIndex);
    let minIndex = currentIndex;
    console.log("priority = ", trainHeap[leftChildIndex]);

    if (
      leftChildIndex < trainHeap.length &&
      (trainHeap[leftChildIndex].priority < currentValue.priority ||
        (trainHeap[leftChildIndex].priority === currentValue.priority &&
          getMinute(trainHeap[leftChildIndex].arrival) <
            getMinute(currentValue.arrival)))
    ) {
      minIndex = leftChildIndex;
    }

    if (
      rightChildIndex < trainHeap.length &&
      (trainHeap[rightChildIndex].priority < trainHeap[minIndex].priority ||
        (trainHeap[rightChildIndex].priority === trainHeap[minIndex].priority &&
          getMinute(trainHeap[rightChildIndex].arrival) <
            getMinute(trainHeap[minIndex].arrival)))
    ) {
      minIndex = rightChildIndex;
    }

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
    setDisableStartSimulationBtn(true);
    CSVData.data.sort((a, b) => {
      // Convert time strings to date objects
      const timeA = new Date(`1970/01/01 ${a[1]}`);
      const timeB = new Date(`1970/01/01 ${b[1]}`);

      // Compare the date objects
      return timeA - timeB;
    });

    setCSVData({ ...CSVData });
    CSVData.data.map((element, i) => {
      setTrainsYetToArrive((trainsYetToArrive) => [
        ...trainsYetToArrive,
        element[0],
      ]);
    });
    setCurrentSimulationTime(
      getCurrentTimeFromMinutes(getMinute(CSVData.data[0][1]) - timeDifference)
    );

    setShowSimulation("block");
    let obj = {};
    for (let platform = 0; platform < maxPlatforms; platform++) {
      obj[`P${platform}`] = "";
    }
    setTrainsArrivedAtPlatform(obj);
    updateSimulation();
  };

  useEffect(() => {}, [trainsYetToArrive]);

  useEffect(() => {}, [earliestArrivalTime]);

  const updateSimulation = () => {
    let occupiedPlatform = [0, 0, 0];
    let trainsArrivedAtPlatformLocal = {};
    let trainsYetToArriveLocal = [];
    CSVData.data.map((element, i) => {
      trainsYetToArriveLocal.push(element[0]);
    });

    for (let platform = 0; platform < maxPlatforms; platform++) {
      trainsArrivedAtPlatformLocal[`P${platform}`] = "";
    }

    let scheduledTrains = [];
    let trainsOnStation = Array(0).fill(null);
    let platformArr = Array.from({ length: maxPlatforms }, (e, i) => i);
    let trains = CSVData.data.map((train) => new Train(...train));
    localStorage.setItem("trains", JSON.stringify(trains));

    let time = getMinute(CSVData.data[0][1]) - timeDifference;
    let currentTime = CSVData.data[0][1];
    // Setting interval, the screen will update every {timeDifference} minutes
    intervalRef.current = setInterval(() => {
      // Return the new time in HH:MM format
      currentTime = getCurrentTimeFromMinutes(time);
      setCurrentSimulationTime(currentTime);

      let newTrainsOnStation = Array(0);
      let trainsWaitingForPlatformLocal = [];
      // Finding trains who's time has come to depart and clearing out the station.
      for (let i = 0; i < trainsOnStation.length; i++) {
        if (
          trainsOnStation[i] === null ||
          getMinute(trainsOnStation[i].departure) > time
        ) {
          newTrainsOnStation.push(trainsOnStation[i]);
        } else {
          platformArr.unshift(trainsOnStation[i].platform - 1);
          platformArr.sort();
          trainsArrivedAtPlatformLocal[`P${trainsOnStation[i].platform - 1}`] =
            trainsOnStation.number;
          occupiedPlatform[trainsOnStation[i].platform - 1] = 0;
          trainsWaitingForPlatformLocal = trainsWaitingForPlatformLocal.filter(
            (train) => train != trainsArrivedAtPlatform[i].number
          );
          setTrainsWaitingForPlatform(trainsWaitingForPlatformLocal);
        }
      }
      trainsOnStation = newTrainsOnStation;
      // Schedule arriving trains or add them to the waiting list
      const storedTrains = localStorage.getItem("trains");
      trains = storedTrains ? JSON.parse(storedTrains) : [];
      while (trains.length > 0 && getMinute(trains[0].arrival) <= time) {
        const arrivingTrain = trains.shift();
        insert(arrivingTrain);
        setTrainsYetToArrive([...trains.map((train) => train.number)]);
        localStorage.setItem("trains", JSON.stringify(trains));
      }
      // Trains ready to arrive at the platform , assign platform.
      while (size() > 0 && trainsOnStation.length < maxPlatforms) {
        const nextTrain = extractMin();
        nextTrain.waitingTime += time - getMinute(nextTrain.arrival);
        // if (nextTrain.waitingTime > 0) {
        //   trainsWaitingForPlatformLocal.push(nextTrain.number);
        // }
        nextTrain.platform = platformArr.shift() + 1; // Assign platform number
        //setTrainsWaitingForPlatform(trainsWaitingForPlatformLocal);
        nextTrain.departure = getCurrentTimeFromMinutes(
          getMinute(nextTrain.departure) + nextTrain.waitingTime
        );

        trainsOnStation.push(nextTrain);
        scheduledTrains.push(nextTrain);
        trainsArrivedAtPlatformLocal[`P${nextTrain.platform - 1}`] =
          nextTrain.number;
        occupiedPlatform[nextTrain.platform - 1] = 1;

        // trainsYetToArriveLocal = trainsYetToArriveLocal.filter(
        //   (item) => item !== nextTrain.number
        // );
        console.log("next train number = ", nextTrain.number);
        console.log("trains yet to arrive local = ", trainsYetToArriveLocal);
        // setTrainsYetToArrive([...trainsYetToArriveLocal]);
      }
      if (size() > 0) {
        for (let i = 0; i < size(); i++) {
          trainsWaitingForPlatformLocal.push(trainHeap[i].number);
        }
        setTrainsWaitingForPlatform(trainsWaitingForPlatformLocal);
      }

      setTrainsArrivedAtPlatform({
        ...trainsArrivedAtPlatformLocal,
        trainsArrivedAtPlatform,
      });
      time += timeDifference;
      if (
        time >
        getMinute(CSVData.data[CSVData.data.length - 1][2]) + timeDifference
      ) {
        let exportedTrainData = scheduledTrains.map(
          (train) =>
            new ExportTrain(
              train.number,
              train.arrival,
              train.departure,
              train.priority,
              train.waitingTime
            )
        );
        setExportTrainsData(exportedTrainData);
        // setShowSimulation("none");
        setShowExportButton(true);
        setDisableStartSimulationBtn(false);
        clearInterval(intervalRef.current);
      }
    }, 2000);
  };

  useEffect(() => {}, [scheduledTrains]);

  useEffect(() => {}, [trainsArrivedAtPlatform]);

  const stopSimulation = () => {
    setTrainsArrivedAtPlatform({});
    setScheduledTrains([]);
    setTrainsYetToArrive([]);
    setShowExportButton(false);
    setDisableStartSimulationBtn(false);
    setShowSimulation("none");
    setEarliestArrivalTime("");
    setExportTrainsData([]);
    setCurrentSimulationTime("");
    setTrainsWaitingForPlatform([]);
    clearInterval(intervalRef.current);
  };

  const updateTrainDelayTime = () => {
    const storedTrains = localStorage.getItem("trains");
    let trains = storedTrains ? JSON.parse(storedTrains) : [];
    const index = trains.findIndex(
      (train) => train.number === trainNumberToUpdateDelay
    );

    if (index !== -1) {
      trains[index].arrival = delayTimeToUpdate;
    }
    localStorage.setItem("trains", JSON.stringify(trains));
    handleUpdateDelayModalClose();
  };

  useEffect(() => {
    console.log("CSV Data = ", CSVData);
  }, [CSVData]);

  const handleCSVData = (dataOutput) => {
    dataOutput.data.splice(0, 1);
    setCSVData(dataOutput);
  };

  const lines = Array.from({ length: maxPlatforms }, (_, i) => i * 50);

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
              Enter updated arrival time
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
              {/* 
              <div className="title" style={{ marginTop: "20px" }}>
                Enter Station Name
              </div> */}

              {/* <TextField
                className="title"
                id="standard-basic"
                variant="standard"
                onChange={handleStationName}
                sx={{ input: { color: "white" } }}
              /> */}

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
                disabled={disableStartSimulationBtn}
              >
                Start Simulation
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
              {exportTrainsData.length > 0 && showExportButton ? (
                <CSVLink
                  data={exportTrainsData}
                  filename={"train-schedule.csv"}
                  className="export-csv-btn"
                  target="_blank"
                >
                  Export Trains Data to CSV
                </CSVLink>
              ) : null}
            </div>
          </section>
        </div>

        <div
          id="simulation_card"
          className="card simulation-card"
          style={{ display: showSimulation }}
        >
          <section className="tab">
            {/* <div className="title">Simulation of {stationName}</div> */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="title">Simulation</div>
              <div>Time: {currentSimulationTime}</div>
            </div>
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
                        <Line platformNumber={index} key={index} y={y} />
                      </>
                    );
                  })}
                </div>
              </section>
              <div className="title">
                Trains waiting for platform to be empty
                {trainsWaitingForPlatform.length > 0 ? (
                  trainsWaitingForPlatform.map((element) => (
                    <div>{element}</div>
                  ))
                ) : (
                  <div> NA</div>
                )}
              </div>
              <br />
              <div className="title">
                Trains left to arrive:
                {trainsYetToArrive.length > 0 ? (
                  trainsYetToArrive.map((element) => <div>{element}</div>)
                ) : (
                  <div>NA</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
