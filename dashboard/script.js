// Simple interactivity for category selection
document.querySelectorAll(".category-list li").forEach((item) => {
  item.addEventListener("click", function () {
    document
      .querySelector(".category-list li.active")
      .classList.remove("active");
    this.classList.add("active");
  });
});

// Search functionality
const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector(".search-bar button");

searchButton.addEventListener("click", function () {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    alert(`Searching for: ${searchTerm}`);
    // In a real application, this would filter the app cards
  }
});

searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchButton.click();
  }
});

// Toggle permission details
document.querySelectorAll(".permission-item").forEach((item) => {
  item.addEventListener("click", function () {
    this.classList.toggle("active");
  });
});
