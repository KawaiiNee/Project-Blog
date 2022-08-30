const params = location.search;
const id = new URLSearchParams(params).get("id");
const stepNumber = new URLSearchParams(params).get("step");
const token = sessionStorage.getItem("token");
// replaces the current resource with the one at the provided URL

const title = document.querySelector('[data-header="title"]');
const updateContent = document.querySelector('[data-form="update-content"]');
const textarea = document.querySelector("#contentEditing");
const photo = document.querySelector('[data-btn="add-photo"]');

// toast when a step's been deleted
const toastLiveExample = document.getElementById("liveToast");
const toastBody = document.querySelector(".toast-body");

// loads the data
loadContent();

// make a link for the form to submit to
// i dont use ejs, so yah need to do this
window.document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(
    '[data-form="update-content"]'
  ).action = `/update-project-content/${id}/${stepNumber}?_method=PUT`;
});

// inserting the updated element to the array based from what step number it is
function insertItemIntoArray(arr, pos, val) {
  return arr.map((item, index) => {
    if (index === Number(pos - 1)) {
      item = val;
    }
    return item;
  });
}

async function loadContent() {
  const stepIndex = Number(stepNumber) - 1;
  try {
    const {
      data: {
        card: { stepTitle, stepDescriptionContent, stepImage },
      },
    } = await axios.get(`/get-project-card/${id}`);

    // updates the markup
    // !---capitalize first letter---!
    let text = stepDescriptionContent[stepIndex];
    text = text.charAt(0).toUpperCase() + text.slice(1);
    textarea.textContent = text;
    title.textContent = stepTitle[stepIndex];
  } catch (error) {
    console.log(error);
  }
}

//

// extraneous js

//

const back = document.querySelector('[data-btn="back"]');

// going back link (back)
back.onclick = async () => {
  location.replace(`../html/editContent.html?id=${id}`);
};

// allows tabs in textarea
textarea.addEventListener("keydown", function (e) {
  if (e.key == "Tab") {
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    this.value =
      this.value.substring(0, start) + "\t" + this.value.substring(end);

    // put caret at right position again
    this.selectionStart = this.selectionEnd = start + 1;
  }
});

// updateContent.addEventListener("submit", (e) => {
//   e.preventDefault();
//   console.log(photo.attributes);
//   // notify();
// });

// function notify() {
//   const toast = new bootstrap.Toast(toastLiveExample);
//   toast.show();
// }
