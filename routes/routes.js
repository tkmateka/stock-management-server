const express = require('express');
const router = express.Router();

const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');
const uploadMiddleware = require('../middlewares/upload');
const uploadController = require('../controllers/UploadController');
const employeeController = require('../controllers/EmployeeController');
const vehicleController = require('../controllers/VehicleController');


// User
router.post('/api/register', employeeController.add_employee);
router.get('/api/get_default_employee_by_email/:email', employeeController.get_employee_by_email);

// Auth Routes
router.post('/api/login', authController.login);
router.post('/api/refresh_token', authController.refresh_token);
router.post('/api/forgot_password', authController.forgot_password);
router.post('/api/verify_code', authController.verify_code);
router.post('/api/change_password', authController.change_password);
router.delete('/api/logout', authController.logout);

// Vehicle
router.post('/api/add_vehicle', authMiddleware.authenticateToken, vehicleController.add_vehicle);
router.put('/api/update_vehicle', authMiddleware.authenticateToken, vehicleController.update_vehicle);
router.post('/api/search_vehicles', authMiddleware.authenticateToken, vehicleController.search_vehicles);
router.get('/api/get_dashboard_data', authMiddleware.authenticateToken, vehicleController.get_dashboard_data);
router.post('/api/get_vehicles', authMiddleware.authenticateToken, vehicleController.get_vehicles);
router.get('/api/get_vehicle_by_id/:id', authMiddleware.authenticateToken, vehicleController.get_vehicle_by_id);
router.delete('/api/delete_vehicle_by_id/:id', authMiddleware.authenticateToken, vehicleController.delete_vehicle_by_id);

// File Upload Routes
router.post('/api/upload', uploadMiddleware.upload, uploadController.upload_file);
router.get('/api/files', uploadController.get_files);
router.get('/api/file/:filename', uploadController.get_file_by_filename);
router.delete('/api/file/:id', uploadController.delete_file_by_id);

module.exports = router;