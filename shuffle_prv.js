const SCALE = 25;
const MAX_POPULATION = 7;

// 机の位置と大きさ
const COO_SIZ = [
    [0, 0, SCALE * 3, SCALE * 5],
    [0, SCALE * 6, SCALE * 3, SCALE * 5],
    [0, SCALE * 12, SCALE * 3, SCALE * 5],
    [SCALE * 4, SCALE * 16, SCALE * 5, SCALE * 3],
    [SCALE * 10, SCALE * 16, SCALE * 5, SCALE * 3],
    [SCALE * 16, SCALE * 6, SCALE * 3, SCALE * 5],
    [SCALE * 16, 0, SCALE * 3, SCALE * 5]
];

// テキストの位置
const TXT_COO = [
    [SCALE, SCALE * 3],
    [SCALE, SCALE * 9],
    [SCALE, SCALE * 15],
    [SCALE * 6, SCALE * 18],
    [SCALE * 12, SCALE * 18],
    [SCALE * 17, SCALE * 9],
    [SCALE * 17, SCALE * 3]
];

// 机に割り振るアルファベット
const NAMES = ["A", "B", "C", "D", "E", "F", "G"];

const FONTSIZE = SCALE * 1.6

let canvas;
let target;
let ctx;

let shuffle_button;
let checkboxes;

let population;

// シード値入力欄
let input_num;

// 出席者
let attendees;

// 順番を格納する配列
let orders_num;

let orders_name;

// グローバルのイテレータ変数
let g_itr;

let man_seed;

// シード付き乱数生成
// 参考：https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
class Random {
    constructor(seed = 88675123) {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = seed;
    }

    // XorShift
    // 乱数生成アルゴリズム
    next() {
        const t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    }

    // 範囲内の整数乱数を生成
    // minは含むがmaxは含まない
    nextInt(min, max) {
        return min + (Math.abs(this.next()) % (max - min));
    }
}

// 背景描画
function drawBackGround() {
    let i;
    // 背景の描画
    ctx.fillStyle = "rgba(65, 105, 225, 1)";
    ctx.fillRect(0, 0, SCALE * 19, SCALE * 19);

    // 机を色分けして描画
    for (i = 0; i < MAX_POPULATION; i++) {
        if (checkboxes[i].checked) {
            ctx.fillStyle = "rgb(200, 200, 0)"
        } else {
            ctx.fillStyle = "rgb(100, 100, 0)"
        }
        ctx.fillRect(COO_SIZ[i][0], COO_SIZ[i][1], COO_SIZ[i][2], COO_SIZ[i][3]);
    }

    // 各机にアルファベットを割り振る
    ctx.font = String(FONTSIZE * 0.5) + "px serif";
    ctx.fillStyle = "rgb(0, 0, 0)";
    for (i = 0; i < MAX_POPULATION; i++) {
        ctx.fillText(NAMES[i], COO_SIZ[i][0] + SCALE * 0.1, COO_SIZ[i][1] + SCALE * 0.8);
    }
}

// 順番の描画開始
function startDrawOrders() {
    target.innerHTML = "";
    drawBackGround();

    // フォントの設定
    ctx.font = String(FONTSIZE) + "px serif";
    ctx.fillStyle = "rgb(200, 0, 0)";

    // イテレータ変数初期化
    g_itr = 0;
    setTimeout(drawOrders, 200);
}

// 順番を描画する (時間差あり)
function drawOrders() {
    let coo = TXT_COO[orders_num[g_itr]];
    g_itr++;
    ctx.fillText(g_itr, coo[0], coo[1]);
    if (g_itr < population) {
        setTimeout(drawOrders, 200);
    } else {
        shuffle_button.disabled = false;
    }
    target.innerHTML = orders_name.slice(0, g_itr);
}

// シャッフルボタン押下時に実行する関数
function onShuffleClick() {
    shuffle_button.disabled = true;
    let i, r;
    // シードの自動設定 (時刻)
    if (!man_seed) {
        const t = (new Date).getTime();
        const s = (t / 13 | 0) & 0x7fffffff;
        input_num.value = s;
    }
    // 未入力の場合は0
    else if (!input_num.value) {
        input_num.value = 0;
    }

    const seed = input_num.value;
    const random = new Random(seed);

    // 人数のカウントと出席者の取得
    population = 0;
    attendees = [];
    let cp_attendees = [];

    for (i = 0; i < MAX_POPULATION; i++) {
        if (checkboxes[i].checked) {
            population += 1;
            attendees.push(i);
            cp_attendees.push(i);
        }
    }
    // ランダムに順番を決める
    orders_num = [];
    for (i = population; i > 0; i--) {
        r = random.nextInt(0, i);
        orders_num = orders_num.concat(cp_attendees.splice(r, 1));
    }

    orders_name = []
    for (i = 0; i < population; i++) {
        orders_name.push(NAMES[orders_num[i]]);
    }
    startDrawOrders();
}

// シード設定の変更
function onSeedCheckClick() {
    if (seed_check.checked) {
        input_num.disabled = false;
        man_seed = true;
    } else {
        input_num.disabled = true;
        man_seed = false;
    }
}

canvas = document.getElementById('tutorial');
target = document.getElementById("output");
shuffle_button = document.getElementById("button1");

// チェックボックスの配列
// クラス名で取得
checkboxes = document.getElementsByClassName("cbc1");
seed_check = document.getElementById("check8");
input_num = document.getElementById("inum1");

man_seed = false;

if (canvas.getContext) {
    ctx = canvas.getContext('2d');
    // ctx.globalCompositeOperation = "source-in";
    ctx.globalCompositeOperation = "source-over";
    drawBackGround();
}
