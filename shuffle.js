const MAX_POPULATION = 8;

const PC_FLAG = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android.*Mobile)/i);

const MIN_SCALE = 8;

let scale = 10;

// 机の位置と大きさ
let coo_siz = [[0]];

// テキストの位置
let txt_coo = [[0]];

let attend = [true, true, true, true, true, false, false, true];

let population = 0;

// 順番を格納する配列
let orders_num = [0];

let pointed = -1;

// グローバルのイテレータ変数
let g_itr = 0;

let running = false;

let manual_seed_flag = false;

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
const changeScale = () => {
    // 机の位置と大きさ
    coo_siz = [
        [0, 0, scale * 3, scale * 5],
        [0, scale * 6, scale * 3, scale * 5],
        [0, scale * 12, scale * 3, scale * 5],
        [scale * 4, scale * 16, scale * 5, scale * 3],
        [scale * 10, scale * 16, scale * 5, scale * 3],
        [scale * 16, scale * 6, scale * 3, scale * 5],
        [scale * 16, 0, scale * 3, scale * 5],
        [scale * 9.6, scale * 7, scale * 3, scale * 5]
    ];

    for (let i of coo_siz) {
        i.push(i[0] + i[2], i[1] + i[3]);
    }
    console.log(coo_siz);

    // テキストの位置
    txt_coo = [
        [scale, scale * 3],
        [scale, scale * 9],
        [scale, scale * 15],
        [scale * 6, scale * 18],
        [scale * 12, scale * 18],
        [scale * 17, scale * 9],
        [scale * 17, scale * 3],
        [scale * 11, scale * 11]
    ];

    // フォントは一度だけ指定
    ctx.font = String(scale * 1.6) + "px serif"
}

// 背景描画
const drawBackGround = () => {
    // 背景の描画
    ctx.fillStyle = "rgba(65, 105, 225, 1)";
    ctx.fillRect(0, 0, scale * 19, scale * 19);

    // 机を色分けして描画
    for (let i = 0; i < MAX_POPULATION; i++) {
        if (attend[i]) {
            ctx.fillStyle = "rgb(200, 200, 0)";
        } else {
            ctx.fillStyle = "rgb(100, 100, 0)";
        }
        ctx.fillRect(coo_siz[i][0], coo_siz[i][1], coo_siz[i][2], coo_siz[i][3]);
    }
}

// 順番の描画開始
const startDrawOrders = () => {
    drawBackGround();

    // 文字色の設定
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
}

// 順番描画 (即時)
const drawOrdersImm = () => {
    // 文字色
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
    if (orders_num.includes(table_num) && population) {
        const coo = txt_coo[table_num];
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
    if (!manual_seed_flag) {
        const t = (new Date).getTime();
        seed_value.value = (t / 13 | 0) & 0x7fffffff;
    }
    // 実数や空文字は整数に変換
    seed_value.value = parseInt(Number(seed_value.value), 10);

    const random = new Random(seed_value.value);

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

    startDrawOrders();
}

// 順番に関する変数を初期化
const initOrder = () => {
    population = 0;
    orders_num = [];
}

// 一括切り替え
const setDisabledAll = b => {
    shuffle_button.disabled = b;
    manual_seed.disabled = b;
    all_attend_button.disabled = b;
    all_absent_button.disabled = b;
    // シードの入力欄は例外
    if (manual_seed_flag) {
        seed_value.disabled = b;
    }
}

// 全員欠席なら真を返す
const noPresenter = () => {
    for (const flag of attend) {
        if (flag) {
            return false;
        }
    }
    return true;
}

// canvasのリサイズ
const onWindowResize = () => {
    // シャッフル中は動作しない
    if (running) {
        return;
    }
    // 幅と高さから基準を計算
    const bw = canvas_parent.clientWidth;
    const bh = document.documentElement.clientHeight - above_canvas.offsetHeight - below_canvas.offsetHeight - 20;
    scale = (bw < bh ? bw : bh) / 19;
    scale = MIN_SCALE < scale ? scale : MIN_SCALE;
    canvas.height = canvas.width = scale * 19;
    changeScale();
    drawBackGround();
    drawOrdersImm();
}

// ポインタの位置から机を計算
const calcPointed = e => {
    const x = e.offsetX;
    const y = e.offsetY;
    let x0, y0, x1, y1;
    // まずは直前の座標を確認
    if (pointed >= 0) {
        [x0, y0, , , x1, y1] = coo_siz[pointed];
        // ポインタの位置が変化していない
        if (x0 <= x && x < x1 && y0 <= y && y < y1) {
            return;
        }
    }
    pointed = -1;
    for (let i = 0; i < MAX_POPULATION; i++) {
        [x0, y0, , , x1, y1] = coo_siz[i];
        if (x0 <= x && x < x1 && y0 <= y && y < y1) {
            pointed = i;
            return;
        }
    }
}

// シード手入力ボタンのクリック時動作
const onManualSeedClick = () => {
    manual_seed_flag = manual_seed.classList.contains('active');
    seed_value.disabled = !manual_seed_flag;
}

const above_canvas = document.getElementById("above_canvas");
const below_canvas = document.getElementById("below_canvas");

const canvas_parent = document.getElementById("canvas_parent");
const canvas = document.getElementById("canvas");
const shuffle_button = document.getElementById("shuffle_button");

const manual_seed = document.getElementById("manual_seed");
const seed_value = document.getElementById("seed_value");

const all_attend_button = document.getElementById("all_attend_button");
const all_absent_button = document.getElementById("all_absent_button");

// シャッフルボタンのクリック時動作
shuffle_button.addEventListener("click", onShuffleClick);

// シード入力欄でEnterキーを押したとき, シャッフルを実行
seed_value.addEventListener("keyup", e => {
    if (e.key == "Enter") {
        // シャッフルボタンが無効の場合は実行しない
        if (!shuffle_button.disabled) {
            onShuffleClick();
        }
    }
});

// シード手入力ボタンのクリック時動作
manual_seed.addEventListener("click", onManualSeedClick);

// canvasのなにか
let ctx;

if (canvas.getContext) {
    ctx = canvas.getContext("2d");
    // ctx.globalCompositeOperation = "source-in";
    ctx.globalCompositeOperation = "source-over";

    canvas.addEventListener("mousemove", e => {
        if (running) {
            return;
        }
        const prev_pointed = pointed;
        calcPointed(e);

        if (prev_pointed == pointed) {
            return;
        } else if (prev_pointed >= 0) {
            drawTableAndOrder(prev_pointed, false);
        }
        if (pointed >= 0) {
            drawTableAndOrder(pointed, true);
        }
    });

    canvas.addEventListener("mouseout", () => {
        if (pointed == -1) {
            return;
        }
        drawTableAndOrder(pointed, false);
        pointed = -1;
    });

    canvas.addEventListener("click", e => {
        calcPointed(e);
        if (running || pointed < 0) {
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
    // リサイズ時の動作を指定
    window.addEventListener("resize", onWindowResize);
    // canvasサイズの初期化
    onWindowResize();
}

// 全選択, 全解除ともに同じ関数を呼び出す
const setAttendAll = b => {
    if (population && !confirm("順番をリセットしますか?")) {
        return;
    }
    attend = attend.map(() => b);
    initOrder();
    drawBackGround();
}

// 全選択
all_attend_button.addEventListener("click", () => {
    if (population == MAX_POPULATION) {
        return;
    }
    setAttendAll(true);
    shuffle_button.disabled = false;
});

// 全解除
all_absent_button.addEventListener("click", () => {
    setAttendAll(false);
    shuffle_button.disabled = true;
});

onManualSeedClick();
