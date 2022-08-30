const itemContainer = document.querySelector('[data-container="item-list"]');
const addStep = document.querySelector('[data-btn="add-item"]');
const deleteAll = document.querySelector(`[data-btn="delete-all"]`);
// toast for notifying delete & updates
const toastLiveExample = document.getElementById("liveToast");
const toastBody = document.querySelector('[data-notify="toast-body"]');
const toastHeader = document.querySelector('[data-notify="toast-header"]');
const toastDelete = document.querySelector('[data-notify="delete"]');
const toastSuccess = document.querySelector('[data-notify="success"]');

const params = location.search;
const id = new URLSearchParams(params).get("id");
const token = sessionStorage.getItem("token");
let addingItem = false;
let title = `Step `;

// dropdown links
const main = document.querySelector(`[data-btn="main"]`);
const content = document.querySelector(`[data-btn="content"]`);
main.href = `../html/editMain.html?id=${id}`;
main.classList.remove("active");
content.href = `../html/editContent.html?id=${id}`;
content.classList.add("active");
document.querySelector(`[data-edit="dropdown"]`).textContent =
  content.textContent;

// load all content
loadContent();

// adding a step container
addStep.addEventListener("click", async () => {
  // to be stored in the database
  const stepItemsNum =
    document.querySelectorAll('[data-item="step"]').length + 1;

  // automate setting titles
  const tempTitle = title + stepItemsNum;
  const description = "";
  const image = "";
  const descriptionContent = "";

  // if adding is still on process, don't include new item (this results duplication)
  if (!addingItem) {
    addingItem = true;
    addStepToDB(tempTitle, description, image, descriptionContent);
  }
});

// adding step to the database
async function addStepToDB(title, description, image, descriptionContent) {
  try {
    // get array data from the database
    const {
      data: {
        card: { stepTitle, stepDescription, stepImage, stepDescriptionContent },
      },
    } = await axios.get(`/get-project-card/${id}`);

    // update data
    const {
      data: {
        card: { stepTitle: newTitle, stepDescription: newDescription },
      },
    } = await axios.patch(
      `/update-project-content/${id}`,
      {
        stepTitle: [...stepTitle, title],
        stepDescription: [...stepDescription, description],
        stepImage: [...stepImage, image],
        stepDescriptionContent: [...stepDescriptionContent, descriptionContent],
      },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );

    // creating markup based from the recent data
    itemContainer.innerHTML += markUp(
      newTitle.length,
      newTitle[newTitle.length - 1],
      newDescription[newDescription.length - 1]
    );

    // notice that adding an item is finished
    addingItem = false;

    loadContent();

    notify("success", "Item added successfully");
  } catch (error) {
    console.log(error);
  }
}

// delete step
itemContainer.addEventListener("click", async (e) => {
  const el = e.target;

  // the step parent element (to fetch position dataset)
  const stepItem = el.parentElement.parentElement.parentElement;
  // step item pos minus 1 (for indexing)
  const stepItemPosition = Number(stepItem.dataset.position);
  if (el.dataset.btn === "deleteStep") {
    const confirmDelete = confirm("Delete this step?");
    if (confirmDelete) {
      try {
        // fetch data
        const {
          data: {
            card: {
              stepTitle,
              stepDescription,
              stepImage,
              stepDescriptionContent,
            },
          },
        } = await axios.get(`/get-project-card/${id}`);

        // delete the image (if any) in this step
        await axios.put(
          `/delete-project-image/${id}`,
          {
            stepImage: [stepImage[stepItemPosition]],
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );

        // update data (delete)
        await axios.patch(
          `/update-project-content/${id}`,
          {
            // delete element at the position x (provided by data-position dataset)
            stepTitle: refreshAfterDelete(
              filterDeletedItem(stepTitle, stepItemPosition)
            ),
            stepDescription: filterDeletedItem(
              stepDescription,
              stepItemPosition
            ),
            stepImage: filterDeletedItem(stepImage, stepItemPosition),
            stepDescriptionContent: filterDeletedItem(
              stepDescriptionContent,
              stepItemPosition
            ),
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );

        // reload to update the step content
        loadContent();
        // notify the item that has been deleted (refer to bootstrap *toast*)

        notify("delete", `Step ${stepItemPosition + 1} has been deleted`);
      } catch (error) {
        console.log(error);
      }
    }
  }
});

// delete all step
deleteAll.onclick = async () => {
  const confirmDelete = confirm("Delete all step(s)?");
  if (confirmDelete) {
    try {
      // fetch data
      const {
        data: {
          card: { stepImage },
        },
      } = await axios.get(`/get-project-card/${id}`);
      // delete all images (if any) in the whole project
      await axios.put(
        `/delete-project-image/${id}`,
        {
          stepImage: stepImage,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      await axios.patch(
        `/update-project-content/${id}`,
        {
          // delete all steps
          stepTitle: [],
          stepDescription: [],
          stepImage: [],
          stepDescriptionContent: [],
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      // refreshes markup
      loadContent();

      // notify that all item's been deleted
      notify("delete", `All items deleted`);
    } catch (error) {
      console.log(error);
    }
  }
};

// load all content function
async function loadContent() {
  try {
    const {
      data: {
        card: { stepTitle, stepDescription },
      },
    } = await axios.get(`/get-project-card/${id}`);

    if (stepTitle.length) {
      itemContainer.innerHTML = stepTitle
        .map((_, index) => {
          return markUp(index + 1, stepTitle[index], stepDescription[index]);
        })
        .join("");
    } else itemContainer.innerHTML = "<p> Content currently empty :( </p>";
  } catch (error) {
    console.log(error);
  }
}

// creates markup
function markUp(stepNum, title, description) {
  return `<div data-item="step" data-position="${stepNum - 1}"><li
    class="list-group-item d-flex justify-content-between align-items-center"
  >
    <div class="ms-2 me-auto">
      <div class="fw-bold h6">${title}</div>
      <p style="font-size: 0.8rem">${description}</p>
    </div>
    <!-- BUTTONS -->
    <div class="d-flex gap-2">
    <a href="../html/editProjectContent.html?id=${id}&step=${stepNum}" class="text-reset text-decoration-none">
      <button type="button" class="btn btn-warning active-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-pencil-square"
            viewBox="0 0 16 16"
          >
            <path
              d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
            />
            <path
              fill-rule="evenodd"
              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
            />
          </svg>
          Edit
      </button>
    </a>
      <button type="button" class="btn btn-danger active-btn" data-btn="deleteStep">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-trash3-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"
            />
          </svg>
          Delete
      </button>
    </div>
  </li></div>`;
}

// removes certain element at an array (to be return and updated to the database)
function filterDeletedItem(arr, position) {
  return arr.reduce((total, current, index) => {
    if (index !== position) total = [...total, current];
    return total;
  }, []);
}

// overwrites/updates step title after a step has been deleted
function refreshAfterDelete(titles) {
  return titles.map((_, index) => {
    return title + (index + 1);
  });
}

// toast updates
function notify(status, body) {
  toastDelete.style.display = "inline-block";
  toastSuccess.style.display = "none";
  toastHeader.textContent = "Item Deleted";
  toastHeader.classList.remove("text-success");
  toastHeader.classList.add("text-danger");
  if (status === "success") {
    toastSuccess.style.display = "inline-block";
    toastDelete.style.display = "none";
    toastHeader.textContent = "Added Successfully ";
    toastHeader.classList.remove("text-danger");
    toastHeader.classList.add("text-success");
  }
  toastBody.textContent = body;
  const toast = new bootstrap.Toast(toastLiveExample);
  toast.show();
}
