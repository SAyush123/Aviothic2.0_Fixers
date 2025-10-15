(function () {
  // UI elements
  const tabUrl = document.getElementById("tab-url");
  const tabEmail = document.getElementById("tab-email");
  const urlPanel = document.getElementById("url-panel");
  const emailPanel = document.getElementById("email-panel");
  const urlInput = document.getElementById("url-input");
  const emailInput = document.getElementById("email-input");
  const analyzeUrlBtn = document.getElementById("analyze-url");
  const analyzeEmailBtn = document.getElementById("analyze-email");
  const flagsDiv = document.getElementById("flags");
  const riskSummary = document.getElementById("riskSummary");
  const riskMeter = document.getElementById("riskMeter");
  const lastChecked = document.getElementById("lastChecked");
  const copyResultBtn = document.getElementById("copy-result");
  const showDomainBtn = document.getElementById("show-domain");
  const exampleUrlBtn = document.getElementById("example-url");
  const exampleEmailBtn = document.getElementById("example-email");
  const adviceDiv = document.getElementById("advice");

  function setTab(which) {
    if (which === "url") {
      tabUrl.classList.add("active");
      tabEmail.classList.remove("active");
      urlPanel.style.display = "block";
      emailPanel.style.display = "none";
    } else {
      tabUrl.classList.remove("active");
      tabEmail.classList.add("active");
      urlPanel.style.display = "none";
      emailPanel.style.display = "block";
    }
  }

  tabUrl.onclick = () => setTab("url");
  tabEmail.onclick = () => setTab("email");

  // Example data
  exampleUrlBtn.onclick = () => {
    urlInput.value =
      "http://192.0.2.123/~login/secure?user=abc%40example.com&redirect=https%3A%2F%2Fevil.com";
    urlInput.focus();
  };

  exampleEmailBtn.onclick = () => {
    emailInput.value =
      'From: "PayPal Security" <service.paypal-support@paypal-secure.com>\nReceived: from [192.168.1.105] (HELO suspicious-server)\nSubject: Urgent: Your account has been limited';
    emailInput.focus();
  };

  document.getElementById("clear-url").onclick = () => {
    urlInput.value = "";
    displayNoAnalysis();
  };

  document.getElementById("clear-email").onclick = () => {
    emailInput.value = "";
    displayNoAnalysis();
  };

  analyzeUrlBtn.onclick = () => {
    const text = urlInput.value.trim();
    if (!text) {
      showNotification("Please enter a URL to analyze.", "warn");
      return;
    }

    // Show loading state
    analyzeUrlBtn.innerHTML = '<div class="loading"></div> Analyzing...';
    analyzeUrlBtn.disabled = true;

    setTimeout(() => {
      const res = analyzeURL(text);
      renderResult(res, "url", text);

      // Reset button
      analyzeUrlBtn.innerHTML = '<i class="fas fa-search"></i> Analyze URL';
      analyzeUrlBtn.disabled = false;
    }, 800);
  };

  analyzeEmailBtn.onclick = () => {
    const text = emailInput.value.trim();
    if (!text) {
      showNotification("Please enter email content to analyze.", "warn");
      return;
    }

    // Show loading state
    analyzeEmailBtn.innerHTML = '<div class="loading"></div> Analyzing...';
    analyzeEmailBtn.disabled = true;

    setTimeout(() => {
      const res = analyzeEmail(text);
      renderResult(res, "email", text);

      // Reset button
      analyzeEmailBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Email';
      analyzeEmailBtn.disabled = false;
    }, 800);
  };

  copyResultBtn.onclick = () => {
    const txt = flagsDiv.innerText || "No result";
    navigator.clipboard
      ?.writeText(txt)
      .then(() => {
        showNotification("Analysis summary copied to clipboard!", "success");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = txt;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showNotification("Analysis summary copied to clipboard!", "success");
      });
  };

  showDomainBtn.onclick = () => {
    const last = flagsDiv.dataset.lastJson;
    if (!last) {
      showNotification(
        "No analysis results available. Please run an analysis first.",
        "warn"
      );
      return;
    }

    try {
      const j = JSON.parse(last);
      let domain = j.domain || j.parsedFromDomain || "—";
      showNotification(`Parsed domain: ${domain}`, "info");
    } catch (e) {
      showNotification("Error reading parsed data.", "error");
    }
  };

  function displayNoAnalysis() {
    riskSummary.innerText = "—";
    riskSummary.style.color = "";
    riskMeter.innerHTML = '<div class="risk-fill low"></div>';
    adviceDiv.className = "advice ok";
    adviceDiv.innerHTML =
      '<i class="fas fa-info-circle"></i> Enter content to analyze';
    flagsDiv.innerHTML =
      '<div class="small">Analysis results will appear here after scanning.</div>';
    delete flagsDiv.dataset.lastJson;
    lastChecked.innerText = "—";
  }

  displayNoAnalysis();

  // ---------- Heuristics ----------
  const suspiciousTLDs = ["tk", "ml", "ga", "cf", "gq", "xyz", "top"]; // common abused TLDs
  const disposableDomains = [
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "trashmail.com",
    "yopmail.com",
  ];
  const commonFreeDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "aol.com",
  ];

  function containsPunycode(host) {
    return /xn--/i.test(host);
  }

  function isIPAddress(host) {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
    if (/\:/.test(host) && /^[0-9a-fA-F:\.]+$/.test(host)) return true;
    return false;
  }

  function looksLikeCredentialInURL(url) {
    return /@/.test(url);
  }

  function excessiveEncodings(url) {
    const matches = url.match(/%[0-9A-Fa-f]{2}/g);
    return matches ? matches.length > 6 : false;
  }

  function longUrl(url) {
    return url.length > 120;
  }

  function hasSuspiciousWords(url) {
    const words = [
      "login",
      "secure",
      "account",
      "confirm",
      "verify",
      "update",
      "banking",
      "password",
      "ebay",
      "paypal",
      "appleid",
      "signin",
      "authenticate",
    ];
    const l = url.toLowerCase();
    return words.filter((w) => l.includes(w)).slice(0, 6);
  }

  function nonAscii(str) {
    return /[^\u0000-\u007f]/.test(str);
  }

  function domainFromHostname(host) {
    const parts = host.split(".");
    if (parts.length <= 2) return host;
    return parts.slice(-2).join(".");
  }

  // ---------- URL analyzer ----------
  function analyzeURL(input) {
    let score = 0;
    let flags = [];
    let notes = [];
    let parsedDomain = null;
    let host = null;
    let urlStr = input.trim();

    if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(urlStr)) {
      urlStr = "http://" + urlStr;
      notes.push("No protocol supplied — assumed http:// for analysis.");
    }

    let urlObj;
    try {
      urlObj = new URL(urlStr);
      host = urlObj.hostname;
    } catch (e) {
      flags.push({
        type: "risk",
        text: "Invalid URL format or unparsable URL.",
      });
      score += 80;
      return makeResult();
    }

    parsedDomain = domainFromHostname(host);

    if (isIPAddress(host)) {
      flags.push({ type: "risk", text: `Host is an IP address: ${host}` });
      score += 45;
    }

    if (containsPunycode(host) || nonAscii(host)) {
      flags.push({
        type: "risk",
        text: "Contains punycode or non-ASCII characters (possible homograph attack).",
      });
      score += 40;
    }

    if (host.split(".").length > 3) {
      flags.push({
        type: "susp",
        text: "Multiple subdomains (could be used to obfuscate real domain).",
      });
      score += 12;
    }

    const tld = host.split(".").slice(-1)[0].toLowerCase();
    if (suspiciousTLDs.includes(tld)) {
      flags.push({
        type: "susp",
        text: `Top-level domain ${tld} is commonly abused for malicious sites.`,
      });
      score += 18;
    }

    if (looksLikeCredentialInURL(input)) {
      flags.push({
        type: "risk",
        text: 'URL contains an "@" or credential-like pattern — may include username:password@host or redirect trick.',
      });
      score += 45;
    }

    if (excessiveEncodings(input)) {
      flags.push({
        type: "susp",
        text: "URL contains many percent-encodings — often used to hide payloads.",
      });
      score += 10;
    }

    if (longUrl(input)) {
      flags.push({
        type: "susp",
        text: `URL length is long (${input.length} chars) — long URLs are sometimes used to hide malicious paths.`,
      });
      score += 8;
    }

    const suspectWords = hasSuspiciousWords(
      host + " " + urlObj.pathname + " " + urlObj.search
    );
    if (suspectWords.length) {
      flags.push({
        type: "susp",
        text: `Contains suspicious keywords: ${suspectWords.join(", ")}`,
      });
      score += 10;
    }

    if (urlObj.port && !["80", "443", "8080", "8443"].includes(urlObj.port)) {
      flags.push({
        type: "susp",
        text: `Nonstandard port detected: ${urlObj.port}`,
      });
      score += 6;
    }

    if (/[?&](redirect|url|next|dest|u)=/i.test(urlObj.search)) {
      flags.push({
        type: "susp",
        text: "URL contains redirect parameters (redirect/next/url) — could be used to chain to malicious destination.",
      });
      score += 9;
    }

    const famous = [
      "paypal",
      "apple",
      "google",
      "amazon",
      "microsoft",
      "bank",
      "secure",
      "facebook",
    ];
    for (const f of famous) {
      if (
        host.includes(f) &&
        !host.endsWith(f + ".com") &&
        !host.includes(f + ".")
      ) {
        flags.push({
          type: "susp",
          text: `Host contains brand-like token '${f}' but does not belong to official domain — possible impersonation.`,
        });
        score += 14;
        break;
      }
    }

    if (flags.length === 0) {
      flags.push({
        type: "ok",
        text: "No obvious heuristic red-flags found in the URL.",
      });
      score = Math.max(0, score - 10);
    }

    return makeResult();

    function makeResult() {
      score = Math.min(100, Math.max(0, score));
      return {
        input: input,
        url: urlStr,
        host,
        domain: parsedDomain,
        score,
        flags,
        notes,
      };
    }
  }

  // ---------- Email analyzer ----------
  function analyzeEmail(text) {
    let score = 0;
    let flags = [];
    let notes = [];
    let parsedFrom = null;
    let parsedFromDomain = null;

    const mFrom = text.match(/^[Ff]rom:\s*(.+)$/m);
    if (mFrom) {
      parsedFrom = mFrom[1].trim();
    } else {
      const mAny = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      if (mAny) parsedFrom = mAny[0];
    }

    if (!parsedFrom) {
      flags.push({
        type: "susp",
        text: "Could not detect a From header or email address in the provided text.",
      });
      score += 30;
      return finalize();
    }

    const addrMatch = parsedFrom.match(/<\s*([^>]+)\s*>/);
    const rawAddr = addrMatch ? addrMatch[1] : parsedFrom;
    const emailMatch = rawAddr.match(/^([^@\s]+)@([^@\s]+)$/);
    if (!emailMatch) {
      flags.push({
        type: "susp",
        text: "From header not in expected display <address@example.com> format.",
      });
      score += 20;
      return finalize();
    }

    const local = emailMatch[1];
    const domain = emailMatch[2].toLowerCase();
    parsedFromDomain = domain;

    if (disposableDomains.includes(domain)) {
      flags.push({
        type: "risk",
        text: `Sender domain is a known disposable domain: ${domain}`,
      });
      score += 40;
    }

    if (commonFreeDomains.includes(domain)) {
      flags.push({
        type: "susp",
        text: `Sender uses a free email provider (${domain}) — check if that matches expected sender.`,
      });
      score += 12;
    }

    if (local.length > 64 || local.split(".").length > 5) {
      flags.push({
        type: "susp",
        text: "Unusually long or complex local-part in email address.",
      });
      score += 8;
    }

    const brands = ["paypal", "bank", "apple", "amazon", "microsoft", "google"];
    for (const b of brands) {
      if (
        domain.includes(b) &&
        !domain.endsWith(b + ".com") &&
        !domain.includes(b + ".")
      ) {
        flags.push({
          type: "susp",
          text: `Sender domain contains brand-like token '${b}' but may not be official domain — possible impersonation.`,
        });
        score += 18;
        break;
      }
    }

    if (/Received:/i.test(text)) {
      const recs = text.match(/Received:.+/gi) || [];
      for (const r of recs) {
        if (
          /\[?\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]?/.test(r) &&
          !r.toLowerCase().includes(domain)
        ) {
          flags.push({
            type: "susp",
            text: "Received header shows an IP-based hop unrelated to the sender domain.",
          });
          score += 10;
          break;
        }
      }
    } else {
      notes.push("No Received headers provided for deeper analysis.");
    }

    const displayNameMatch = parsedFrom.match(/^"([^"]+)"/);
    if (displayNameMatch) {
      const name = displayNameMatch[1];
      if (/https?:\/\//i.test(name) || /@.+\..+/.test(name)) {
        flags.push({
          type: "risk",
          text: "Display name contains a URL or email — suspicious (may be spoofed).",
        });
        score += 25;
      }
    }

    if (containsPunycode(domain) || nonAscii(domain)) {
      flags.push({
        type: "risk",
        text: "Domain contains punycode or non-ASCII characters (homograph risk).",
      });
      score += 40;
    }

    if (isIPAddress(domain)) {
      flags.push({ type: "risk", text: "Sender domain is an IP address." });
      score += 45;
    }

    if (flags.length === 0) {
      flags.push({
        type: "ok",
        text: "No obvious heuristic red-flags found in the sender address/headers.",
      });
      score = Math.max(0, score - 10);
    }

    return finalize();

    function finalize() {
      score = Math.min(100, Math.max(0, score));
      return { input: text, parsedFrom, parsedFromDomain, score, flags, notes };
    }
  }

  // ---------- Render ----------
  function renderResult(res, type, originalInput) {
    flagsDiv.dataset.lastJson = JSON.stringify(res);
    lastChecked.innerText = new Date().toLocaleString();

    // build summary HTML
    let html = "";
    if (type === "url") {
      html += `<div class="small"><strong>URL:</strong> <span style="word-break:break-all">${escapeHtml(
        res.input
      )}</span></div>`;
      html += `<div class="meta small">Parsed host: <strong>${escapeHtml(
        res.host || "—"
      )}</strong> — domain: <strong>${escapeHtml(
        res.domain || "—"
      )}</strong></div>`;
    } else {
      html += `<div class="small"><strong>From:</strong> <span style="word-break:break-all">${escapeHtml(
        res.parsedFrom || "—"
      )}</span></div>`;
      html += `<div class="meta small">Parsed domain: <strong>${escapeHtml(
        res.parsedFromDomain || "—"
      )}</strong></div>`;
    }

    html += '<hr style="border:none; height:8px; margin: 16px 0;">';

    // flags list
    for (const f of res.flags) {
      const cls =
        f.type === "risk"
          ? "flag risk"
          : f.type === "susp"
          ? "flag susp"
          : "flag ok";
      const icon =
        f.type === "risk"
          ? "fas fa-exclamation-triangle"
          : f.type === "susp"
          ? "fas fa-exclamation-circle"
          : "fas fa-check-circle";
      html += `<div class="${cls}"><div><i class="${icon}"></i> ${escapeHtml(
        f.text
      )}</div><div style="font-size:12px; color:var(--muted)">${f.type.toUpperCase()}</div></div>`;
    }

    if (res.notes && res.notes.length) {
      html += `<div class="meta small" style="margin-top:16px"><strong>Notes:</strong><ul style="margin:8px 0 0 20px">`;
      for (const n of res.notes) html += `<li>${escapeHtml(n)}</li>`;
      html += `</ul></div>`;
    }

    flagsDiv.innerHTML = html;

    // set risk summary and advice
    const score = res.score;
    riskSummary.innerText = `${score} / 100`;

    // Update risk meter
    let riskLevel = "low";
    let riskFillClass = "low";
    let adviceText = "";
    let adviceIcon = "";

    if (score >= 70) {
      riskSummary.style.color = "var(--danger)";
      riskLevel = "HIGH RISK";
      riskFillClass = "critical";
      adviceDiv.className = "advice risk";
      adviceText =
        "HIGH RISK — Likely malicious. Do NOT visit this link or interact with this email.";
      adviceIcon = "fas fa-radiation";
    } else if (score >= 40) {
      riskSummary.style.color = "var(--warn)";
      riskLevel = "MEDIUM RISK";
      riskFillClass = "high";
      adviceDiv.className = "advice susp";
      adviceText =
        "MEDIUM RISK — Suspicious elements detected. Exercise caution.";
      adviceIcon = "fas fa-exclamation-triangle";
    } else {
      riskSummary.style.color = "var(--good)";
      riskLevel = "LOW RISK";
      riskFillClass = "low";
      adviceDiv.className = "advice ok";
      adviceText =
        "LOW RISK — No obvious threats detected. Standard precautions advised.";
      adviceIcon = "fas fa-shield-alt";
    }

    riskMeter.innerHTML = `<div class="risk-fill ${riskFillClass}"></div>`;
    adviceDiv.innerHTML = `<i class="${adviceIcon}"></i> ${adviceText}`;

    // Show notification with risk level
    showNotification(
      `Analysis complete: ${riskLevel}`,
      score >= 70 ? "error" : score >= 40 ? "warn" : "success"
    );
  }

  // Helper function to show notifications
  function showNotification(message, type = "info") {
    // Remove existing notification if any
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
                    <div class="notification-content">
                        <i class="fas fa-${
                          type === "error"
                            ? "exclamation-circle"
                            : type === "warn"
                            ? "exclamation-triangle"
                            : type === "success"
                            ? "check-circle"
                            : "info-circle"
                        }"></i>
                        <span>${message}</span>
                    </div>
                `;

    // Add styles for notification
    const style = document.createElement("style");
    style.textContent = `
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 16px 20px;
                        border-radius: 10px;
                        color: white;
                        font-weight: 600;
                        z-index: 1000;
                        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                        max-width: 400px;
                    }
                    .notification.info { background: var(--gradient-primary); }
                    .notification.success { background: var(--gradient-success); }
                    .notification.warn { background: linear-gradient(135deg, #f59e0b, #d97706); }
                    .notification.error { background: var(--gradient-danger); }
                    .notification-content {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  // small helper
  function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  // Expose functions for console testing (optional)
  window.PhishChecker = { analyzeURL, analyzeEmail };
})();
