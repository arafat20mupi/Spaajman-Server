const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        'http://localhost:5174',
        'https://spaajman-com.web.app'
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());

const uri = `mongodb+srv://Spaajman:BpHTiEPnbhpCjcar@cluster0.ykgi9mv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Collections
const userCollection = client.db("Spaajman").collection("user");
const shopData = client.db("Spaajman").collection("service");
const jobsData = client.db("Spaajman").collection("jobs");
const blogsData = client.db("Spaajman").collection("blogs");
const requestedShop = client.db("Spaajman").collection("requestedShop");
const appliedJobData = client.db("Spaajman").collection('appliedJob');
const directionsData = client.db("Spaajman").collection("directions");

async function run() {
    try {
        // JWT
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        });

        // Applied Job Data
        app.post('/appliedJob', async (req, res) => {
            const appliedJobDetails = req.body;
            try {
                const result = await appliedJobData.insertOne(appliedJobDetails);
                res.status(200).json({ message: 'Applied Job Data successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Failed to Applied Job Data' });
            }
        });

        app.get('/appliedJob', async (req, res) => {
            const appliedJob = await appliedJobData.find().toArray();
            res.send(appliedJob);
        });

        app.put('/appliedJob/:id', async (req, res) => {
            const id = req.params.id;
            const updatedService = req.body;

            // Validate the ID
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid job ID' });
            }

            // Check if the data to update is provided
            if (!updatedService || Object.keys(updatedService).length === 0) {
                return res.status(400).json({ message: 'No data provided to update' });
            }

            const query = { _id: new ObjectId(id) };
            const updateDocument = { $set: updatedService };
            const options = { upsert: false };

            try {
                const result = await appliedJobData.updateOne(query, updateDocument, options);
                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'Job application not found' });
                }
                res.status(200).json({ message: 'Job application updated successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Failed to update job application', error: error.message });
            }
        });

        // Shop Data
        app.get('/shop', async (req, res) => {
            const services = await shopData.find().toArray();
            res.send(services);
        });

        app.get('/shop/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await shopData.findOne(query);
            res.send(result);
        });

        // Shop Post API
        app.post('/shop', async (req, res) => {
            const newService = req.body;
            const result = await shopData.insertOne(newService);
            res.status(201).send(result);
        });

        app.delete('/shop/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await shopData.deleteOne(query);
            res.send(result);
        });

        // Shop Register Method
        app.get('/shop/position/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await shopData.findOne(query);
            res.send({ position: user?.positionAs === 'shop' });
        });

        app.patch('/shop/approved/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: 'approved',
                    positionAs: 'shop'
                }
            };
            const result = await shopData.updateOne(filter, updatedDoc);
            res.send(result);
        });

        // Shop Request
        app.post('/requestedShop', async (req, res) => {
            const shopDetails = req.body;
            try {
                const result = await requestedShop.insertOne(shopDetails);
                res.status(200).json({ message: 'Shop Requested successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Failed to Shop Requested' });
            }
        });

        app.get('/requestedShop', async (req, res) => {
            try {
                const shop = await requestedShop.find().toArray();
                res.status(200).json(shop);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch Shop' });
            }
        });

        // User Management
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists', insertedId: null });
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.get('/users', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const query = { _id: new ObjectId(id) };
                const result = await jobsData.deleteOne(query);
                if (result.deletedCount === 1) {
                    res.status(200).send({ message: "Job deleted successfully" });
                } else {
                    res.status(404).send({ message: "Job not found" });
                }
            } catch (error) {
                res.status(500).send({ message: "Failed to delete job", error: error.message });
            }
        });

        app.put('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedJob = req.body;

            try {
                const query = { _id: new ObjectId(id) };
                const update = {
                    $set: updatedJob,
                };
                const result = await jobsData.updateOne(query, update);
                if (result.matchedCount === 1) {
                    res.status(200).send({ message: "Job updated successfully" });
                } else {
                    res.status(404).send({ message: "Job not found" });
                }
            } catch (error) {
                res.status(500).send({ message: "Failed to update job", error });
            }
        });

        // Admin APIs
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.send({ admin: user?.role === 'admin' });
        });

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        // Job APIs
        app.get('/jobs', async (req, res) => {
            const jobs = await jobsData.find({}).toArray();
            res.send(jobs);
        });

        app.post('/jobs', async (req, res) => {
            const jobDetails = req.body;
            const result = await jobsData.insertOne(jobDetails);
            res.status(201).send(result);
        });

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsData.findOne(query);
            res.send(result);
        });

        // Blog APIs
        app.post('/blogs', async (req, res) => {
            const blogDetails = req.body;
            const result = await blogsData.insertOne(blogDetails);
            res.status(201).send(result);
        });

        app.get('/blogs', async (req, res) => {
            const blogs = await blogsData.find({}).toArray();
            res.send(blogs);
        });

        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await blogsData.deleteOne(query);
            res.send(result);
        });

        // Directions API
        app.post('/directions', (req, res) => {
            const { origin, destination } = req.body;
        
            // Use the Google Maps Directions API here
            const directionsService = new google.maps.DirectionsService();
        
            directionsService.route(
                {
                    origin,
                    destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        res.json({
                            status: 'OK',
                            directions: result,
                        });
                    } else {
                        res.json({
                            status: status,
                            message: 'Error getting directions',
                        });
                    }
                }
            );
        });
        

        app.get('/directions', async (req, res) => {
            const directions = await directionsData.find().toArray();
            res.send(directions);
        });

        app.delete('/directions/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await directionsData.deleteOne(query);
            res.send(result);
        });

        
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
