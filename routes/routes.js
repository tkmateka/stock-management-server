const express = require('express');
const router = express.Router();

const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');
const uploadMiddleware = require('../middlewares/upload');
const uploadController = require('../controllers/UploadController');
const employeeController = require('../controllers/EmployeeController');
const vehicleController = require('../controllers/VehicleController');

// Auth Routes
router.post('/api/login', authController.login);
router.get('/api/should_update_password/:email', authController.should_update_password);
router.post('/api/refresh_token', authController.refresh_token);
router.post('/api/forgot_password', authController.forgot_password);
router.post('/api/verify_code', authController.verify_code);
router.post('/api/change_password', authController.change_password);
router.delete('/api/logout', authController.logout);

// Admin User Info
router.get('/api/user_info', authMiddleware.authenticateToken, authController.user_info);

// Defaults
router.post('/api/register', employeeController.add_employee);
router.get('/api/get_default_employee_by_email/:email', employeeController.get_employee_by_email);

// Vehicle
router.post('/api/add_vehicle', authMiddleware.authenticateToken, vehicleController.add_vehicle);
router.get('/api/get_vehicles', authMiddleware.authenticateToken, vehicleController.get_vehicles);
router.get('/api/get_vehicle_by_id/:id', authMiddleware.authenticateToken, vehicleController.get_vehicle_by_id);

// File Upload Routes
router.post('/api/upload', uploadMiddleware.upload, uploadController.upload_file);
router.get('/api/files', uploadController.get_files);
router.get('/api/file/:filename', uploadController.get_file_by_filename);
router.get('/api/image/:filename', uploadController.get_image_by_filename);
router.get('/api/get_any_file_by_filename/:filename', uploadController.get_any_file_by_filename);
router.delete('/api/file/:id', uploadController.delete_file_by_id);

module.exports = router;