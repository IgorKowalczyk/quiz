// const form = document.getElementById("selection");

document.addEventListener("click", (event) => {
 if (event.target.tagName == "BUTTON") {
  document.body.style.opacity = 0;
 }
 if (event.target.tagName == "BUTTON" && event.target.type == "submit") {
  event.preventDefault();
  document.body.style.opacity = 0;
  document.body.addEventListener("transitionend", () => {
   /* eslint-disable-next-line no-undef */
   if (form) form.submit();
  });
 }
 if (event.target.tagName !== "A" || event.target.target == "_blank" || event.target.classList == "anchor-link") return;
 event.preventDefault();
 var link = event.target;
 document.body.style.opacity = 0;
 document.body.addEventListener("transitionend", () => {
  location.href = link.href;
 });
});
