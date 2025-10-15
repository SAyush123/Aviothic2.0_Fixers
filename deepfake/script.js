// Animation for progress bars
document.addEventListener("DOMContentLoaded", function () {
  const progressBars = document.querySelectorAll(".progress");

  progressBars.forEach((bar) => {
    const width = bar.style.width;
    bar.style.width = "0";

    setTimeout(() => {
      bar.style.width = width;
    }, 500);
  });

  // Simulate construction activity
  const banner = document.querySelector(".construction-banner");
  setInterval(() => {
    banner.style.animation = "none";
    setTimeout(() => {
      banner.style.animation = "blink 2s infinite";
    }, 10);
  }, 5000);
});
