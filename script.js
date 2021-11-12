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
        return (Math.abs(this.s)) % (max + 1);
    }
}

const doShuffle = function () {
    //clear numbers
    const desks = document.getElementsByClassName("desk");
    for(const desk of desks){
        desk.innerHTML = "";
    }
    //get presenters list
    const presenters = document.getElementsByClassName("present");
    let arr = new Array(presenters.length); //create empty array
    for (let i = 0; i < presenters.length; i++) {
        arr[i] = i + 1;
    }
    //get seed
    const seedInput = document.getElementById("seed");
    if (seedInput.value != "") {
        seed = seedInput.value;
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

const init = function () {
    document.getElementById("seed").setAttribute("placeholder", seed);
    document.getElementById("shuffleBtn").addEventListener("click", doShuffle);
    const desks = document.getElementsByClassName("desk");
    for (const desk of desks) {
        desk.addEventListener("click", function () {
            this.classList.toggle("present");
        });
    }
};

let seed = getUNIXtime();
document.addEventListener("DOMContentLoaded", init);