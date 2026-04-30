const filterButtons = document.querySelectorAll(".header__filter");
const projects = document.querySelectorAll(".project");

if (filterButtons.length && projects.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const selectedFilter = button.getAttribute("data-filter");

      projects.forEach((project) => {
        if (selectedFilter === "all") {
          project.style.display = "";
        } else {
          const categories = project.getAttribute("data-category").split(" ");
          if (categories.includes(selectedFilter)) {
            project.style.display = "";
          } else {
            project.style.display = "none";
          }
        }
      });
    });
  });
}
