const express = require("express");
const { verifyToken } = require("../middlewares/varifyToken");
const {
  signupValidator,
  loginByCodeValidator,
} = require("../utils/validator/authValidator");

const {
  signup,
  loginByCarCode,
  forgotPassword,
  loginByMail,
  forgotPasswordForAdmin,
  resetPasswordForAdmin,
  setEmailAndPassword,
  verifyLogin,
} = require("../services/authService");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phoneNumber, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ahmed Ali"
 *               phoneNumber:
 *                 type: string
 *                 example: "01012345678"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/signup", signupValidator, signup);

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login by email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@fixer.com"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/admin/login", loginByMail);

/**
 * @swagger
 * /auth/loginByCode:
 *   post:
 *     summary: User login by car generated code
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carCode]
 *             properties:
 *               carCode:
 *                 type: string
 *                 example: "C181"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid car code
 */
router.post("/loginByCode", loginByCodeValidator, loginByCarCode);

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Send forgot password OTP to user phone
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post("/forgotPassword", forgotPassword);

/**
 * @swagger
 * /auth/admin/forgotPassword:
 *   post:
 *     summary: Send forgot password email to admin
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@fixer.com"
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: Admin not found
 */
router.post("/admin/forgotPassword", forgotPasswordForAdmin);

/**
 * @swagger
 * /auth/admin/resetPassword:
 *   post:
 *     summary: Reset admin password using reset code
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resetCode, newPassword]
 *             properties:
 *               resetCode:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset code
 */
router.post("/admin/resetPassword", resetPasswordForAdmin);

/**
 * @swagger
 * /auth/admin/firstCome:
 *   post:
 *     summary: First time admin setup - set email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@fixer.com"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Email and password set successfully
 */
router.post("/admin/firstCome", setEmailAndPassword);

/**
 * @swagger
 * /auth/admin/verifyLogin:
 *   get:
 *     summary: Verify if admin JWT token is still valid
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Token is invalid or expired
 */
router.get("/admin/verifyLogin", verifyLogin);

module.exports = router;
