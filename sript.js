document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
      var expanded = document.body.classList.contains("nav-open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  // Close mobile nav when a link is tapped
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });
  });

  // Application form: friendly inline confirmation instead of a real submit
  // (this is a static site — see the note in the README about wiring this
  // up to a real form backend such as Formspree, Netlify Forms, etc.)
  var form = document.getElementById("apply-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var confirmBox = document.getElementById("form-confirm");
      form.hidden = true;
      if (confirmBox) confirmBox.hidden = false;
      confirmBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
});

