// Tab switching functionality
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs and tab contents
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((tc) => tc.classList.remove("active"));

    // Add active class to clicked tab
    tab.classList.add("active");

    // Show corresponding tab content
    const tabId = tab.getAttribute("data-tab");
    document.getElementById(`${tabId}-tab`).classList.add("active");
  });
});

// Article analysis
document.getElementById("analyze-article").addEventListener("click", () => {
  const title = document.getElementById("article-title").value;
  const content = document.getElementById("article-content").value;

  if (!title.trim() || !content.trim()) {
    alert("Please enter both title and content");
    return;
  }

  const resultDiv = document.getElementById("article-result");
  resultDiv.className = "result analyzing";
  resultDiv.style.display = "block";
  document.getElementById("article-result-title").textContent = "Analyzing...";
  document.getElementById("article-result-text").innerHTML =
    '<div class="loader"></div>';
  document.getElementById("article-confidence").textContent = "";

  // Simulate analysis with timeout
  setTimeout(() => {
    // This is a mock analysis - in a real implementation, you would call an API
    const isFake = Math.random() > 0.5;
    const confidence = (Math.random() * 30 + 70).toFixed(2);

    resultDiv.className = isFake ? "result fake" : "result true";
    document.getElementById("article-result-title").textContent = isFake
      ? "Potential Fake News Detected"
      : "Article Appears Legitimate";

    let resultText = "";
    if (isFake) {
      resultText = `
                        <p>Our analysis suggests this article may contain misleading information.</p>
                        <p><strong>Reasons for suspicion:</strong></p>
                        <ul>
                            <li>Sensationalist language detected</li>
                            <li>Lack of credible sources cited</li>
                            <li>Emotional manipulation indicators present</li>
                        </ul>
                        <p>We recommend verifying this information through trusted news sources.</p>
                    `;
    } else {
      resultText = `
                        <p>This article appears to be from a legitimate source with factual content.</p>
                        <p><strong>Positive indicators:</strong></p>
                        <ul>
                            <li>Neutral tone and factual language</li>
                            <li>Proper attribution to sources</li>
                            <li>Consistent with known facts</li>
                        </ul>
                        <p>Always verify information through multiple sources when possible.</p>
                    `;
    }

    document.getElementById("article-result-text").innerHTML = resultText;
    document.getElementById(
      "article-confidence"
    ).textContent = `Confidence: ${confidence}%`;
  }, 2000);
});

// Image analysis
document.getElementById("analyze-image").addEventListener("click", () => {
  const fileInput = document.getElementById("image-upload");
  const urlInput = document.getElementById("image-url").value;

  if (!fileInput.files[0] && !urlInput.trim()) {
    alert("Please upload an image or enter an image URL");
    return;
  }

  const resultDiv = document.getElementById("image-result");
  resultDiv.className = "result analyzing";
  resultDiv.style.display = "block";
  document.getElementById("image-result-title").textContent = "Analyzing...";
  document.getElementById("image-result-text").innerHTML =
    '<div class="loader"></div>';
  document.getElementById("image-confidence").textContent = "";

  // Simulate analysis with timeout
  setTimeout(() => {
    // This is a mock analysis - in a real implementation, you would use image analysis APIs
    const isManipulated = Math.random() > 0.6;
    const confidence = (Math.random() * 30 + 70).toFixed(2);

    resultDiv.className = isManipulated ? "result fake" : "result true";
    document.getElementById("image-result-title").textContent = isManipulated
      ? "Image Manipulation Detected"
      : "Image Appears Authentic";

    let resultText = "";
    if (isManipulated) {
      resultText = `
                        <p>Our analysis suggests this image may have been digitally altered.</p>
                        <p><strong>Indicators of manipulation:</strong></p>
                        <ul>
                            <li>Inconsistent lighting patterns detected</li>
                            <li>Edge artifacts suggesting copy-paste operations</li>
                            <li>Metadata inconsistencies</li>
                        </ul>
                        <p>This image should be verified through reverse image search or other verification tools.</p>
                    `;
    } else {
      resultText = `
                        <p>This image appears to be authentic with no obvious signs of manipulation.</p>
                        <p><strong>Positive indicators:</strong></p>
                        <ul>
                            <li>Consistent lighting and shadows</li>
                            <li>No detectable cloning or airbrushing artifacts</li>
                            <li>Metadata appears consistent</li>
                        </ul>
                        <p>Always verify images through reverse image search when possible.</p>
                    `;
    }

    document.getElementById("image-result-text").innerHTML = resultText;
    document.getElementById(
      "image-confidence"
    ).textContent = `Confidence: ${confidence}%`;
  }, 2500);
});

// URL analysis
document.getElementById("analyze-url").addEventListener("click", () => {
  const url = document.getElementById("news-url").value;

  if (!url.trim()) {
    alert("Please enter a URL");
    return;
  }

  // Simple URL validation
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    alert("Please enter a valid URL starting with http:// or https://");
    return;
  }

  const resultDiv = document.getElementById("url-result");
  resultDiv.className = "result analyzing";
  resultDiv.style.display = "block";
  document.getElementById("url-result-title").textContent = "Analyzing...";
  document.getElementById("url-result-text").innerHTML =
    '<div class="loader"></div>';
  document.getElementById("url-confidence").textContent = "";

  // Simulate analysis with timeout
  setTimeout(() => {
    // This is a mock analysis - in a real implementation, you would check against known fake news databases
    const isFakeSource = Math.random() > 0.7;
    const confidence = (Math.random() * 30 + 70).toFixed(2);

    resultDiv.className = isFakeSource ? "result fake" : "result true";
    document.getElementById("url-result-title").textContent = isFakeSource
      ? "Suspicious Source Detected"
      : "Source Appears Legitimate";

    let resultText = "";
    if (isFakeSource) {
      resultText = `
                        <p>Our analysis suggests this source has a history of publishing misleading content.</p>
                        <p><strong>Reasons for concern:</strong></p>
                        <ul>
                            <li>Domain registered recently with privacy protection</li>
                            <li>Pattern of sensationalist headlines</li>
                            <li>Lack of transparency about ownership and editorial standards</li>
                        </ul>
                        <p>We recommend finding this information from more established news sources.</p>
                    `;
    } else {
      resultText = `
                        <p>This source appears to be legitimate with established editorial standards.</p>
                        <p><strong>Positive indicators:</strong></p>
                        <ul>
                            <li>Clear information about ownership and editorial team</li>
                            <li>Established domain history</li>
                            <li>Fact-checking policies in place</li>
                        </ul>
                        <p>Even with legitimate sources, always verify important claims through multiple outlets.</p>
                    `;
    }

    document.getElementById("url-result-text").innerHTML = resultText;
    document.getElementById(
      "url-confidence"
    ).textContent = `Confidence: ${confidence}%`;
  }, 3000);
});
