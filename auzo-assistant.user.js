// ==UserScript==
// @name         AI 萬象大師 - 奧索助手 (一鍵安裝版)
// @namespace    http://tampermonkey.net/
// @version      3.1.3
// @noframes
// @description  在奧索賓果網頁側邊自動嵌入 AI 萬象大師，並自動擋廣告與彈窗
// @author       AI Master Team
// @match        https://lotto.auzo.tw/*
// @match        http://lotto.auzo.tw/*
// @match        https://*.auzo.tw/*
// @match        http://*.auzo.tw/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=auzo.tw
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top) return;
    if (window.__AI_MASTER_AUZO_SCRIPT__) return;
    window.__AI_MASTER_AUZO_SCRIPT__ = "3.1.3";

    const CHIP_ID = "ai-master-ad-chip-root";

    // --- 1. 設定區 ---
    const DEFAULT_APP_BASE_URL = "https://ai-omni-master.vercel.app";
    const DEFAULT_STORE_CODE = "Public";
    const ADMIN_PASSWORD = "se466920";
    const SIDEBAR_WIDTH = 400;

    function getStoreCode() {
        const code = String(GM_getValue("storeCode", DEFAULT_STORE_CODE) || DEFAULT_STORE_CODE).trim();
        return code || DEFAULT_STORE_CODE;
    }

    function maskStoreCode(code) {
        const len = Math.max(String(code || "").trim().length, 6);
        return "*".repeat(len);
    }

    function verifyAdminPassword(input) {
        return input === ADMIN_PASSWORD;
    }

    function promptAdminPassword() {
        const pwd = prompt("請輸入管理密碼：");
        if (pwd === null) return false;
        if (!verifyAdminPassword(pwd)) {
            alert("密碼錯誤");
            return false;
        }
        return true;
    }

    // 註冊右鍵選單，方便修改設定
    GM_registerMenuCommand("設定 Vercel 網址", () => {
        const appBaseUrl = GM_getValue("appBaseUrl", DEFAULT_APP_BASE_URL);
        const url = prompt("請輸入 Vercel 部署網址:", appBaseUrl);
        if (url) {
            GM_setValue("appBaseUrl", url.replace(/\/+$/, ""));
            location.reload();
        }
    });

    GM_registerMenuCommand(`店家代號：${maskStoreCode(getStoreCode())}（變更需密碼）`, () => {
        if (!promptAdminPassword()) return;
        const next = prompt("請輸入新的店家代號：");
        if (next === null) return;
        const trimmed = next.trim();
        if (!trimmed) {
            alert("店家代號不可為空");
            return;
        }
        GM_setValue("storeCode", trimmed);
        location.reload();
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

        #ai-master-ad-chip-root.ai-master-ad-chip {
            position: fixed;
            top: auto;
            bottom: auto;
            right: 16px;
            width: auto;
            max-width: 180px;
            height: auto;
            z-index: 2147483646;
            display: flex;
            flex-direction: column;
            background: #1a1a2e;
            border: 1px solid #30475e;
            border-left: none;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            padding: 12px 14px;
            gap: 6px;
            box-sizing: border-box;
        }

        .ai-master-ad-chip-title {
            color: #48dbfb;
            font-family: "Microsoft JhengHei", sans-serif;
            font-size: 13px;
            font-weight: bold;
            line-height: 1.3;
        }

        .ai-master-ad-chip-tagline {
            margin: 0;
            color: #8899a6;
            font-family: "Microsoft JhengHei", sans-serif;
            font-size: 11px;
            line-height: 1.35;
        }

        .ai-master-ad-chip-link {
            display: block;
            margin-top: 4px;
            padding: 6px 10px;
            border-radius: 6px;
            background: linear-gradient(45deg, #48dbfb, #00a8ff);
            color: #1a1a2e;
            font-family: "Microsoft JhengHei", sans-serif;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            text-decoration: none;
        }

        .ai-master-ad-chip-link:hover {
            opacity: 0.9;
            color: #1a1a2e;
        }

        .ai-master-ad-chip-hint {
            margin: 4px 0 0;
            color: #607080;
            font-family: "Microsoft JhengHei", sans-serif;
            font-size: 11px;
            line-height: 1.35;
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

    // --- 3. 擋廣告邏輯（與 extension/block-ads.js 同步）---
    const OUR_ROOT_SELECTORS = `#ai-master-sidebar, #${CHIP_ID}, #ai-master-sidebar-toggle`;

    const AD_IFRAME_SELECTORS = [
        "iframe[src*='googlesyndication']",
        "iframe[src*='doubleclick']",
        "iframe[src*='googleadservices']",
        "iframe[src*='adnxs']",
        "iframe[src*='criteo']",
        "iframe[src*='adservice']"
    ];

    const AD_CONTAINER_SELECTORS = [
        "ins.adsbygoogle",
        ".adsbygoogle",
        "[id*='google_ads_iframe']",
        "[class*='AdChoice']",
        "[id*='AdChoice']"
    ];

    const POPUP_KEYWORDS = [
        "尚未付費",
        "尚未付",
        "試用期已過",
        "試用已到期",
        "試用期滿",
        "請立即付費",
        "立即付費",
        "點此付費",
        "付費版",
        "購買方案",
        "續約方案",
        "訂閱方案",
        "開通會員",
        "付費提醒"
    ];

    let adDebounceTimer = null;
    let adScanScheduled = false;

    function isOurElement(el) {
        return !!el?.closest?.(OUR_ROOT_SELECTORS);
    }

    function hideElement(el) {
        if (!el || isOurElement(el) || el.getAttribute("data-ai-master-ui") === "ad-chip" || el.getAttribute("data-ai-master-hidden") === "1") return;
        el.setAttribute("data-ai-master-hidden", "1");
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("pointer-events", "none", "important");
    }

    function normalizeText(text) {
        return (text || "").replace(/\s+/g, "");
    }

    function matchesPopupText(text) {
        const normalized = normalizeText(text);
        if (!normalized || normalized.length > 500) return false;
        return POPUP_KEYWORDS.some((keyword) => normalized.includes(normalizeText(keyword)));
    }

    function parseAlpha(color) {
        if (!color || color === "transparent") return 0;
        const rgba = color.match(/rgba?\(([^)]+)\)/);
        if (!rgba) return color === "transparent" ? 0 : 1;
        const parts = rgba[1].split(",").map((part) => part.trim());
        if (parts.length === 4) return parseFloat(parts[3]) || 0;
        return 1;
    }

    function isOverlayCandidate(el) {
        if (isOurElement(el)) return false;

        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        if (style.position !== "fixed" && style.position !== "absolute") return false;

        const rect = el.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 60) return false;
        if (rect.width > window.innerWidth * 0.98 && rect.height > window.innerHeight * 0.98) {
            return false;
        }

        const zIndex = parseInt(style.zIndex, 10);
        const hasZIndex = Number.isFinite(zIndex) && zIndex >= 10;
        const pageWidth = document.documentElement.clientWidth || window.innerWidth;
        const coversViewport =
            rect.width >= pageWidth * 0.35 && rect.height >= window.innerHeight * 0.2;
        const centered =
            rect.left >= pageWidth * 0.05 &&
            rect.right <= pageWidth * 0.95;

        return hasZIndex && coversViewport && centered;
    }

    function isBackdrop(el) {
        if (isOurElement(el)) return false;

        const style = getComputedStyle(el);
        if (style.position !== "fixed" && style.position !== "absolute") return false;

        const rect = el.getBoundingClientRect();
        const coversScreen =
            rect.width >= window.innerWidth * 0.8 && rect.height >= window.innerHeight * 0.8;
        if (!coversScreen) return false;

        const alpha = parseAlpha(style.backgroundColor);
        const opacity = parseFloat(style.opacity);
        return alpha < 0.95 || opacity < 0.98;
    }

    function hideKnownAds() {
        [...AD_IFRAME_SELECTORS, ...AD_CONTAINER_SELECTORS].forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach(hideElement);
            } catch (_) {}
        });
    }

    function hideEdgeBanners() {
        const pageWidth = document.documentElement.clientWidth || window.innerWidth;

        document.querySelectorAll("iframe, img").forEach((el) => {
            if (isOurElement(el) || el.getAttribute("data-ai-master-hidden") === "1") return;

            const rect = el.getBoundingClientRect();
            if (rect.width < 40 || rect.height < 180 || rect.width > 220) return;

            const onFarLeft = rect.left <= 12;
            const onFarRight = rect.right >= pageWidth - 12;
            if (!onFarLeft && !onFarRight) return;

            if (el.tagName === "IFRAME") {
                hideElement(el);
                return;
            }

            if (el.tagName === "IMG" && rect.height >= 260) {
                hideElement(el.closest("a") || el);
            }
        });
    }

    function hidePopups() {
        document.querySelectorAll("div, section, aside, form, table").forEach((el) => {
            if (isOurElement(el) || el.getAttribute("data-ai-master-hidden") === "1") return;
            if (!isOverlayCandidate(el)) return;
            if (!matchesPopupText(el.innerText)) return;
            hideElement(el);
        });

        document.querySelectorAll("div, section, aside").forEach((el) => {
            if (isOurElement(el) || el.getAttribute("data-ai-master-hidden") === "1") return;
            if (!isBackdrop(el)) return;
            hideElement(el);
        });

        document.querySelectorAll(".ui-widget-overlay, .modal-backdrop, .popup-mask").forEach((el) => {
            if (isOurElement(el)) return;
            hideElement(el);
        });
    }

    function hideAds() {
        hideKnownAds();
        hideEdgeBanners();
        hidePopups();
    }

    function scheduleAdScan() {
        if (adDebounceTimer) {
            window.clearTimeout(adDebounceTimer);
        }

        adDebounceTimer = window.setTimeout(() => {
            adDebounceTimer = null;
            hideAds();
        }, 500);
    }

    function initAdBlocker() {
        const runInitial = () => {
            if (!document.body) return;
            hideAds();
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", runInitial);
        } else {
            runInitial();
        }

        const adObserver = new MutationObserver(() => scheduleAdScan());
        adObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        window.setInterval(() => {
            if (adScanScheduled) return;
            adScanScheduled = true;
            window.requestAnimationFrame(() => {
                adScanScheduled = false;
                hideAds();
            });
        }, 4000);
    }

    // --- 4. 側邊欄邏輯 ---
    function buildAppUrl() {
        const appBaseUrl = GM_getValue("appBaseUrl", DEFAULT_APP_BASE_URL);
        const trimmed = (appBaseUrl || "").trim().replace(/\/+$/, "");
        if (!trimmed) return null;
        try {
            const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
            url.searchParams.set("store", getStoreCode());
            return url.toString();
        } catch {
            return null;
        }
    }

    function isTvBingoPage() {
        const path = location.pathname.replace(/\/+$/, "") || "/";
        if (path === "/tv/bingo" || path.startsWith("/tv/bingo/")) return true;
        return /\/tv\/bingo(?:\/|$)/i.test(location.pathname);
    }

    function getCompactPageMode() {
        if (isTvBingoPage()) return "tv-bingo";
        const file = (location.pathname.split("/").pop() || "").toLowerCase();
        if (file === "rl.php") return "rl";
        if (file === "rk.php") return "rk";
        if (file === "analyes.php") {
            const params = new URLSearchParams(location.search);
            if (params.get("lotto") === "keno" && params.get("action") === "total_reduce_mantissa") {
                return "keno-mantissa";
            }
        }
        return null;
    }

    function getChipLayoutMode(pageMode) {
        if (pageMode === "rl") return "bottom-right";
        if (pageMode === "rk" || pageMode === "keno-mantissa") return "sponsor-top";
        if (pageMode === "tv-bingo") return "bottom-right";
        return "bottom-right";
    }

    function clearSidebarLayout() {
        document.documentElement.classList.remove("ai-master-sidebar-open");
        document.body?.classList.remove("ai-master-sidebar-open");
    }

    function removeAllOurUi() {
        document.querySelectorAll("#ai-master-sidebar, #ai-master-ad-chip-root").forEach((el) => el.remove());
        clearSidebarLayout();
    }

    function getAppHostname(appUrl) {
        try {
            return new URL(appUrl || DEFAULT_APP_BASE_URL).hostname;
        } catch {
            return "ai-omni-master.vercel.app";
        }
    }

    function removeFullSidebarOnCompactPage() {
        document.querySelectorAll("#ai-master-sidebar").forEach((el) => el.remove());
        clearSidebarLayout();
    }

    function findSponsorAuzoElement() {
        const matches = [];
        document.querySelectorAll("a, button, span, font, b, td, div").forEach((el) => {
            if (el.closest(`#${CHIP_ID}, #ai-master-sidebar`)) return;
            const text = (el.textContent || "").replace(/\s+/g, "");
            if (!text.includes("赞助奥索") && !text.includes("贊助奧索")) return;
            const rect = el.getBoundingClientRect();
            if (rect.width < 24 || rect.height < 12 || rect.bottom < 0) return;
            matches.push({ el, area: rect.width * rect.height });
        });
        if (!matches.length) return null;
        matches.sort((a, b) => a.area - b.area);
        return matches[0].el;
    }

    function positionChipBottomRight(chip, bottomPx) {
        chip.style.top = "auto";
        chip.style.left = "auto";
        chip.style.right = "16px";
        chip.style.bottom = `${bottomPx}px`;
    }

    function positionChipNearSponsor(chip) {
        const anchor = findSponsorAuzoElement();
        chip.style.bottom = "auto";
        chip.style.right = "auto";
        if (!anchor) {
            chip.style.top = "120px";
            chip.style.left = "auto";
            chip.style.right = "16px";
            return;
        }
        const rect = anchor.getBoundingClientRect();
        const gap = 10;
        let left = Math.round(rect.right + gap);
        let top = Math.round(rect.top);
        const chipW = chip.offsetWidth || 180;
        const chipH = chip.offsetHeight || 96;
        if (left + chipW > window.innerWidth - 8) {
            left = Math.max(8, window.innerWidth - chipW - 8);
        }
        top = Math.max(8, Math.min(top, window.innerHeight - chipH - 8));
        chip.style.top = `${top}px`;
        chip.style.left = `${left}px`;
    }

    function positionCompactChip(chip, layoutMode, pageMode) {
        if (!chip) return;
        if (layoutMode === "sponsor-top") {
            positionChipNearSponsor(chip);
            return;
        }
        const bottomPx = pageMode === "tv-bingo" ? 72 : 24;
        positionChipBottomRight(chip, bottomPx);
    }

    let chipPositionBound = false;
    function bindCompactChipPosition(chip, layoutMode, pageMode) {
        const run = () => positionCompactChip(chip, layoutMode, pageMode);
        run();
        requestAnimationFrame(run);
        setTimeout(run, 500);
        setTimeout(run, 1500);
        if (layoutMode !== "sponsor-top" || chipPositionBound) return;
        chipPositionBound = true;
        window.addEventListener("resize", run, { passive: true });
    }

    function buildCompactOpenUrl(appUrl, pageMode) {
        if (!appUrl) return null;
        try {
            const url = new URL(appUrl);
            url.searchParams.set("utm_source", pageMode.replace(/-/g, "_"));
            return url.toString();
        } catch {
            return appUrl;
        }
    }

    function createAdChip(appUrl, pageMode) {
        const sidebar = document.createElement("aside");
        sidebar.id = CHIP_ID;
        sidebar.className = "ai-master-ad-chip";
        sidebar.setAttribute("data-ai-master-ui", "ad-chip");
        sidebar.style.cssText =
            "position:fixed;z-index:2147483646;max-width:180px;background:#1a1a2e;border:1px solid #30475e;border-radius:10px;padding:12px 14px;box-shadow:0 4px 20px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:6px;box-sizing:border-box;";

        const title = document.createElement("div");
        title.className = "ai-master-ad-chip-title";
        title.textContent = "✨ AI 萬象大師";

        const tagline = document.createElement("p");
        tagline.className = "ai-master-ad-chip-tagline";
        tagline.textContent = "夢境解萬象 · 卜卦幸運號";

        sidebar.appendChild(title);
        sidebar.appendChild(tagline);

        if (appUrl) {
            const link = document.createElement("a");
            link.className = "ai-master-ad-chip-link";
            link.href = buildCompactOpenUrl(appUrl, pageMode);
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "開啟萬象大師 →";
            sidebar.appendChild(link);
        } else {
            const hint = document.createElement("p");
            hint.className = "ai-master-ad-chip-hint";
            hint.textContent = "請在油猴選單設定 Vercel 網址";
            sidebar.appendChild(hint);
        }

        return sidebar;
    }

    function suppressTvPageEmbeddedApps(appUrl) {
        if (!isTvBingoPage()) return;

        const appHost = getAppHostname(appUrl);
        removeFullSidebarOnCompactPage();

        document.querySelectorAll("iframe").forEach((frame) => {
            if (frame.closest(`#${CHIP_ID}`)) return;
            if (frame.getAttribute("data-ai-master-tv-suppressed") === "1") return;

            let srcHost = "";
            try {
                srcHost = new URL(frame.src || "", location.href).hostname;
            } catch {
                return;
            }
            if (srcHost !== appHost) return;

            const holder = frame.closest("#ai-master-sidebar") || frame.closest("aside") || frame.parentElement || frame;
            holder.setAttribute("data-ai-master-tv-suppressed", "1");
            holder.style.setProperty("display", "none", "important");
            holder.style.setProperty("visibility", "hidden", "important");
            holder.style.setProperty("pointer-events", "none", "important");
        });
    }

    let tvCleanupTimer = null;
    function scheduleTvPageCleanup(appUrl) {
        if (!isTvBingoPage()) return;
        const layoutMode = getChipLayoutMode("tv-bingo");
        const run = () => {
            suppressTvPageEmbeddedApps(appUrl);
            const chip = document.getElementById(CHIP_ID);
            if (chip) positionCompactChip(chip, layoutMode, "tv-bingo");
        };
        run();
        if (window.__AI_MASTER_TV_CLEANUP_OBSERVER) return;
        window.__AI_MASTER_TV_CLEANUP_OBSERVER = new MutationObserver(() => {
            clearTimeout(tvCleanupTimer);
            tvCleanupTimer = setTimeout(run, 300);
        });
        window.__AI_MASTER_TV_CLEANUP_OBSERVER.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function ensureOnlyCompactChip(appUrl, pageMode) {
        const layoutMode = getChipLayoutMode(pageMode);
        removeFullSidebarOnCompactPage();
        document.querySelectorAll(`#${CHIP_ID}`).forEach((el, i) => {
            if (i > 0) el.remove();
        });
        let chip = document.getElementById(CHIP_ID);
        if (!chip) {
            chip = createAdChip(appUrl, pageMode);
            document.body.appendChild(chip);
        }
        bindCompactChipPosition(chip, layoutMode, pageMode);
        if (pageMode === "tv-bingo") {
            suppressTvPageEmbeddedApps(appUrl);
            scheduleTvPageCleanup(appUrl);
        }
    }

    function applyLayout() {
        document.documentElement.classList.add("ai-master-sidebar-open");
    }

    function mountSidebar() {
        if (window.__AI_MASTER_MOUNTING) return;

        const pageMode = getCompactPageMode();
        const appUrl = buildAppUrl();

        if (pageMode) {
            window.__AI_MASTER_MOUNTING = true;
            try {
                ensureOnlyCompactChip(appUrl, pageMode);
            } finally {
                window.__AI_MASTER_MOUNTING = false;
            }
            return;
        }

        const existing = document.getElementById("ai-master-sidebar");
        if (existing) return;

        window.__AI_MASTER_MOUNTING = true;
        try {

        if (!appUrl) {
            const sidebar = document.createElement("aside");
            sidebar.id = "ai-master-sidebar";
            const header = document.createElement("div");
            header.className = "ai-master-sidebar-header";
            header.innerHTML = `<span class="ai-master-sidebar-title">✨ AI 萬象大師</span>`;
            const hint = document.createElement("p");
            hint.style.cssText = "padding:16px;color:#8899a6;font-size:13px;font-family:Microsoft JhengHei,sans-serif;";
            hint.textContent = "請在油猴選單設定 Vercel 網址";
            sidebar.appendChild(header);
            sidebar.appendChild(hint);
            document.body.appendChild(sidebar);
            applyLayout();
            return;
        }

        const sidebar = document.createElement("aside");
        sidebar.id = "ai-master-sidebar";

        const header = document.createElement("div");
        header.className = "ai-master-sidebar-header";
        header.innerHTML = `<span class="ai-master-sidebar-title">✨ AI 萬象大師</span>`;

        const iframe = document.createElement("iframe");
        iframe.src = appUrl;
        iframe.title = "AI 萬象大師";

        sidebar.appendChild(header);
        sidebar.appendChild(iframe);
        document.body.appendChild(sidebar);

        applyLayout();
        } finally {
            window.__AI_MASTER_MOUNTING = false;
        }
    }

    // 啟動
    initAdBlocker();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountSidebar);
    } else {
        mountSidebar();
    }

})();
