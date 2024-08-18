require('dotenv').config();

const moment = require('moment');  // Import moment.js for date manipulation
const Vehicle = require('../models/Vehicle');
const JoiVehicle = require('../joi-validation/JoiVehicle');
const UploadController = require('../controllers/UploadController');

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

        if (req.body.images && req.body.images.length > 3) {
            return res.status(400).json({ error: 'You can only upload up to 3 images.' });
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
    // Search with pagination, sorting, and filtering
    search_vehicles: async (req, res) => {
        const { page = 1, limit = 10, search = '', sort = 'dateCreated', order = 'asc', filter = '' } = req.body;
        const sortOrder = order === 'asc' ? 1 : -1;

        // Only apply filter if it's a valid category, remove otherwise
        const filterCriteria = filter && filter !== 'all' ? { category: filter } : {};

        try {
            const vehicles = await Vehicle.find({
                $or: [
                    { make: { $regex: search, $options: 'i' } },         // Case-insensitive search for 'make'
                    { model: { $regex: search, $options: 'i' } },        // Case-insensitive search for 'model'
                    { colour: { $regex: search, $options: 'i' } },       // Case-insensitive search for 'colour'
                    { vin: { $regex: search, $options: 'i' } },          // Case-insensitive search for 'vin'
                    { regNo: { $regex: search, $options: 'i' } }         // Case-insensitive search for 'regNo'
                ],
                ...filterCriteria,
            })
                .sort({ [sort]: sortOrder })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            const total = await Vehicle.countDocuments({
                $or: [
                    { make: { $regex: search, $options: 'i' } },         // Case-insensitive search for 'make'
                    { model: { $regex: search, $options: 'i' } },        // Case-insensitive search for 'model'
                    { colour: { $regex: search, $options: 'i' } },       // Case-insensitive search for 'colour'
                    { vin: { $regex: search, $options: 'i' } },          // Case-insensitive search for 'vin'
                    { regNo: { $regex: search, $options: 'i' } }         // Case-insensitive search for 'regNo'
                ],
                ...filterCriteria,
            });

            res.json({ vehicles, total });
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            res.status(500).json({ message: 'Server Error', error });
        }
    },
    get_vehicles: async (req, res) => {
        const { page = 1, limit = 10, sort = 'dateCreated', order = 'asc' } = req.body;
        const sortOrder = order === 'asc' ? 1 : -1;

        try {
            const vehicles = await Vehicle.find()
                .sort({ [sort]: sortOrder })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            const total = await Vehicle.countDocuments();
            
            res.json({ vehicles, total });
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            res.status(500).json({ message: 'Server Error', error });
        }
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
    },
    get_dashboard_data: async (req, res) => {
        try {
            // Fetch all vehicles from MongoDB
            const vehicles = await Vehicle.find();

            // Calculate total number of vehicles
            const totalVehicles = vehicles.length;

            // Calculate total retail and cost prices
            const totalRetailPrice = vehicles.reduce((sum, vehicle) => sum + vehicle.retailPrice, 0);
            const totalCostPrice = vehicles.reduce((sum, vehicle) => sum + vehicle.costPrice, 0);

            // Calculate average millage
            const totalMillage = vehicles.reduce((sum, vehicle) => sum + vehicle.millage, 0);
            const averageMillage = totalVehicles > 0 ? (totalMillage / totalVehicles) : 0;

            // Get the current year
            const currentYear = moment().year();

            // Query for vehicles added this year
            const vehiclesThisYear = await Vehicle.countDocuments({
                dateCreated: {
                    $gte: moment().startOf('year').toDate(),
                    $lt: moment().endOf('year').toDate()
                }
            });

            // Query for vehicles added in previous years (exclude the current year)
            const vehiclesByYear = await Vehicle.aggregate([
                {
                    $match: { dateCreated: { $lt: moment().startOf('year').toDate() } } // Only previous years
                },
                {
                    $group: {
                        _id: { $year: "$dateCreated" }, // Group by the year of dateCreated
                        count: { $sum: 1 }              // Count how many vehicles per year
                    }
                },
                { $sort: { _id: -1 } }                // Sort by year (most recent first)
            ]);

            // Format the previous years data and calculate percentage change
            const previousYearsData = vehiclesByYear.map((item, index) => {
                // Get the count for the current year and the previous year
                const currentYearVehicles = item.count;
                const previousYearVehicles = index + 1 < vehiclesByYear.length ? vehiclesByYear[index + 1].count : 0;

                // Calculate the percentage change (if previous year vehicles > 0)
                let percentageChange = 0;
                if (previousYearVehicles > 0) {
                    percentageChange = ((currentYearVehicles - previousYearVehicles) / previousYearVehicles) * 100;
                }

                return {
                    year: item._id,
                    carsAdded: currentYearVehicles,
                    percentageChange: previousYearVehicles > 0 ? percentageChange.toFixed(2) : null  // Null if previous year is 0
                };
            });

            // Calculate the percentage growth or loss for this year compared to the previous year
            const previousYearVehicles = previousYearsData.length > 0 ? previousYearsData[0].carsAdded : 0;
            let thisYearPercentageChange = 0;
            if (previousYearVehicles > 0) {
                thisYearPercentageChange = ((vehiclesThisYear - previousYearVehicles) / previousYearVehicles) * 100;
            }

            // Prepare the dashboard data
            const dashboardData = {
                totalVehicles,
                totalRetailPrice,
                totalCostPrice,
                averageMillage,
                newCarsThisYear: vehiclesThisYear,  // Vehicles added this year
                thisYearPercentageChange: previousYearVehicles > 0 ? thisYearPercentageChange.toFixed(2) : null,  // Growth or loss percentage for this year
                previousYearsData,                  // Data grouped by previous years with percentage change
                recentVehicles: vehicles.slice(0, 5),  // Show the most recent 5 vehicles
            };

            // Send response as JSON
            res.json(dashboardData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}