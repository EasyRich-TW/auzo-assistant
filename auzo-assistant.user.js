// ==UserScript==
// @name         AI 萬象大師 - 奧索助手 (一鍵安裝版)
// @namespace    http://tampermonkey.net/
// @version      3.0.1
// @description  在奧索賓果網頁側邊自動嵌入 AI 萬象大師，並自動擋廣告與彈窗
// @author       AI Master Team
// @match        https://lotto.auzo.tw/*
// @match        http://lotto.auzo.tw/*
// @match        https://*.auzo.tw/*
// @match        http://*.auzo.tw/*
// @updateURL    https://raw.githubusercontent.com/EasyRich-TW/auzo-assistant/master/auzo-assistant.user.js
// @downloadURL  https://raw.githubusercontent.com/EasyRich-TW/auzo-assistant/master/auzo-assistant.user.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. 設定區 ---
    const DEFAULT_APP_BASE_URL = "https://ai-omni-master.vercel.app";
    const DEFAULT_STORE_CODE = "A0001";
    const SIDEBAR_WIDTH = 400;

    const appBaseUrl = GM_getValue("appBaseUrl", DEFAULT_APP_BASE_URL);
    const storeCode = GM_getValue("storeCode", DEFAULT_STORE_CODE);

    // 註冊右鍵選單，方便修改設定
    GM_registerMenuCommand("設定 Vercel 網址", () => {
        const url = prompt("請輸入 Vercel 部署網址:", appBaseUrl);
        if (url) {
            GM_setValue("appBaseUrl", url.replace(/\/+$/, ""));
            location.reload();
        }
    });
    GM_registerMenuCommand("設定店家代號", () => {
        const code = prompt("請輸入店家代號:", storeCode);
        if (code) {
            GM_setValue("storeCode", code);
            location.reload();
        }
    });

    // --- 2. 樣式區 (CSS) ---
    GM_addStyle(`
        :root {
            --ai-master-sidebar-width: ${SIDEBAR_WIDTH}px;
        }

        html.ai-master-sidebar-open {
            width: calc(100vw - var(--ai-master-sidebar-width)) !important;
            max-width: calc(100vw - var(--ai-master-sidebar-width)) !important;
            overflow-x: auto !important;
        }

        html.ai-master-sidebar-open body {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            overflow-x: auto !important;
            box-sizing: border-box;
        }

        #ai-master-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: var(--ai-master-sidebar-width);
            height: 100vh;
            z-index: 2147483646;
            background: #1a1a2e;
            box-shadow: -5px 0 15px rgba(0, 0, 0, 0.45);
            border-left: 1px solid #30475e;
            overflow: hidden;
            transition: transform 0.25s ease;
            display: flex;
            flex-direction: column;
        }

        .ai-master-sidebar-header {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 12px 10px 16px;
            border-bottom: 1px solid #30475e;
            background: #16213e;
            user-select: none;
        }

        .ai-master-sidebar-title {
            color: #48dbfb;
            font-family: "Microsoft JhengHei", sans-serif;
            font-size: 14px;
            font-weight: bold;
        }

        #ai-master-sidebar iframe {
            flex: 1 1 auto;
            width: 100%;
            border: none;
            background: #1a1a2e;
        }

        /* 擋廣告樣式 */
        iframe[src*="googlesyndication"],
        iframe[src*="doubleclick"],
        iframe[src*="googleadservices"],
        ins.adsbygoogle,
        .adsbygoogle {
            display: none !important;
            visibility: hidden !important;
        }
    `);

    // --- 3. 擋廣告邏輯 ---
    const POPUP_KEYWORDS = ["尚未付費", "尚未付", "試用期已過", "試用已到期", "試用期滿", "請立即付費", "立即付費", "點此付費", "付費版", "購買方案", "續約方案", "訂閱方案", "開通會員", "付費提醒"];

    function hideElement(el) {
        if (!el || el.closest("#ai-master-sidebar") || el.getAttribute("data-ai-master-hidden") === "1") return;
        el.setAttribute("data-ai-master-hidden", "1");
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
    }

    function scanAds() {
        // 擋 Google 廣告
        document.querySelectorAll("ins.adsbygoogle, .adsbygoogle, iframe[src*='google']").forEach(hideElement);

        // 擋左右側邊長條廣告
        const pageWidth = document.documentElement.clientWidth || window.innerWidth;
        document.querySelectorAll("iframe, img").forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 40 || rect.height < 180 || rect.width > 220) return;
            if (rect.left <= 12 || rect.right >= pageWidth - 12) {
                hideElement(el.tagName === "IMG" ? (el.closest("a") || el) : el);
            }
        });

        // 擋付費彈窗
        document.querySelectorAll("div, section, aside, form, table").forEach(el => {
            const style = getComputedStyle(el);
            if (style.position !== "fixed" && style.position !== "absolute") return;
            const text = el.innerText || "";
            if (text.length < 500 && POPUP_KEYWORDS.some(k => text.includes(k))) {
                hideElement(el);
            }
        });
    }

    // --- 4. 側邊欄邏輯 ---
    function applyLayout() {
        document.documentElement.classList.add("ai-master-sidebar-open");
    }

    function mountSidebar() {
        if (document.getElementById("ai-master-sidebar")) return;

        const sidebar = document.createElement("aside");
        sidebar.id = "ai-master-sidebar";

        const header = document.createElement("div");
        header.className = "ai-master-sidebar-header";
        header.innerHTML = `<span class="ai-master-sidebar-title">✨ AI 萬象大師</span>`;

        const iframe = document.createElement("iframe");
        const url = new URL(appBaseUrl);
        url.searchParams.set("store", storeCode);
        iframe.src = url.toString();

        sidebar.appendChild(header);
        sidebar.appendChild(iframe);
        document.body.appendChild(sidebar);

        applyLayout();
    }

    // 啟動
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            mountSidebar();
            scanAds();
        });
    } else {
        mountSidebar();
        scanAds();
    }

    // 持續掃描廣告
    const observer = new MutationObserver(() => scanAds());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(scanAds, 4000);

})();
