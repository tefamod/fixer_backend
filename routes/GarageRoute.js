const express = require("express");
const router = express.Router();

const {
  addCar,
  getCars,
  getRepairingCars,
  makeCarInRepair,
  searchForallCars,
  searchForRepairingCars,
  updateCar,
  getCar,
  deleteCar,
  getUniqueBrands,
} = require("../services/GarageServices");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  processCarImage,
  updateCarImage,
} = require("../middlewares/uploadImageCloud");

/**
 * @swagger
 * tags:
 *   name: Garage
 *   description: Car garage management
 */

/**
 * @swagger
 * /Garage:
 *   get:
 *     summary: Get all cars
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of all cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       carNumber:
 *                         type: string
 *                         example: "أ ن ق - 217"
 *                       brand:
 *                         type: string
 *                         example: "MITSUBISHI"
 *                       category:
 *                         type: string
 *                         example: "LANCER PUMA"
 *                       color:
 *                         type: string
 *                         example: "فضي"
 *                       repairing:
 *                         type: boolean
 *                         example: false
 */
router.route("/").get(getCars);

/**
 * @swagger
 * /Garage/repairing:
 *   get:
 *     summary: Get all cars currently in repair
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cars currently in repair
 */
router.route("/repairing").get(getRepairingCars);

/**
 * @swagger
 * /Garage/getCarsInDB:
 *   get:
 *     summary: Get all unique car brands in the database
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unique brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["MITSUBISHI", "BMW", "TOYOTA"]
 */
router.route("/getCarsInDB/").get(getUniqueBrands);

/**
 * @swagger
 * /Garage/cloudeniry/updateCarsImageInDB:
 *   post:
 *     summary: Upload and process a car image to Cloudinary
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded and processed successfully
 */
router
  .route("/cloudeniry/updateCarsImageInDB")
  .post(uploadSingleImage("image"), processCarImage);

/**
 * @swagger
 * /Garage/search/{searchString}:
 *   get:
 *     summary: Search all cars by keyword
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: searchString
 *         required: true
 *         schema:
 *           type: string
 *         example: "MITSUBISHI"
 *     responses:
 *       200:
 *         description: Matching cars
 */
router.route("/search/:searchString").get(searchForallCars);

/**
 * @swagger
 * /Garage/search/repairing/{searchString}:
 *   get:
 *     summary: Search cars currently in repair by keyword
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: searchString
 *         required: true
 *         schema:
 *           type: string
 *         example: "BMW"
 *     responses:
 *       200:
 *         description: Matching cars in repair
 */
router.route("/search/repairing/:searchString").get(searchForRepairingCars);

/**
 * @swagger
 * /Garage/getCar/{id}:
 *   get:
 *     summary: Get a specific car by its ID
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6734de56e41091cfb6b02f7e"
 *     responses:
 *       200:
 *         description: Car details
 *       404:
 *         description: Car not found
 */
router.route("/getCar/:id").get(getCar);

/**
 * @swagger
 * /Garage/add/{id}:
 *   post:
 *     summary: Add a new car to a user's garage
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *         example: "6735c716e41091cfb6b03563"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carNumber, chassisNumber, brand, category, model, color]
 *             properties:
 *               carNumber:
 *                 type: string
 *                 example: "أ ن ق - 217"
 *               chassisNumber:
 *                 type: string
 *                 example: "U004868"
 *               brand:
 *                 type: string
 *                 example: "MITSUBISHI"
 *               category:
 *                 type: string
 *                 example: "LANCER PUMA"
 *               model:
 *                 type: string
 *                 example: "2010"
 *               color:
 *                 type: string
 *                 example: "فضي"
 *               motorNumber:
 *                 type: string
 *                 example: "2992"
 *     responses:
 *       201:
 *         description: Car added successfully
 *       400:
 *         description: Invalid car number format
 *       404:
 *         description: User not found
 */
router.route("/add/:id").post(addCar);

/**
 * @swagger
 * /Garage/update/{id}:
 *   put:
 *     summary: Update car details and optionally its image
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6734de56e41091cfb6b02f7e"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               carNumber:
 *                 type: string
 *                 example: "أ ن ق - 217"
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *               color:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       404:
 *         description: Car not found
 */
router
  .route("/update/:id")
  .put(uploadSingleImage("image"), updateCarImage, updateCar);

/**
 * @swagger
 * /Garage/delete/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6734de56e41091cfb6b02f7e"
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       404:
 *         description: Car not found
 */
router.route("/delete/:id").delete(deleteCar);

/**
 * @swagger
 * /Garage/{carNumber}:
 *   put:
 *     summary: Toggle car repair status by car number
 *     tags: [Garage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carNumber
 *         required: true
 *         schema:
 *           type: string
 *         example: "أ ن ق - 217"
 *     responses:
 *       200:
 *         description: Car repair state updated
 *       404:
 *         description: Car not found
 */
router.route("/:carNumber").put(makeCarInRepair);

module.exports = router;
