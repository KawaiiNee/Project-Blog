const params = location.search;
const id = new URLSearchParams(params).get("id");

const main = document.querySelector(`[data-btn="main"]`);
const content = document.querySelector(`[data-btn="content"]`);
content.classList.remove("active");
content.href = `../html/editContent.html?id=${id}`;
main.href = `../html/editMain.html?id=${id}`;
main.classList.add("active");
document.querySelector(`[data-edit="dropdown"]`).textContent = main.textContent;

const token = sessionStorage.getItem("token");
const textarea = document.getElementById("editDescription");
const form = document.querySelector(`[data-form="edit-main"]`);
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const sourceCode = document.getElementById("sourceCode");
const setStatus = document.querySelector(`[data-btn="set-status"]`);

// TOAST notify
const toastLiveExample = document.getElementById("liveToast");

loadContent();

window.document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(
    '[data-form="edit-main"]'
  ).action = `/update-project-main-content/${id}?_method=PATCH`;
});

// allow tabs from textarea
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

async function loadContent() {
  try {
    const {
      data: {
        card: { name, description, sourceCode: sourceCodeLink, isCompleted },
      },
    } = await axios.get(`/get-project-card/${id}`);

    editTitle.value = name;
    editDescription.value = description;
    sourceCode.value = sourceCodeLink || "";
    setStatus.checked = isCompleted ? true : false;
  } catch (error) {
    console.log(error.response.data);
  }
}

function notify() {
  const toast = new bootstrap.Toast(toastLiveExample);
  toast.show();
}
