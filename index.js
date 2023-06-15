const express = require('express');
const app = express()
require('dotenv').config()
const port = process.env.PORT||5000

//middleware
const cors = require('cors');
app.use(cors())
app.use(express.json())



app.get('/', (req, res) => {
  res.send('edge campus running...')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.pxrxjz6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db("edgeCampus").collection("users");
    const classCollection = client.db("edgeCampus").collection("classes");

    //class api
    app.post('/class',async(req,res)=>{
      const data=req.body;
      const result = await classCollection.insertOne(data);
      res.send(result)
    })
    //users api
    app.get('/users/role/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email }
        const user = await userCollection.findOne(query);
        const result = { role: user?.role|| "student"}
        console.log(result);
        res.send(result);
      })
    app.patch('/users/admin/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            role: 'admin'
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
  
      })
    app.patch('/users/instructor/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            role: 'instructor'
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
  
      })
    app.get('/users',async(req,res)=>{
        const cursor =await userCollection.find().toArray();
        res.send(cursor);
    })
    app.post('/user',async(req,res)=>{
        const data=req.body;
        // console.log(data.email);
        const query = { email: data.email };
        const isExiset = await userCollection.findOne(query);
        if(isExiset){
            res.send([])
        }
        else{
            const result = await userCollection.insertOne(data);
            res.send(result)
        }

    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`edge campus  on port ${port}`)
})