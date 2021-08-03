const SCALE = 25;
const MAX_POPULATION = 7;

// 机の位置と大きさ
const COO_SIZ = [
    [         0,          0, SCALE *  3, SCALE *  5],
    [         0, SCALE *  6, SCALE *  3, SCALE *  5],
    [         0, SCALE * 12, SCALE *  3, SCALE *  5],
    [SCALE *  4, SCALE * 18, SCALE *  5, SCALE *  3],
    [SCALE * 10, SCALE * 18, SCALE *  5, SCALE *  3],
    [SCALE * 16, SCALE *  6, SCALE *  3, SCALE *  5],
    [SCALE * 16,          0, SCALE *  3, SCALE *  5]
];

// テキストの位置
const TXT_COO = [
    [SCALE     , SCALE *  3],
    [SCALE     , SCALE *  9],
    [SCALE     , SCALE * 15],
    [SCALE *  6, SCALE * 20],
    [SCALE * 12, SCALE * 20],
    [SCALE * 17, SCALE *  9],
    [SCALE * 17, SCALE *  3]
];

// 机に割り振るアルファベット
const NAMES = ["A", "B", "C", "D", "E", "F", "G"];

const FONTSIZE = SCALE * 1.6

let canvas;
let target;
let ctx;

let checkboxes;

let population;

// 出席者
let attendees;

// 順番を格納する配列
let orders_num;

let orders_name;

// グローバルのイテレータ変数
let g_itr;

let initial;

// 最初に一度だけ実行
function init() {
    initial = true;
    canvas = document.getElementById('tutorial');
    target = document.getElementById("output");

    // チェックボックスの配列
    checkboxes = [
        document.getElementById('check1'),
        document.getElementById('check2'),
        document.getElementById('check3'),
        document.getElementById('check4'),
        document.getElementById('check5'),
        document.getElementById('check6'),
        document.getElementById('check7')
    ];

    // デフォルト値の設定
    checkboxes[2].checked = true;
    checkboxes[5].checked = true;
    checkboxes[6].checked = true;

    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        // ctx.globalCompositeOperation = "source-in";
        ctx.globalCompositeOperation = "source-over";
        draw();
        initial = false;
    }
}

function draw() {
    let i;
    target.innerHTML = "";

    // 背景 (毎回上書きする必要はなさそう)
    ctx.fillStyle = "rgba(65, 105, 225, 1)";

    if (initial) {
        ctx.fillRect(0, 0, SCALE * 19, SCALE * 21);
    }

    // 机の色分け
    for (i = 0; i < MAX_POPULATION; i++) {
        if (checkboxes[i].checked) {
            ctx.fillStyle = "rgb(100, 100, 0)"
        } else {
            ctx.fillStyle = "rgb(200, 200, 0)"
        }
        if (initial) {
            ctx.fillRect(COO_SIZ[i][0], COO_SIZ[i][1], COO_SIZ[i][2], COO_SIZ[i][3]);
        }
    }

    // 各机にアルファベットを割り振りたい
    ctx.font = String(FONTSIZE * 0.5) + "px serif";
    ctx.fillStyle = "rgb(0, 0, 0)";
    for (i = 0; i < MAX_POPULATION; i++) {
        ctx.fillText(NAMES[i], COO_SIZ[i][0] + SCALE * 0.1, COO_SIZ[i][1] + SCALE * 0.8);
    }

    // フォントの設定
    ctx.font = String(FONTSIZE) + "px serif";
    ctx.fillStyle = "rgb(200, 0, 0)";

    // イテレータ変数初期化
    g_itr = 0;
    setTimeout(drawOrders, 200);
}

function drawOrders() {
    let coo = TXT_COO[attendees[orders_num[g_itr]]];
    ctx.fillText(g_itr + 1, coo[0], coo[1]);
    if (g_itr < population - 1) {
        g_itr++;
        setTimeout(drawOrders, 200);
    } else {
        target.innerHTML = orders_name;
    }
}

// ある範囲の整数乱数を取得
// min は含むが max は含まない
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min) + min);
  }

// ボタン押下時に実行する関数
function OnButtonClick() {
    let i, j;
    // 人数のカウントと出席者の取得
    population = 0;
    attendees = [];
    for (i = 0; i < MAX_POPULATION; i++) {
        if (!checkboxes[i].checked) {
            population += !checkboxes[i].checked;
            attendees.push(i);
        }
    }
    // ランダムに順番を決める
    orders_num = [];
    for (i = population; i > 0; i--) {
        orders_num.push(getRandomInt(0, i));
    }
    // 重複排除
    for (i = population - 1; i > 0; i--) {
        for (j = i - 1; j >= 0; j--) {
            if (orders_num[j] <= orders_num[i]) {
                orders_num[i]++;
            }
        }
    }
    orders_name = []
    for (i = 0; i < population; i++) {
        orders_name.push(NAMES[attendees[orders_num[i]]]);
    }
    draw();
}
