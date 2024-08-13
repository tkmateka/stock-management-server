require('dotenv').config();

const Vehicle = require('../models/Vehicle');
const JoiVehicle = require('../joi-validation/JoiVehicle');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION).catch((err) => console.log(err));

module.exports = {
    add_vehicle: async (req, res) => {
        // Validate the request body against the schema
        const { error, value } = JoiVehicle.validate(req.body);

        if (error) {
            // Send a 400 response if validation fails
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            let vehicle = { ...req.body };

            const newVehicle = new Vehicle({ ...vehicle });
            const result = await newVehicle.save();

            res.status(201).send(result);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    get_vehicles: async (req, res) => {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    },
    get_vehicle_by_id: async (req, res) => {
        const vehicle = await Vehicle.find({ id: req.params.id });
        res.json(vehicle);
    }
}