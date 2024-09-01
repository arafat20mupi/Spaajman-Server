require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
const { ObjectId } = require('mongodb');

//middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Spaajman:rCP7LNlCZryXWaoP@cluster0.ykgi9mv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const database = client.db("Spaajman").collection("service");
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        app.get('/shop', async (req, res) => {
            const services = await database.find().toArray();
            res.send(services)
        })
        app.get('/shop/:id', async (req, res) => {
            try {
                
            } catch (error) {
                console.error('Error fetching service:', error);            
            }
        });



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