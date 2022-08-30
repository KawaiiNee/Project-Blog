const express = require("express");
const router = express.Router();

const {
  getProjectCards,
  getProjectCard,
  postProjectCard,
  deleteProjectCard,
  updateProjectContent,
  updateProjectStepContent,
  updateProjectMainContent,
  login,
  loginInfo,
} = require("../controllers/task");

const authAuthenticationMiddleware = require("../middleware/auth");

// IMAGE UPLOAD & DELETION
const { upload, deleteImage } = require("../controllers/task");

// not called, work on this :: cause == public // app.use
router.get("/", (req, res) => {
  res.redirect("/home");
});

router.get("/home", getProjectCards);

router.get("/get-project-card/:_id", getProjectCard);

router.post(
  "/post-project-card",
  // authAuthenticationMiddleware,
  upload.single("image"),
  postProjectCard
);

router.patch(
  "/update-project-content/:_id",
  authAuthenticationMiddleware,
  updateProjectContent
);

router.patch(
  "/update-project-main-content/:_id",
  upload.single("image"),
  updateProjectMainContent
);

router.delete(
  "/delete-project-card/:_id",
  authAuthenticationMiddleware,
  deleteProjectCard
);

router.get("/login", login);

router.post("/login", loginInfo);

// IMAGE UPLOAD & DELETION
router.put(
  "/update-project-content/:_id/:step/",
  upload.single("image"),
  updateProjectStepContent
);

router.put(
  "/delete-project-image/:_id",
  authAuthenticationMiddleware,
  deleteImage
);

module.exports = router;
