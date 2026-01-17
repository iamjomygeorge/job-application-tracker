const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const jobController = require("../controllers/jobController");
const requireAuth = require("../middleware/authMiddleware");

const jobValidation = [
  body("company").notEmpty().withMessage("Company name is required").trim(),
  body("role").notEmpty().withMessage("Role/Position is required").trim(),
  body("status")
    .isIn(["Applied", "Interview", "Offer", "Rejected"])
    .withMessage("Status must be Applied, Interview, Offer, or Rejected"),
  body("job_link")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Job link must be a valid URL"),
];

router.use(requireAuth);

router.post("/", jobValidation, jobController.createJob);
router.get("/", jobController.getJobs);
router.patch("/:id", jobValidation, jobController.updateJob);
router.delete("/:id", jobController.deleteJob);

module.exports = router;
