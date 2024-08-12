const express = require('express');
const router = express.Router();

const authControllers = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');
const uploadMiddleware = require('../middlewares/upload');
const uploadControllers = require('../controllers/UploadController');
const employeeControllers = require('../controllers/EmployeeController');

// Auth Routes
router.post('/api/login', authControllers.login);
router.get('/api/should_update_password/:email', authControllers.should_update_password);
router.post('/api/refresh_token', authControllers.refresh_token);
router.post('/api/forgot_password', authControllers.forgot_password);
router.post('/api/verify_code', authControllers.verify_code);
router.post('/api/change_password', authControllers.change_password);
router.delete('/api/logout', authControllers.logout);

// Admin User Info
router.get('/api/user_info', authMiddleware.authenticateToken, authControllers.user_info);

// Defaults
router.post('/api/register', employeeControllers.add_employee);
router.get('/api/get_default_employee_by_email/:email', employeeControllers.get_employee_by_email);

router.post('/api/add_employee', authMiddleware.authenticateToken, employeeControllers.add_employee);
router.get('/api/get_employees', authMiddleware.authenticateToken, employeeControllers.get_employees);
router.get('/api/get_employee_by_email/:email', authMiddleware.authenticateToken, employeeControllers.get_employee_by_email);
router.post('/api/update_employee_documents', authMiddleware.authenticateToken, employeeControllers.update_employee_documents);

// File Upload Routes
router.post('/api/upload', uploadMiddleware.upload.single('file'), uploadControllers.upload_file);
router.get('/api/files', uploadControllers.get_files);
router.get('/api/file/:filename', uploadControllers.get_file_by_filename);
router.get('/api/image/:filename', uploadControllers.get_image_by_filename);
router.get('/api/get_any_file_by_filename/:filename', uploadControllers.get_any_file_by_filename);
router.delete('/api/file/:id', uploadControllers.delete_file_by_id);

module.exports = router;