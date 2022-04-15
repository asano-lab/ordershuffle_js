const getUNIXtime = function () {
    const oDate = new Date();
    return Math.floor(oDate.getTime() / 1000);
};

//Xorshift pseudorandom number generator
class Random {
    constructor(seed) {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.s = seed;
    }
    next(max) {
        const t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.s;
        this.s = (this.s ^ (this.s >>> 19)) ^ (t ^ (t >>> 8));
        return Math.abs(this.s) % max;
    }
}

const doShuffle = function () {
    //clear numbers
    const desks = document.getElementsByClassName("desk");
    for (const desk of desks) {
        desk.innerHTML = "";
    }
    //get presenters list
    const presenters = document.getElementsByClassName("present");
    let arr = new Array(presenters.length); //create empty array
    for (let i = 0; i < presenters.length; i++) {
        arr[i] = i + 1;
    }
    //get seed
    let seedInput = document.getElementById("seed");
    if (seedInput.value != "") {
        seed = seedInput.value;
        document.getElementById("seed").setAttribute("placeholder", seed);
    }
    const random = new Random(seed);
    //modern Fisher-Yates shuffle algorithm
    for (let i = presenters.length; 1 < i; i--) {
        k = random.next(i);
        [arr[k], arr[i - 1]] = [arr[i - 1], arr[k]];
    }
    for (let i = 0; i < presenters.length; i++) {
        presenters[i].innerHTML = "<div>" + arr[i] + "</div>";
    }
};

const selectAll = function () {
    const desks = document.getElementsByClassName("desk");
    for (const desk of desks) {
        desk.classList.add("present");
    }
}

const deselectAll = function () {
    const desks = document.getElementsByClassName("desk");
    for (const desk of desks) {
        desk.classList.remove("present");
    }
}
const selectB4 = function(){
    deselectAll();
    const desks = document.getElementsByClassName("b4");
    for (const desk of desks) {
        desk.classList.add("present");
    }
}

const init = function () {
    document.getElementById("seed").setAttribute("placeholder", seed);
    document.getElementById("shuffleBtn").addEventListener("click", doShuffle);
    document.getElementById("allBtn").addEventListener("click", selectAll);
    document.getElementById("noBtn").addEventListener("click", deselectAll);
    document.getElementById("b4Btn").addEventListener("click", selectB4);
    document.addEventListener("keyup", function (e) {
        if (e.key === "Enter") {
            doShuffle();
        }
    })
    const desks = document.getElementsByClassName("desk");
    for (const desk of desks) {
        desk.addEventListener("click", function () {
            this.classList.toggle("present");
        });
    }
};

let seed = getUNIXtime();
document.addEventListener("DOMContentLoaded", init);