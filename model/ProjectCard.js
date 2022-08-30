const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Project title can't be empty"],
    maxLength: [36, "Exceeding 36 maximum characters"],
  },
  thumbnail: {
    type: String,
    default: "./images/background.jpg",
  },

  sourceCode: {
    type: String,
    trim: true,
  },

  isCompleted: {
    type: Boolean,
    default: false,
  },

  description: {
    type: String,
    trim: true,
    required: [true, "Please provide some value"],
    maxLength: [256, "Exceeding 256 maximum characters"],
  },

  stepDescription: [String],
  stepImage: [String],
  stepTitle: [String],
  stepDescriptionContent: [String],
});

// capitalize title and description
ProjectSchema.pre("save", function (next) {
  // capitalize | name & description
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  this.description =
    this.description.charAt(0).toUpperCase() + this.description.slice(1);

  // fix sourceCode link
  if (this.sourceCode) {
    if (
      !this.sourceCode.startsWith("http:") ||
      !this.sourceCode.startsWith("https:")
    ) {
      console.log(true);
      this.sourceCode = "https://" + this.sourceCode;
    }
    console.log(this.sourceCode);
  }

  next();
});

module.exports = mongoose.model("Project Card", ProjectSchema);
