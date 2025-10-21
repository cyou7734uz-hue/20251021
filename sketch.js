let objs = [];
let colors = ['#DE183C', '#F2B541', '#00aeff', '#19446B', '#019b83', '#0000e6', '#ffdd00'];

let menu = {
    lineX: 8,
    lineY: 8,
    lineW: 8,         // 加寬白色直線，方便觸碰
    lineH: 100,       // 直線高度增加
    pad: 12,          // 內距增加
    width: 240,       // 選單寬度放大
    itemHeight: 42,   // 選單項目高度放大
    items: ['作品一', '作品二', '作品三'],
    visible: false
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    let cx = width / 2;
    let cy = height / 2;
    let num = 35;
    // 使用畫面較小邊長，確保格子為正方形並能置中
    let w = min(width, height) / num;
    let gridW = w * num;
    let startX = cx - gridW / 2 + w / 2;
    let startY = cy - gridW / 2 + w / 2;

    for (let i = 0; i < num; i++) {
        for (let j = 0; j < num; j++) {
            let x = startX + i * w;
            let y = startY + j * w;
            let dst = dist(x, y, cx, cy);
            let maxDst = sqrt(sq(gridW / 2) + sq(gridW / 2));
            let t = int(map(dst, 0, maxDst, -50, 0));
            for (let k = 0; k < 3; k++) {
                objs.push(new MJRC(x, y, w, t));
            }
        }
    }
    objs.sort((a, b) => {
        let c = dist(a.x, a.y, cx, cy);
        let d = dist(b.x, b.y, cx, cy);
        return c - d;
    });
}

function draw() {
    push();
    translate(width / 2, height / 2);
    scale(0.7);
    translate(-width / 2, -height / 2);
    background(0);
    for (let i of objs) {
        i.show();
        i.move();
    }
    pop();

    // Draw overlay UI (line + menu) on top
    drawMenu();

    // 中央文字（最上層）
    drawCenterText();
}

// 新增：在畫面中央顯示兩行文字（教科系 / 414730530  陳宥縈）
function drawCenterText() {
    let sz = 80;                     // 字大小 80px
    push();
    textAlign(CENTER, CENTER);
    textSize(sz);
    textLeading(sz * 1.05);          // 行距
    stroke(0);
    strokeWeight(max(2, sz * 0.06)); // 黑色描邊
    fill(255);                       // 白色字
    text('教科系\n414730530  陳宥縈', width / 2, height / 2);
    pop();
}


function easeInOutCirc(x) {
    return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

class MJRC {
    constructor(x, y, w, t) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = w;
        this.cr = 0;

        this.x0 = x;
        this.y0 = y;
        this.w0 = w;
        this.h0 = w;
        this.cr0 = 0;

        this.x1 = this.x + this.w * random(-1, 1) * 5;
        this.y1 = this.y + this.w * random(-1, 1) * 5;
        this.w1 = this.w * random(0.25, 0.75);
        this.h1 = this.w1;
        this.cr1 = max(this.w1, this.h1);
        this.a0 = 0;
        this.a1 = random(-1, 1) * TAU;
        this.a = 0;

        this.alph0 = 0;
        this.alph1 = 255;
        this.alph = 0;

        this.t = t;
        this.t1 = 60;
        this.t2 = this.t1 + 60;
        this.t3 = this.t2 + 80;

        this.col1 = color('#f0f0f0');
        this.init();
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.a);
        fill(this.col);
        noStroke();
        rect(0, 0, this.w, this.h, this.cr);
        pop();
    }

    move() {
        if (0 < this.t && this.t < this.t1) {
            let n = norm(this.t, 0, this.t1 - 1) ** 0.25;
            this.x = lerp(this.x0, this.x1, n);
            this.y = lerp(this.y0, this.y1, n);
            this.w = lerp(this.w0, this.w1, n);
            this.h = lerp(this.h0, this.h1, n);
            this.cr = lerp(this.cr0, this.cr1, n);
            this.a = lerp(this.a0, this.a1, n);
            this.col = lerpColor(this.col1, this.col2, n ** 0.5);
        }

        if (this.t1 < this.t && this.t < this.t2) {
            let n = norm(this.t, this.t1, this.t2 - 1) ** 4;
            this.x = lerp(this.x1, this.x0, n);
            this.y = lerp(this.y1, this.y0, n);
            this.w = lerp(this.w1, this.w0, n);
            this.h = lerp(this.h1, this.h0, n);
            this.cr = lerp(this.cr1, this.cr0, n);
            this.a = lerp(this.a1, this.a0, n);
            this.col = lerpColor(this.col2, this.col1, n** 2);
        }
        if (this.t > this.t3) {
            this.init();
            this.t = 0;
        }
        this.t++;
    }

    init(){
        this.x1 = this.x + this.w * random(-1, 1) * 5;
        this.y1 = this.y + this.w * random(-1, 1) * 5;
        this.w1 = this.w * random(0.25, 0.75);
        this.h1 = this.w1;
        this.cr1 = max(this.w1, this.h1);
        this.a0 = 0;
        this.a1 = random(-1, 1) * TAU;
        this.col2 = color(random(colors));
        this.col = this.col1;
    }

}

function drawMenu() {
    // 計算滑鼠是否在直線或選單範圍內
    let lineRect = {
        x: menu.lineX,
        y: menu.lineY,
        w: menu.lineW,
        h: menu.lineH
    };
    let menuX = menu.lineX + menu.lineW + 8;
    let menuY = menu.lineY;
    let menuH = menu.items.length * menu.itemHeight + menu.pad;
    let overLine = mouseX >= lineRect.x && mouseX <= lineRect.x + lineRect.w && mouseY >= lineRect.y && mouseY <= lineRect.y + lineRect.h;
    let overMenu = mouseX >= menuX && mouseX <= menuX + menu.width && mouseY >= menuY && mouseY <= menuY + menuH;
    // 選單顯示條件：滑鼠在白色直線或在選單內（方便操作）
    menu.visible = overLine || overMenu;

    noStroke();
    // 白色直線（固定顯示）
    push();
    rectMode(CORNER);
    fill(255);
    rect(lineRect.x, lineRect.y, lineRect.w, lineRect.h, 4);
    pop();

    // 若未顯示選單就結束
    if (!menu.visible) {
        cursor(ARROW);
        return;
    }

    // 選單背景（白色 50% 透明）
    push();
    rectMode(CORNER);
    fill(255, 128);
    stroke(200, 180);
    strokeWeight(0.5);
    rect(menuX, menuY, menu.width, menuH, 8);
    pop();

    // 文字
    push();
    textAlign(LEFT, CENTER);
    textSize(20);
    noStroke();
    for (let i = 0; i < menu.items.length; i++) {
        let iy = menuY + menu.pad / 2 + i * menu.itemHeight;
        let itemRect = {
            x: menuX,
            y: iy,
            w: menu.width,
            h: menu.itemHeight
        };
        let overItem = mouseX >= itemRect.x && mouseX <= itemRect.x + itemRect.w && mouseY >= itemRect.y && mouseY <= itemRect.y + itemRect.h;
        // 滑鼠移到文字變藍色，未接觸時為白色
        fill(overItem ? '#00aeff' : 255);
        text(menu.items[i], itemRect.x + 14, itemRect.y + itemRect.h / 2);
        if (overItem) cursor(HAND);
    }
    pop();
}

// --- 新增：iframe 顯示與選單點擊處理（含無法嵌入的 fallback） ---
let iframeOverlay = null;
let iframeEl = null;
const menuUrls = {
    '作品一': 'https://cyou7734uz-hue.github.io/20251014_2/',
    // 若 HackMD 或其他網站設定 X-Frame-Options: sameorigin，將無法嵌入，程式會自動在新分頁開啟
    '作品二': 'https://hackmd.io/@uM9ZdlN3RnGOuhjBWPMTbw/rylSlFu12xg'
};

function mousePressed() {
    // 若選單未顯示，忽略
    if (!menu.visible) return;

    // 計算選單項目位置（與 drawMenu 同步的計算）
    let menuX = menu.lineX + menu.lineW + 8;
    let menuY = menu.lineY;
    for (let i = 0; i < menu.items.length; i++) {
        let iy = menuY + menu.pad / 2 + i * menu.itemHeight;
        let itemRect = {
            x: menuX,
            y: iy,
            w: menu.width,
            h: menu.itemHeight
        };
        let overItem = mouseX >= itemRect.x && mouseX <= itemRect.x + itemRect.w && mouseY >= itemRect.y && mouseY <= itemRect.y + itemRect.h;
        if (overItem) {
            let key = menu.items[i];
            let url = menuUrls[key];
            if (!url) break;
            if (key === '作品一') {
                // 強制使用 iframe 顯示作品一
                openIframe(url);
            } else {
                // 其他作品直接在新分頁開啟（避免嵌入被阻擋）
                window.open(url, '_blank');
                showToast('在新分頁開啟：' + key);
            }
            break;
        }
    }
}

function openIframe(url) {
    closeIframe(); // 若已有則先關閉

    // 建立遮罩容器（cover）
    iframeOverlay = document.createElement('div');
    Object.assign(iframeOverlay.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        boxSizing: 'border-box'
    });
    // 點擊遮罩任一處關閉（但點擊 iframe 本身不會關閉）
    iframeOverlay.addEventListener('click', closeIframe);

    // 建立 iframe
    iframeEl = document.createElement('iframe');
    iframeEl.src = url;
    iframeEl.setAttribute('frameborder', '0');
    iframeEl.setAttribute('allowfullscreen', '');
    Object.assign(iframeEl.style, {
        width: Math.floor(window.innerWidth * 0.8) + 'px', // 寬為全螢幕的 80%
        height: Math.floor(window.innerHeight * 0.8) + 'px',
        borderRadius: '6px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        background: '#fff'
    });
    // 防止點擊 iframe 時觸發 overlay 點擊事件
    iframeEl.addEventListener('click', function (e) { e.stopPropagation(); });

    // 處理 iframe load / error：若網站以 X-Frame-Options 或 CSP 阻擋嵌入，會在 onload 後無法存取 contentDocument -> 視為被阻擋
    let loadHandled = false;
    iframeEl.addEventListener('load', function () {
        if (loadHandled) return;
        loadHandled = true;
        // 嘗試讀取 iframe 文件，若被同源策略或 X-Frame-Options 阻擋會拋錯
        try {
            // 嘗試存取 document（若成功表示可嵌入）
            let doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
            if (!doc) throw new Error('no doc');
            // 若可以存取但內容仍可能為錯誤頁面（404/403），無法可靠讀取狀態碼，故不作額外檢查
            // 正常嵌入：什麼都不做
        } catch (e) {
            // 無法嵌入，關閉 iframe 並在新分頁開啟
            closeIframe();
            window.open(url, '_blank');
            showToast('該網站不允許嵌入，已在新分頁開啟。');
        }
    }, { passive: true });

    iframeEl.addEventListener('error', function () {
        if (loadHandled) return;
        loadHandled = true;
        closeIframe();
        window.open(url, '_blank');
        showToast('載入失敗，已在新分頁開啟。');
    });

    // 關閉按鈕
    let closeBtn = document.createElement('button');
    closeBtn.innerText = '×';
    Object.assign(closeBtn.style, {
        position: 'absolute',
        right: '28px',
        top: '28px',
        width: '42px',
        height: '42px',
        borderRadius: '22px',
        border: 'none',
        background: 'rgba(255,255,255,0.9)',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: 10000
    });
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeIframe(); });

    // 包一個容器以便放置按鈕（避免按鈕受 overlay 點擊關閉）
    let frameWrap = document.createElement('div');
    Object.assign(frameWrap.style, {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    frameWrap.appendChild(iframeEl);
    frameWrap.appendChild(closeBtn);
    iframeOverlay.appendChild(frameWrap);
    document.body.appendChild(iframeOverlay);

    // 在視窗大小改變時調整 iframe 大小
    window.addEventListener('resize', adjustIframeSize);
}

function adjustIframeSize() {
    if (!iframeEl) return;
    iframeEl.style.width = Math.floor(window.innerWidth * 0.8) + 'px';
    iframeEl.style.height = Math.floor(window.innerHeight * 0.8) + 'px';
}

function closeIframe() {
    if (iframeOverlay) {
        iframeOverlay.remove();
        iframeOverlay = null;
        iframeEl = null;
        window.removeEventListener('resize', adjustIframeSize);
    }
}

// 簡單 toast 提示（自動消失）
function showToast(msg, duration = 3000) {
    const id = 'embed-toast';
    // 若已有先移除
    const prev = document.getElementById(id);
    if (prev) prev.remove();

    let t = document.createElement('div');
    t.id = id;
    t.innerText = msg;
    Object.assign(t.style, {
        position: 'fixed',
        left: '50%',
        bottom: '6vh',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: '6px',
        zIndex: 10001,
        fontSize: '14px',
        maxWidth: '80vw',
        textAlign: 'center'
    });
    document.body.appendChild(t);
    setTimeout(() => {
        t.remove();
    }, duration);
}