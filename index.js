const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        'http://localhost:5174'
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());



const uri = "mongodb+srv://newProject:TDtatArVAMt2EAcF@cluster0.2lraink.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const userCollection = client.db("Spaajman").collection("user");
const shopData = client.db("Spaajman").collection("service");
const jobsData = client.db("Spaajman").collection("jobs");
const blogsData = client.db("Spaajman").collection("blogs");
async function run() {
    try {

        // jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        });



        // shop data start
        app.get('/shop', async (req, res) => {
            const services = await shopData.find().toArray();
            res.send(services)
        })

        app.get('/shop/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await shopData.findOne(query);
            res.send(result);
        });

        // shop data end

        // shop Post Api Start
        app.post('/shop', async (req, res) => {
            const newService = req.body;
            const result = await shopData.insertOne(newService);
            res.status(201).send(result);
        })

        // registerAs api service

        // app.get('/user/registerAs/:type', async (req, res) => {
        //     try {
        //         const type = req.params.type;
        //         const query = { registerAs: type };
        //         const users = await shopData.find(query).toArray();
        //         res.send(users);
        //     } catch (error) {
        //         res.status(500).send({ error: 'Failed to fetch users' });
        //     }
        // });

        app.post('/users', async (req, res) => {
            const user = req.body;
            // insert email if user does not exist
            // you can do this many way
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists', insertedId: null });
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        });


        // find all and single job api start

        app.get('/jobs', async (req, res) => {
            const jobs = await jobsData.find({}).toArray();
            res.send(jobs)
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsData.findOne(query);
            res.send(result);
        });

        // find all and single job api end
        // Job Post Api Start 

        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsData.insertOne(newJob);
            res.status(201).send(result);
        });
        // blog api endpoint start

        app.get('/blogs', async (req, res) => {
            const blogs = await blogsData.find({}).toArray();
            res.send(blogs)
        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await blogsData.findOne(query);
            res.send(result);
        });

        // blog api endpoint end

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})