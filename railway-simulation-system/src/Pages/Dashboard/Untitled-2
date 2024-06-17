// Min-heap class for managing waiting trains efficiently
class MinHeap {
    constructor() {
        this.heap = [];
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    leftChild(i) {
        return 2 * i + 1;
    }

    rightChild(i) {
        return 2 * i + 2;
    }

    bubbleUp(index) {
        let currentIndex = index;
        const currentValue = this.heap[currentIndex];
        let parentIndex = this.parent(currentIndex);

        while (
            currentIndex > 0 &&
            (this.heap[parentIndex].priority > currentValue.priority ||
                (this.heap[parentIndex].priority === currentValue.priority &&
                    this.heap[parentIndex].arrival > currentValue.arrival))
        ) {
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = this.parent(currentIndex);
        }
    }

    bubbleDown(index) {
        let currentIndex = index;
        const currentValue = this.heap[currentIndex];
        let leftChildIndex = this.leftChild(currentIndex);
        let rightChildIndex = this.rightChild(currentIndex);
        let minIndex = currentIndex;

        if (
            leftChildIndex < this.heap.length &&
            (this.heap[leftChildIndex].priority < currentValue.priority ||
                (this.heap[leftChildIndex].priority === currentValue.priority &&
                    this.heap[leftChildIndex].arrival < currentValue.arrival))
        ) {
            minIndex = leftChildIndex;
        }

        if (
            rightChildIndex < this.heap.length &&
            (this.heap[rightChildIndex].priority < this.heap[minIndex].priority ||
                (this.heap[rightChildIndex].priority === this.heap[minIndex].priority &&
                    this.heap[rightChildIndex].arrival < this.heap[minIndex].arrival))
        ) {
            minIndex = rightChildIndex;
        }

        if (minIndex !== currentIndex) {
            this.swap(currentIndex, minIndex);
            this.bubbleDown(minIndex);
        }
    }

    insert(value) {
        console.log("insert being called")
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const minValue = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);

        return minValue;
    }

    peek() {
        return this.heap[0];
    }

    size() {
        return this.heap.length;
    }
}

// Train class (same as before)
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

// Main scheduling function
function scheduleTrains(platforms, trainsData) {
    let scheduledTrains = [];
    let waitingTrains = new MinHeap();
    let availablePlatforms = Array(0).fill(null);
    let platformArr = Array.from({ length: platforms }, (e, i) => i)

    // Convert train data to Train instances
    let trains = trainsData.map((train) => new Train(...train));

    // Iterate over each minute of the day
    for (let time = 199; time < 1440; time++) {
        // Free up platforms if departure time has passed
        // availablePlatforms = availablePlatforms.filter(
        //   (train) => train === null || train.departure > time
        // );
        let newAvailablePlatforms = Array(0);
        for (let i = 0; i < availablePlatforms.length; i++) {
            if (availablePlatforms[i] === null || availablePlatforms[i].departure > time) {
                newAvailablePlatforms.push(availablePlatforms[i])
            } else {
                platformArr.push(availablePlatforms[i].platform - 1)
            }
        }
        availablePlatforms = newAvailablePlatforms

        // Schedule waiting trains if platforms are available
        while (
            waitingTrains.size() > 0 &&
            availablePlatforms.length < platforms
        ) {
            const nextTrain = waitingTrains.extractMin();
            nextTrain.waitingTime += time - nextTrain.arrival;
            nextTrain.platform = platformArr.shift() + 1; // Assign platform number
            availablePlatforms.push(nextTrain);
            scheduledTrains.push(nextTrain);
        }

        // Schedule arriving trains or add them to the waiting list
        while (
            trains.length > 0 &&
            trains[0].arrival - 1 <= time
        ) {
            const arrivingTrain = trains.shift();
            waitingTrains.insert(arrivingTrain);
        }
    }

    return scheduledTrains.map((train) => ({
        number: train.number,
        arrival: train.arrival,
        departure: train.departure,
        priority: train.priority,
        waitingTime: train.waitingTime,
        platform: train.platform, // Include platform in the result
    }));
}

// Example data for 10 trains
const trainsData = [
    [1, 200, 210, 1],
    [2, 200, 230, 2],
    [3, 200, 240, 3],
    [4, 200, 260, 5],
    [5, 260, 270, 4],
    [6, 270, 280, 3],
    [7, 280, 290, 2],
    [8, 290, 300, 1],
];

// Call the scheduling function with data for three platforms
console.log(scheduleTrains(3, trainsData));
