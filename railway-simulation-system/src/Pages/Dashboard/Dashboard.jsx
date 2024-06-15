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
  const [trainNumberToUpdateDelay, setTrainNumberToUpdateDelay] = useState();
  const [trainsYetToArrive, setTrainsYetToArrive] = useState([]);

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
  }, [CSVData]);

  const startSimulation = () => {
    // CSVData.data.sort((a, b) => {
    //   // Convert time strings to date objects
    //   const timeA = new Date(`1970/01/01 ${a[0]}:00`);
    //   const timeB = new Date(`1970/01/01 ${b[0]}:00`);

    //   // Compare the date objects
    //   return timeA - timeB;
    // });

    // setCSVData({ ...CSVData });
    setShowSimulation("block");
    let obj = {};
    for (let platform = 2; i <= maxPlatforms; platform++) {
      obj[`P${i}`] = "";
    }
    setTrainsArrivedAtPlatform(obj);
    updateSimulation();
  };

  const updateSimulation = () => {
    console.log("update simulation called");
    let trainsArrivedAtPlatformLocal = {};
    for (let platform = 2; i <= maxPlatforms; platform++) {
      trainsArrivedAtPlatformLocal[`P${i}`] = "";
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
    if (CSVData.data != null && CSVData.data.length > 0) {
      CSVData.data.forEach((data, index) => {
        if (index != 0) {
          if (data[1] <= currentTime && currentTime < data[2]) {
            for (const platform in trainsArrivedAtPlatformLocal) {
              if (trainsArrivedAtPlatformLocal[platform].length < 1) {
                trainsArrivedAtPlatformLocal = {
                  ...trainsArrivedAtPlatformLocal,
                  [platform]: data[0],
                };
                break;
              }
            }
          }
        }
      });
      setTrainsArrivedAtPlatform(trainsArrivedAtPlatformLocal);
    }
  };

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

  const handleCSVData = (data) => {
    setCSVData(data);
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
