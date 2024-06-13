import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";

import { motion } from "framer-motion";
import UploadCSV from "../UploadCSV/UploadCSV";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import RailwaysLogo from "../../assets/indianrailway1.jpg";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import Input from "@mui/material/Input";

import "./dashboard.css";

function Dashboard() {
  const [showCircles, setShowCircles] = useState(Array(20).fill(false));
  const [platforms, setPlatforms] = useState([]);
  const [showSimulation, setShowSimulation] = useState("none");
  const [trainsArrived, setTrainsArrived] = useState([]);
  const [trainsArrivedAtPlatform, setTrainsArrivedAtPlatform] = useState({
    P2: "",
    P3: "",
    P4: "",
    P5: "",
    P6: "",
    P7: "",
    P8: "",
    P9: "",
    P10: "",
    P11: "",
    P12: "",
    P13: "",
    P14: "",
    P15: "",
    P16: "",
    P17: "",
    P18: "",
    P19: "",
    P20: "",
  });
  const [CSVData, setCSVData] = useState({});
  const [trainNumberToUpdateDelay, setTrainNumberToUpdateDelay] = useState();
  const [arrivalTimeToUpdate, setArrivalTimeToUpdate] = useState();
  const [showUpdateDelayModal, setShowUpdateDelayModal] = useState(false);

  const handleUpdateDelayModalClose = () => setShowUpdateDelayModal(false);
  const handleUpdateDelayModalShow = () => setShowUpdateDelayModal(true);
  useEffect(() => {
    for (let i = 2; i <= 20; i++) {
      setPlatforms((platforms) => [...platforms, i]);
    }
  }, []);

  const handleTrainNumberToUpdateDelay = (e) => {
    setTrainNumberToUpdateDelay(e.target.value);
  };

  const handleArrivalTimeToUpdate = (e) => {
    setArrivalTimeToUpdate(e.target.value);
  };

  const toggleCircle = (index) => {
    setShowCircles((prev) =>
      prev.map((circle, i) => (i === index ? !circle : circle))
    );
  };

  const style = {
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

  const [trains, setTrains] = useState([]);

  // Simulate train arrivals and departures (you can replace this with actual data)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Generate random train arrival and departure times
  //     const randomArrival = Math.floor(Math.random() * 1000);
  //     const randomDeparture = randomArrival + Math.floor(Math.random() * 200);

  //     // Update the trains state
  //     setTrains((prevTrains) => [
  //       ...prevTrains,
  //       { arrival: randomArrival, departure: randomDeparture },
  //     ]);
  //   }, 2000); // Adjust the interval as needed

  //   return () => clearInterval(interval);
  // }, []);

  const Line = ({ showCircles, platformNumber, y }) => (
    <>
      <div
        style={{
          width: "900px",
          height: "2px",
          backgroundColor: "black",
          position: "absolute",
          top: `${y}px`,
        }}
      ></div>
      {console.log("platformNumber = ", platformNumber)}
      {Object.values(trainsArrivedAtPlatform).map((train, index) => {
        console.log("train = ", train);
        if (train == "") {
          return (
            <motion.div
              key={index}
              className="train-rectangle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: train.arrival / 1000 }}
            >
              Train {index + 1}
            </motion.div>
          );
        }
      })}
      <motion.div
        style={{
          width: "900px",
          height: "2px",
          backgroundColor: "black",
          position: "relative",
          top: `${y}px`,
          display: `${showSimulation}`,
        }}
      >
        Platform {platformNumber}
      </motion.div>
      {/* {showCircles && (
        <motion.div
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: "red",
            borderRadius: "50%",
            position: "relative",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )} */}
    </>
  );

  useEffect(() => {
    // console.log("csv data = ",CSVData)
    // let currentDate = new Date();
    // if (CSVData.data != null && CSVData.data.length > 0) {
    //   CSVData.data.forEach((element, index) => {
    //     if (index != 0) {
    //       if (
    //         element[1] ==
    //         currentDate.getHours() + ":" + currentDate.getMinutes()
    //       ) {
    //         // setTrainsArrived([...trainsArrived, element[0]]);

    //         // setTrainsArrivedAtPlatform((trainArrivedPlatform) => ({
    //         //   ...trainArrivedPlatform,
    //         //   [platform]: element[0],
    //         // }));

    //         for (const platform in trainsArrivedAtPlatform) {
    //           if (trainsArrivedAtPlatform[platform].length > 0) {
    //             if (!(data[1] >= currentTime && currentTime < data[2])) {
    //               setTrainsArrivedAtPlatform((trainArrivedPlatform) => ({
    //                 ...trainArrivedPlatform,
    //                 [platform]: "",
    //               }));
    //             }
    //           }
    //         }
    //       }
    //     }
    //   });
    // }
    updateSimulation();
  }, [CSVData]);

  const startSimulation = () => {
    setShowSimulation("block");
    updateSimulation();
  };

  // function max(a, b) {
  //   if (a == b) return a;
  //   else {
  //     if (a > b) return a;
  //     else return b;
  //   }
  // }

  // // Returns minimum number of platforms required
  // function findPlatform(arr, dep, n) {
  //   // plat_needed indicates number of platforms
  //   // needed at a time
  //   var plat_needed = 1,
  //     result = 1;
  //   var i = 1,
  //     j = 0;

  //   // run a nested loop to find overlap
  //   for (var i = 0; i < n; i++) {
  //     // minimum platform
  //     plat_needed = 1;

  //     for (var j = 0; j < n; j++) {
  //       // check for overlap
  //       if (i != j) if (arr[i] >= arr[j] && dep[j] >= arr[i]) plat_needed++;
  //     }

  //     // update result
  //     result = max(result, plat_needed);
  //   }

  //   return result;
  // }

  // var arr = [100, 300, 500];
  // var dep = [900, 400, 600];
  // var n = 3;
  // document.write(
  //   "Minimum Number of Platforms Required = " + findPlatform(arr, dep, n)
  // );

  const updateSimulation = () => {
    let currentDate = new Date();
    let currentTime = currentDate.getHours() + ":" + currentDate.getMinutes();
    if (CSVData.data != null && CSVData.data.length > 0) {
      CSVData.data.forEach((data, index) => {
        console.log("data = ", data);
        if (index != 0) {
          for (const platform in trainsArrivedAtPlatform) {
            if (trainsArrivedAtPlatform[platform].length > 0) {
              if (!(data[1] >= currentTime && currentTime < data[2])) {
                setTrainsArrivedAtPlatform((trainArrivedPlatform) => ({
                  ...trainArrivedPlatform,
                  [platform]: "",
                }));
              }
            }
          }
          if (data[1] >= currentTime && currentTime < data[2]) {
            // setTrainsArrived([...trainsArrived, data[0]]);
            for (const platform in trainsArrivedAtPlatform) {
              if (trainsArrivedAtPlatform[platform].length < 1) {
                setTrainsArrivedAtPlatform((trainArrivedPlatform) => ({
                  ...trainArrivedPlatform,
                  [platform]: data[0],
                }));
              }
            }
          }

          // trainsArrivedAtPlatform.forEach((train) => {
          //   if (train == data[0]) {
          //     if (!(data[1] >= currentTime && currentTime < data[2])) {
          //       let updateTrainArrived = trainsArrived.filter(
          //         (currentTrain) => currentTrain != train
          //       );
          //       // setTrainsArrived(updateTrainArrived);
          //     }
          //   }
          // });
        }
      });
    }
  };

  const stopSimulation = () => {
    setShowSimulation("none");
  };

  const updateTrainDelayTime = () => {
    CSVData.data.map((data, index) => {
      if (data[0] == trainNumberToUpdateDelay) {
        CSVData.data[index].data[1] = delayUpdateTime;
      }
    });
  };

  const handleCSVData = (data) => {
    setCSVData(data);
  };

  const lines = Array.from({ length: 20 }, (_, i) => i * 50);

  return (
    <>
      <Modal open={showUpdateDelayModal} onClose={handleUpdateDelayModalClose}>
        <Box sx={style}>
          <Typography
            variant="h6"
            component="h2"
            id="modal-title"
            sx={{ marginBottom: "30px" }}
          >
            Update Arrival Delay Time Train Number
          </Typography>
          <FormControl>
            <InputLabel htmlFor="train-number">Enter Train Number</InputLabel>
            <Input
              type="number"
              id="train-number"
              placeholder="e.g. 221133"
              name="trainNumberToUpdateDelay"
              value={trainNumberToUpdateDelay}
              onChange={handleTrainNumberToUpdateDelay}
              required
            />
          </FormControl>
          <br />
          <FormControl>
            <InputLabel htmlFor="arrival-time">
              Enter updated arrival time
            </InputLabel>

            <Input
              type="text"
              id="arrival-time"
              placeholder="10:00"
              name="trainNumberToUpdateDelay"
              value={arrivalTimeToUpdate}
              onChange={handleArrivalTimeToUpdate}
              required
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
        {/* <Modal.Header closeButton>
          <Modal.Title>Update Arrival Delay Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Train Number</Form.Label>
          <Form.Control
            type="number"
            placeholder="e.g. 221133"
            name="trainNumberToUpdateDelay"
            value={trainNumberToUpdateDelay}
            onChange={handleTrainNumberToUpdateDelay}
            required
          />
          <Form.Label>Enter updated arrival time</Form.Label>
          <Form.Control
            type="text"
            placeholder="10:00"
            name="trainNumberToUpdateDelay"
            value={arrivalTimeToUpdate}
            onChange={handleArrivalTimeToUpdate}
            required
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="text" onClick={handleUpdateDelayModalClose}>
            Close
          </Button>
          <Button variant="text" onClick={updateTrainDelayTime}>
            Save Changes
          </Button>
        </Modal.Footer> */}
      </Modal>

      <div id="bg"></div>
      <header>
        <div id="title_card" class="card">
          <div>
            <img id="photo" src={RailwaysLogo} />
          </div>

          <h1 id="name">Railway Simulation System</h1>
          <span id="description"></span>
        </div>
      </header>

      <main>
        <div id="info_card" class="card">
          <section class="tab">
            <div class="title">Upload Train Schedule</div>
            <div class="content">
              <section class="element">
                <UploadCSV sendCSVDataToParent={handleCSVData} />
              </section>
            </div>
          </section>
        </div>

        <div id="social_card" class="card">
          <section class="tab">
            <div class="title">Options</div>

            <div class="content">
              <Button
                variant="contained"
                color="success"
                onClick={startSimulation}
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
            </div>
          </section>
        </div>

        <div id="info_card" class="card">
          <section class="tab">
            <div class="title">Simulation</div>
            <div class="content">
              <section class="element">
                <div
                  style={{
                    position: "relative",
                    height: "200px",
                    marginTop: "50px",
                    marginLeft: "50px",
                  }}
                >
                  {lines.map((y, index) => {
                    return (
                      <>
                        {/* Platform {index + 1} */}
                        <Line
                          showCircles={showCircles}
                          onClick={() => toggleCircle(index)}
                          platformNumber={index + 1}
                          key={index}
                          y={y}
                        />
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
