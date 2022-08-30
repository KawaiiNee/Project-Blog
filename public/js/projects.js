const projectCards = document.querySelector(".project-cards");

const postProject = document.querySelector('[data-btn="postProject"]');
const projectTitle = document.querySelector("#project-title");
const projectThumbnail = document.querySelector("#project-thumbnail");
const projectDescription = document.querySelector("#description");
const searchProject = document.querySelector(`[data-form="search"]`);
const signIn = document.querySelector(`[data-btn="sign-in"]`);
const completedProjects = document.querySelector(
  `[data-progress="completed-projects"]`
);
const completedProjectStatus = document.querySelector(
  `[data-progress="completed-project-status"]`
);
const pendingProjects = document.querySelector(
  `[data-progress="pending-projects"]`
);
const pendingProjectStatus = document.querySelector(
  `[data-progress="pending-project-status"]`
);

// LOAD CONTENT
loadContent();

// MAKE CARDS & LOAD CONTENT
async function loadContent(query = `/home/?`) {
  try {
    const { data } = await axios.get(query);
    projectCards.innerHTML = markUp(data);

    fillInProgress(data.cards);
  } catch (error) {
    projectCards.innerHTML = `<div class="col-12">${error}</div>`;
  }
}

// progress bar (completed/pending)
function fillInProgress(projects) {
  let completed,
    pending,
    projectsLength = projects.length;
  completed = projects.filter((project) => {
    return !!project.isCompleted;
  }).length;
  pending = projectsLength - completed;

  // progress bars
  completedProjects.style.width = `${(completed / projectsLength) * 100}%`;
  completedProjectStatus.textContent = `Completed Projects: ${completed}/${projectsLength}`;
  pendingProjects.style.width = `${(pending / projectsLength) * 100}%`;
  pendingProjectStatus.textContent = `Pending Projects: ${pending}/${projectsLength}`;
}

// search projects
searchProject.addEventListener("submit", (e) => {
  e.preventDefault();
  const el = e.currentTarget;
  const name = el.querySelector('input[name="name"]');
  let query = `/home/?`;
  let queryParams = [];

  // created this part in case i add some filtering functionality on search
  if (name.value) {
    queryParams = [...queryParams, `${name.name}=${name.value}`];
  }
  query += queryParams.join("&");
  loadContent(query);
});

// DELETE A PROJECT CARD
projectCards.addEventListener("click", async (e) => {
  const el = e.target;
  const token = sessionStorage.getItem("token");

  if (el.dataset.btn === "deleteCard") {
    const confirmDelete = confirm("Ya sure?");
    if (confirmDelete) {
      const id = el.dataset.id;
      try {
        await axios.delete(`/delete-project-card/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        loadContent();
      } catch (error) {
        console.log(error.response.data);
      }
    }
  }
});

// FORMAT CARD'S DESCRIPTION
function formatDescription(text) {
  // make the remaining text an ellipses if it exceeds over 64 characters
  const maxDescriptionLength = 128;
  if (text.length > maxDescriptionLength) {
    text = text.slice(0, maxDescriptionLength) + "....";
  }

  return text;
}

// ALSO FORMAT CARD'S DESCRIPTION
function formatDescriptionPeriod(text) {
  // adds a period at the end of string
  if (text[text.length - 1] !== ".") {
    text += ".";
  }
  return text;
}

// SIGN IN
signIn.onclick = (e) => {
  if (sessionStorage.getItem("token")) {
    if (confirm("Log out?")) {
      sessionStorage.clear();
    } else return false;
  }
  return;
};

// MAKE THE MARKUP
function markUp(data) {
  // hello greet
  const cards = data.cards;
  let isAuthorized = false;
  if (sessionStorage.getItem("token")) {
    isAuthorized = true;

    document.querySelector(
      `[data-greet="greet"]`
    ).textContent = `Hello ${sessionStorage.getItem("username")}!`;

    document.querySelector(
      `[data-profile="side-profile"]`
    ).textContent = `${sessionStorage.getItem("username")}`;

    document.querySelector(`[data-btn="post-project"]`).style =
      "display: block !important";

    signIn.textContent = "Log out";
  }

  if (!data.foundSomething) {
    return `
    <p> No project found </p>
    `;
  }

  return cards
    .map((card) => {
      const { name, thumbnail, description, _id: cardID, isCompleted } = card;
      return `<div class="col-12">
      <div class="card" data-content="project">
          <img
              src="${thumbnail}"
              class="card-img-top img-fluid"
              alt="..."
              style="
              object-fit: none;
              object-position: center;
              width: 100%;
              height: 200px;
              "
              data-content="image"
          />
          <div class="card-body">
              <h5 class="card-title">
              ${name}
              ${
                isCompleted
                  ? `<svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="currentColor"
              class="bi bi-check-circle-fill bg-light text-primary"
              viewBox="0 0 16 16"
            >
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
              />
            </svg>`
                  : `<svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="orange"
              class="bi bi-clock-fill bg-light text-warning"
              viewBox="0 0 16 16"
            >
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
              />
            </svg>`
              }
              </h5>
              <p class="card-text" style="font-size: 0.9rem !important">
              ${formatDescription(description)}
              </p>

              <div class="hstack gap-3">
                  <a href="../html/projectCard.html?id=${cardID}" class="btn btn-primary" data-btn="readMore">Read more</a>
                  ${
                    isAuthorized
                      ? `<a href="../html/editMain.html?id=${cardID}" class="card-link ms-auto"
                  >Edit this project</a
              >
              <div class="vr"></div>
              <button type="button" class="btn btn-danger" data-btn="deleteCard" data-id="${cardID}">Delete</button>`
                      : ""
                  }
              </div>
          </div>
      </div>
    </div>
    `;
    })
    .join("");
}
