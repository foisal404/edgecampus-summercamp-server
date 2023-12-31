const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
// app.use(cors())

// const corsConfig = {
//   origin: '*',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
//   }
//   app.use(cors(corsConfig))
//   app.options("", cors(corsConfig))

  const corsOptions ={
    origin:'*',
    credentials:true,
    optionSuccessStatus:200,
    }
    app.use(cors(corsOptions))
app.use(express.json())


app.get('/', (req, res) => {
  res.send('edge campus running...')
})




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
    // await client.connect();
    const userCollection = client.db("edgeCampus").collection("users");
    const classCollection = client.db("edgeCampus").collection("classes");
    const cartCollection = client.db("edgeCampus").collection("cart");


    //cart api
    app.patch('/cart/:id', async (req, res) => {
      const id=req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          "enroll":"true"
        },
      };
      // console.log(updateDoc);
      const result = await cartCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    app.delete('/carts/:id',async(req,res)=>{
      const id=req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })
    app.get('/carts',async(req,res)=>{
      const cursor =await cartCollection.find().toArray();
      res.send(cursor)
      
    })
    app.post('/cart',async(req,res)=>{
      const data=req.body;
      const result = await cartCollection.insertOne(data);
      res.send(result)
      // console.log(data);
    })
    //class api
    app.patch('/class/feedback/:id', async (req, res) => {
      const data=req.body;
      const id=req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          feedback: data.feedback
        },
      };
      // console.log(updateDoc);
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.patch('/class/:id', async (req, res) => {
      const id=req.params.id;
      const filter = { _id: new ObjectId(id) };
      const isExiset = await classCollection.findOne(filter);
      // console.log(isExiset);
      const updateDoc = {
        $set: {
          "seats": parseInt(isExiset.seats)-1,
          "students": parseInt(isExiset.students)+1
        },
      };
      console.log(updateDoc);
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    app.patch('/class/deny/:id', async (req, res) => {
      const id=req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'denied'
        },
      };
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);

    })
    app.patch('/class/approve/:id', async (req, res) => {
      const id=req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'approved'
        },
      };
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);

    })
    app.post('/class',async(req,res)=>{
      const data=req.body;
      const result = await classCollection.insertOne(data);
      res.send(result)
    })
    app.get('/classes',async(req,res)=>{
      const cursor =await classCollection.find().sort({ "students": -1 }).toArray();
      res.send(cursor)
    })
    app.get('/class/:email',async(req,res)=>{
      const data=req.params.email;
      let query = {instructorEmail: data};
      const cursor =await classCollection.find(query).toArray();
      res.send(cursor)
    })
    //users api
    app.get('/users/role/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email }
        const user = await userCollection.findOne(query);
        const result = { role: user?.role|| "student"}
        // console.log(result);
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
        // console.log(id);
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