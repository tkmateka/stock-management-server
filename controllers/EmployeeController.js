require('dotenv').config();

const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const JoiEmployee = require('../joi-validation/JoiEmployee');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION).catch((err) => console.log(err));

module.exports = {
    add_employee: async (req, res) => {
        // Validate the request body against the schema
        const { error, value } = JoiEmployee.validate(req.body);

        if (error) {
            // Send a 400 response if validation fails
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            // The second parameter is the default salt
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            let emp = { ...req.body };
            emp.password = hashedPassword;

            const newEmployee = new Employee({ ...emp });
            const result = await newEmployee.save();

            res.status(201).send({ message: 'Registered successfully'});
        } catch (e) {
            res.status(500).send(e);
        }
    },
    get_employees: async (req, res) => {
        const employees = await Employee.find();
        res.json(employees);
    },
    get_employee_by_email: async (req, res) => {
        const employee = await Employee.find({ email: req.params.email });
        res.json(employee);
    },
    update_employee: async (req, res) => {
        const filter = { email: req.body.email };

        const update = req.body;

        const employee = await Employee.findOneAndUpdate(filter, update);
        res.json(employee);
    }
}