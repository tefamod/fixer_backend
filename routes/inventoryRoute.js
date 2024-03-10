const express = require("express");
const router = express.Router();

const {
  addComponent,
  getAllCom,
  UpdateComponent,
  getCom,
} = require("../services/InventoryServies");

router.route("/").get(getAllCom).post(addComponent);

router.route("/:id").get(getCom).put(UpdateComponent);

module.exports = router;
