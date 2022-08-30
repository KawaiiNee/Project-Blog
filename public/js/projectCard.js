const params = location.search;
const id = new URLSearchParams(params).get("id");

const container = document.querySelector('[data-container="container"]');
const stepContainer = document.querySelector(
  '[data-container="step-container"]'
);

// LOAD PROJECT
loadContent();

// background for the project card
function mainContainerMarkup(thumbnail) {
  let image = thumbnail.replace(/\\/g, "/");
  // background dark filter
  return `min-height: 100vh;
    background-image: linear-gradient(
      rgba(33, 37, 41, 0.85),
      rgba(33, 37, 41, 0.925),
      rgba(33, 37, 41, 1)
    ),
    url("../${image}") ;
    background-repeat: no-repeat;
    background-size: 100%; `;
}

// markup for the project header
function contentHeaderMarkup(title, description, sourceCode) {
  return `
  <div class="container-fluid pb-5" style="color: #eee">
  <h2 class="fw-bolder fs-1 pb-3" data-content="project-title">
    ${title}
  </h2>
  <p class="lead" data-content="project-description">
    ${description}
  </p>
  ${
    sourceCode
      ? `<a href="${sourceCode}" target="_blank"> Source code </a>`
      : ""
  }
</div>
  `;
}

// markup for the project body
function contentBodyMarkup(stepTitle, stepDescriptionContent, stepImage) {
  return stepTitle
    .map((title, index) => {
      return `
        <div class="step">
            <p class="lead fw-bolder">${title}</p>
            <p class="px-2 pb-3">
            ${formatNewline(stepDescriptionContent[index]) || "No content"}
            </p>
            <div class="row justify-content-center">
              <div class="col col-md-8">
                <img src="../../${stepImage[index]}" alt="" class="img-fluid" />
              </div>
            </div>
        </div>
        `;
    })
    .join(`<hr/>`);
}

function defaultContentMarkup() {
  // might add more
  return `<p class="lead">Project Empty...</p>`;
}

// format newlines accordingly
function formatNewline(text) {
  return text.replace(/\n/g, "<br/>");
}

// load project
async function loadContent() {
  try {
    // renamed the other property for readability
    const {
      data: {
        card: {
          name: projectTitle,
          description: projectDescription,
          sourceCode,
          thumbnail,
          stepTitle,
          stepDescriptionContent,
          stepImage,
        },
      },
    } = await axios.get(`/get-project-card/${id}`);
    const data = await axios.get(`/get-project-card/${id}`);

    // separate the markup for easier customization and cleanliness
    document.getElementById("main-container").style =
      mainContainerMarkup(thumbnail);
    container.innerHTML = contentHeaderMarkup(
      projectTitle,
      projectDescription,
      sourceCode
    );
    if (stepTitle.length) {
      stepContainer.innerHTML = contentBodyMarkup(
        stepTitle,
        stepDescriptionContent,
        stepImage
      );
    } else stepContainer.innerHTML = defaultContentMarkup();
    container.appendChild(stepContainer);
  } catch (error) {
    console.log(error);
  }
}

// go back btn
const goBack = document.querySelector('[data-btn="back"]');
goBack.onclick = async () => {
  location.replace(`/`);
};
