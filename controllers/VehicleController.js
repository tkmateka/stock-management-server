require('dotenv').config();

const { ObjectId } = require('mongodb');
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

            res.status(201).send({
                message: `${result.make} added successfully!`
            });
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
    },
    update_vehicle: async (req, res) => {
        const filter = { vin: req.body.vin };
        const update = req.body;

        const vehicle = await Vehicle.findOneAndUpdate(filter, update);

        res.json(vehicle);
    },
    delete_vehicle_by_id: async (req, res) => {
        try {
            const vehicleId = req.params.id;
            const result = await Vehicle.findByIdAndDelete(vehicleId);

            if (!result) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }

            res.status(200).json({ message: 'Vehicle deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting Vehicle', error });
        }
    }
}