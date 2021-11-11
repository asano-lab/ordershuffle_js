
const MAX_POPULATION = 7;

const PC_FLAG = !navigator.userAgent.match(/(iPhone|iPod|Android.*Mobile)/i);

// 机に割り振るアルファベット
const NAMES = ["A", "B", "C", "D", "E", "F", "G"];

const MIN_SCALE = 8;

let scale;

// 机の位置と大きさ
let coo_siz;

// テキストの位置
let txt_coo;

let font_size;

let attend = [true, true, true, true, true, false, false];

let population = 0;

// 順番を格納する配列
let orders_num = [];
let orders_name = [];

let pointed = -1;

// グローバルのイテレータ変数
let g_itr;

let running = false;

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

// スケールの変更
const changeScale = (base) => {
    scale = base;
    
    // 机の位置と大きさ
    coo_siz = [
        [0, 0, scale * 3, scale * 5],
        [0, scale * 6, scale * 3, scale * 5],
        [0, scale * 12, scale * 3, scale * 5],
        [scale * 4, scale * 16, scale * 5, scale * 3],
        [scale * 10, scale * 16, scale * 5, scale * 3],
        [scale * 16, scale * 6, scale * 3, scale * 5],
        [scale * 16, 0, scale * 3, scale * 5]
    ];
    
    // テキストの位置
    txt_coo = [
        [scale, scale * 3],
        [scale, scale * 9],
        [scale, scale * 15],
        [scale * 6, scale * 18],
        [scale * 12, scale * 18],
        [scale * 17, scale * 9],
        [scale * 17, scale * 3]
    ];

    font_size = scale * 1.6;
}

changeScale(20);

// 背景描画
const drawBackGround = () => {
    let i;
    // 背景の描画
    ctx.fillStyle = "rgba(65, 105, 225, 1)";
    ctx.fillRect(0, 0, scale * 19, scale * 19);

    // 机を色分けして描画
    for (i = 0; i < MAX_POPULATION; i++) {
        if (attend[i]) {
            ctx.fillStyle = "rgb(200, 200, 0)";
        } else {
            ctx.fillStyle = "rgb(100, 100, 0)";
        }
        ctx.fillRect(coo_siz[i][0], coo_siz[i][1], coo_siz[i][2], coo_siz[i][3]);
    }

    // 各机にアルファベットを割り振る
    ctx.font = String(font_size * 0.5) + "px serif";
    ctx.fillStyle = "rgb(0, 0, 0)";
    for (i = 0; i < MAX_POPULATION; i++) {
        ctx.fillText(NAMES[i], coo_siz[i][0] + scale * 0.1, coo_siz[i][1] + scale * 0.8);
    }
}

// 順番の描画開始
const startDrawOrders = () => {
    target.innerHTML = "";
    drawBackGround();

    // フォントの設定
    ctx.font = String(font_size) + "px serif";
    ctx.fillStyle = "rgb(200, 0, 0)";

    // イテレータ変数初期化
    g_itr = 0;
    setTimeout(drawOrders, 200);
}

// 順番を描画する (時間差あり)
const drawOrders = () => {
    const coo = txt_coo[orders_num[g_itr++]];
    ctx.fillText(g_itr, coo[0], coo[1]);
    if (g_itr < population) {
        setTimeout(drawOrders, 200);
    } else {
        running = false;
        setDisabledAll(false);
    }
    target.innerHTML = orders_name.slice(0, g_itr);
}

// 順番描画 (即時)
const drawOrdersImm = () => {
    // フォントの設定
    ctx.font = String(font_size) + "px serif";
    ctx.fillStyle = "rgb(200, 0, 0)";
    let x, y;
    for (let i = 0; i < population; i++) {
        [x, y] = txt_coo[orders_num[i]];
        ctx.fillText(i + 1, x, y);
    }
}

// 指定した机とその番号を上書き
const drawTableAndOrder = (table_num, io) => {
    // in
    if (io && PC_FLAG) {
        if (attend[table_num]) {
            ctx.fillStyle = "rgb(255, 100, 100)";
        } else {
            ctx.fillStyle = "rgb(200, 0, 0)";
        }
    }
    // out
    else {
        if (attend[table_num]) {
            ctx.fillStyle = "rgb(200, 200, 0)";
        } else {
            ctx.fillStyle = "rgb(100, 100, 0)";
        }
    }
    ctx.fillRect(coo_siz[table_num][0], coo_siz[table_num][1], coo_siz[table_num][2], coo_siz[table_num][3]);
    ctx.font = String(font_size * 0.5) + "px serif";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(NAMES[table_num], coo_siz[table_num][0] + scale * 0.1, coo_siz[table_num][1] + scale * 0.8);
    if (orders_num.includes(table_num)) {
        const coo = txt_coo[table_num];
        ctx.font = String(font_size) + "px serif";
        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillText(orders_num.indexOf(table_num) + 1, coo[0], coo[1]);
    }
}

// シャッフルボタン押下時に実行する関数
const onShuffleClick = () => {
    running = true;
    setDisabledAll(true);
    let i, r;
    // シードの自動設定 (時刻)
    if (!seed_check.classList.contains('active')) {
        const t = (new Date).getTime();
        input_num.value = (t / 13 | 0) & 0x7fffffff;
    }
    // 実数や空文字は整数に変換
    input_num.value = parseInt(Number(input_num.value), 10);

    const random = new Random(input_num.value);

    // 人数のカウントと出席者の取得
    population = 0;
    let attendees = [];

    for (i = 0; i < MAX_POPULATION; i++) {
        if (attend[i]) {
            population++;
            attendees.push(i);
        }
    }

    // ランダムに順番を決める
    orders_num = [];
    for (i = population; i > 0; i--) {
        r = random.nextInt(0, i);
        orders_num = orders_num.concat(attendees.splice(r, 1));
    }

    orders_name = []
    for (i = 0; i < population; i++) {
        orders_name.push(NAMES[orders_num[i]]);
    }
    startDrawOrders();
}

// シード設定の変更
const onSeedCheckClick = () => {
    input_num.disabled = !seed_check.classList.contains('active');
}

// 順番に関する変数を初期化
const initOrder = () => {
    population = 0;
    orders_num = [];
    orders_name = [];
}

// 一括切り替え
const setDisabledAll = (b) => {
    shuffle_button.disabled = b;
    seed_check.disabled = b;
    // シードの入力欄は例外
    if (seed_check.classList.contains('active')) {
        input_num.disabled = b;
    }
}

// 全員欠席なら真
const noPresenter = () => {
    for (let i = 0; i < MAX_POPULATION; i++) {
        if (attend[i]) {
            return false;
        }
    }
    return true;
}

const main_canvas = document.getElementById("main_canvas");
const target = document.getElementById("output");
const shuffle_button = document.getElementById("button1");

const seed_check = document.getElementById("check8");
const input_num = document.getElementById("inum1");

// シード入力欄でEnterキーを押したとき, シャッフルを実行
input_num.addEventListener("keydown", e => {
    if (e.key == "Enter") {
        // シャッフルボタンが無効の場合は実行しない
        if (!shuffle_button.disabled) {
            onShuffleClick();
        }
        // リロードしない
        e.preventDefault();
    }
});

// main_canvasのなにか
let ctx;

if (main_canvas.getContext) {
    ctx = main_canvas.getContext("2d");
    // ctx.globalCompositeOperation = "source-in";
    ctx.globalCompositeOperation = "source-over";

    main_canvas.addEventListener("mousemove", (e) => {
        if (running) {
            return;
        }
        const x = e.offsetX;
        const y = e.offsetY;
        let x0, y0, w, h;
        // まずは直前の座標を確認
        if (pointed >= 0) {
            [x0, y0, w, h] = coo_siz[pointed];
            // ポインタが変化していない
            if (x0 <= x && x < x0 + w && y0 <= y && y < y0 + h) {
                return;
            }
            // 描画を戻す
            drawTableAndOrder(pointed, false);
        }

        const prev_pointed = pointed;

        for (let i = 0; i < MAX_POPULATION; i++) {
            [x0, y0, w, h] = coo_siz[i];
            if (x0 <= x && x < x0 + w && y0 <= y && y < y0 + h) {
                pointed = i;
                break;
            } else {
                pointed = -1;
            }
        }
        if (prev_pointed == pointed) {
            return;
        }
        if (pointed >= 0) {
            drawTableAndOrder(pointed, true);
        }
    });

    main_canvas.addEventListener("mouseout", (e) => {
        if (pointed == -1) {
            return;
        }
        drawTableAndOrder(pointed, false);
        pointed = -1;
    });

    main_canvas.addEventListener("click", (e) => {
        if (pointed < 0) {
            return;
        }
        if (!population) {
            attend[pointed] = !attend[pointed];
            drawTableAndOrder(pointed, true);
        } else if (confirm("順番をリセットしますか?")) {
            attend[pointed] = !attend[pointed];
            initOrder();
            drawBackGround();
        }
        shuffle_button.disabled = noPresenter();
    });

    drawBackGround();
}

// canvasのリサイズ
const resizeCanvas = () => {
    // 実行中は動作しない
    if (running) {
        return;
    }
    // windowの幅と高さから基準を計算
    const wcw = document.documentElement.clientWidth;
    const wch = document.documentElement.clientHeight - 100;
    let base;
    if (wcw * 19 > wch * 21) {
        base = wch / 19;
    } else {
        base = wcw / 21;
    }
    base *= 0.9;
    base = base > MIN_SCALE ? base : MIN_SCALE;
    main_canvas.width = base * 21;
    main_canvas.height = base * 19;
    changeScale(base);
    drawBackGround();
    drawOrdersImm();
}

// windowのリサイズを検知
window.addEventListener("resize", resizeCanvas);

// canvasサイズの初期化
resizeCanvas();
