const express = require("express");
const router = express.Router();
const playerStatController = require("../controllers/playerController");


router.get("/", playerStatController.getAllStats);
router.get("/:id", playerStatController.getStatById);
router.post("/", playerStatController.createStat);
router.put("/:id", playerStatController.updateStat);
router.delete("/:id", playerStatController.deleteStat);

module.exports = router;
