const Card = require("../model/ProjectCard");
const { BadRequestError } = require("../error");
const jwt = require("jsonwebtoken");

// IMAGE UPLOADING
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const multer = require("multer");
const mimeTypes = ["image/jpeg", "image/png", "image/gif"];
const uploadDir = "stepImagesUpload";
const fileFilter = (req, file, cb) => {
  // if file is one of mimetypes allow the image to be uploaded, reject it otherwise
  // returning false doens't mean error, it returns a null, meaning it just doesn't get uploaded
  const isValidPhoto = mimeTypes.some((type) => type === file.mimetype);
  if (isValidPhoto) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const { _id: cardID } = req.params;

    try {
      // make the card's title the folder name (will be use in deleting directories) || or project_thumbnail if no cardID
      const folderName = cardID
        ? (await Card.findById(cardID)).name
        : "project_thumbnail";

      const path = `./public/${uploadDir}/${folderName}`;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      cb(null, path);
    } catch (error) {
      // throw new BadRequestError(`No project with ID: ${cardID}`);
      console.log(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: {
    // limit the file size to 10mb
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter,
});

// get all cards
const getProjectCards = async (req, res) => {
  const { name } = req.query;
  const queryObj = {};
  if (name) {
    // make the search query case insensitive
    queryObj.name = { $regex: name, $options: "i" };
  }

  try {
    const projectCards = await Card.find(queryObj);
    res
      .status(200)
      .json({ cards: projectCards, foundSomething: !!projectCards.length });
  } catch (error) {
    console.log(error);
    throw new BadRequestError(error);
  }
};

// get single project
const getProjectCard = async (req, res) => {
  try {
    const { _id: cardID } = req.params;
    const projectCard = await Card.findOne({ _id: cardID });
    if (!projectCard) {
      throw new BadRequestError(`No task with ID: ${cardID}`);
    }
    res.status(200).json({ card: projectCard });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

// post project card
const postProjectCard = async (req, res) => {
  const card = new Card({
    name: req.body.title,
    thumbnail: req.file ? req.file.path : undefined,
    description: req.body.description,
  });

  try {
    await card.save();
    res.status(200).redirect("back");
  } catch (error) {
    throw new BadRequestError(error);
  }
};

// delete project card
const deleteProjectCard = async (req, res) => {
  let card;
  try {
    const { _id: cardID } = req.params;
    card = await Card.findById(cardID);

    // delete thumbnail
    if (card.thumbnail !== "./images/background.jpg") {
      fs.unlink(card.thumbnail, (err) => {
        if (!err) return;
        console.log(err);
        return;
      });
    }

    // delete image upload folder
    // delete the (img-upload)directory/(img-upload)folder if the card project has been deleted
    const dir = path.resolve(uploadDir, card.name);
    fs.rmSync(dir, { recursive: true, force: true });

    await card.remove();
    if (!card) {
      throw new BadRequestError(`No task with ID: ${cardID}`);
    }
    res.status(200).json(card);
  } catch (error) {}
};

// create project card content
const updateProjectContent = async (req, res) => {
  try {
    const { _id: cardID } = req.params;
    const projectCard = await Card.findByIdAndUpdate(
      { _id: cardID },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!projectCard) {
      // if no task with such id
      throw new BadRequestError(`No task with ID: ${cardID}`);
    }

    res.status(200).json({ card: projectCard });
  } catch (error) {
    console.log(error);
  }
};

// update project step content
const updateProjectStepContent = async (req, res) => {
  const { _id: cardID, step: stepNumber } = req.params;
  try {
    // TODO: implement in the controller
    const projectCard = await Card.findById(cardID);
    // check if project exist
    if (!projectCard) {
      throw new BadRequestError(`No project with ID: ${cardID}`);
    }
    // update description
    projectCard.stepDescriptionContent[stepNumber - 1] =
      req.body.stepDescriptionContent;

    // if there's an image that has been uploaded
    if (req.file != undefined) {
      // if there's an image to be replace
      if (projectCard.stepImage[stepNumber - 1]) {
        // delete if there's a file to be replace
        fs.unlink(projectCard.stepImage[stepNumber - 1], (err) => {
          if (err) console.log(`File upload error: ${err}`);
        });
      }
      projectCard.stepImage[stepNumber - 1] = req.file.path;
    }
    // save changes to the database
    await projectCard.save();
    // redirect to the current url
    res.redirect(`back`);
  } catch (error) {
    console.log(error);
  }
};

// "Edit this project" | main section
const updateProjectMainContent = async (req, res) => {
  const { _id: cardID } = req.params;
  try {
    const projectCard = await Card.findById(cardID);
    projectCard.name = req.body.editTitle;
    projectCard.description = req.body.editDescription;
    projectCard.sourceCode = req.body.sourceCode;
    projectCard.isCompleted = !!req.body.status;

    if (req.file != undefined) {
      if (projectCard.thumbnail !== "./images/background.jpg") {
        fs.unlink(projectCard.thumbnail, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      projectCard.thumbnail = req.file.path;
    }

    // save changes to the database
    await projectCard.save();
    // redirect to the current url
    res.redirect(`back`);
  } catch (error) {
    console.log(error);
  }
};

// delete's image
// a req.body with array property needs to be enforced! (done in the js frontend when using this api)
const deleteImage = async (req, res) => {
  // delete all images contain in the array
  const images = req.body.stepImage;
  images.forEach(async (element) => {
    if (element) {
      await unlinkAsync(element, (err) => {
        // console.log(err);
        return;
      });
    }
    return;
  });
  res.end();
};

const login = async (req, res) => {
  try {
    // path may vary when making changes in the directory
    res.status(200).sendFile("login.html", {
      root: path.join(__dirname, "..", "public", "html"),
    });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const loginInfo = (req, res) => {
  const { username } = req.body;
  // JWT TOKEN
  const token = jwt.sign(
    {
      name: username,
      admin: true,
    },
    process.env.JWT_SECRET,
    // token life span
    { expiresIn: "1d" }
  );

  res.status(200).json({ token, username: username });
};

module.exports = {
  getProjectCards,
  getProjectCard,
  postProjectCard,
  deleteProjectCard,
  updateProjectContent,
  updateProjectStepContent,
  updateProjectMainContent,
  deleteImage,
  login,
  loginInfo,
  upload,
};
