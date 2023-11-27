const express = require('express')
const app = express()
const cors = require('cors')
require("dotenv").config();
const stripe = require('stripe')(process.env.VITE_STRIPE_PAYMENT_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000



const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174','http://localhost:5175'],
  credentials: true,
  optionSuccessStatus: 200,
}
// midleware

app.use(cors(corsOptions))
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtnypra.mongodb.net/?retryWrites=true&w=majority`;

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

    //----------------------------- databagecolection--------------------------------
    const userCampColaction = client.db("MedicalCampDB").collection("Users");
    const addCampColaction = client.db("MedicalCampDB").collection("AddCamp");
    const managesCampColaction = client.db("MedicalCampDB").collection("ManagesCamp");
    const registerCampColaction = client.db("MedicalCampDB").collection("RegisterCamp");
    const paymentcolaction = client.db("MedicalCampDB").collection("Payment");

    // ----------------------USERS DATA POST------------------------------

     app.put('/users/:email',async(req,res) => {
    
      try{

        const email = req.params.email
        const user = req.body
        const query = { email: email }
        const options = { upsert: true }
        const isExist = await userCampColaction.findOne(query)
        console.log('User found?----->', isExist)
        if (isExist) return res.send(isExist)
        const result = await userCampColaction.updateOne(
          query,
          {
            $set: { ...user, timestamp: Date.now() },
          },
          options
        )
        res.send(result)
      }

       catch(err){

        console.log(errr)
       }

     })

    // -------------------------USER DATA GET-------------------------------
   
    app.get('/users/email/:email',async(req,res) => {

     try{
      const email = req.params.email
      console.log(email)
      
        const result = await userCampColaction.findOne({email})
        console.log(result)
        res.send(result)
     }
     catch(err){
      console.log(err)
     }
       
     })


    // --------------------------------- POST CAMP ---------------------

    app.post('/add-a-camp',async(req,res) => {
    
     
    try{

      const camp = req.body
      const result = await addCampColaction.insertOne(camp)
      res.send(result)
    }

    catch(err){
      console.log(err)
    }

    })

    // -----------------------------GET ALL CAMP-----------------------

    app.get('/all-camp',async(req,res) => {
    
     
      try{
  
        
        const result = await addCampColaction.find().toArray()
        res.send(result)
      }
  
      catch(err){
        console.log(err)
      }
  
      })

      // --------------------------------------------GET SINGLE CMAP BY ID-----------------------------

      
    app.get('/all-camp/:id',async(req,res) => {
    
     
      try{
  
        const id = req.params.id;
        const query = { _id : new ObjectId(id) };
        const result = await addCampColaction.findOne(query)
        res.send(result)
      }
  
      catch(err){
        console.log(err)
      }
  
      })

    // --------------GET CAMP BY ORGANIZER EMAIL--------------------------------------

    app.get('/add-a-camp/:email',async(req,res) => {
    
     
      try{
  
        const email = req.query.email
        console.log('157 ---->',email)
        const query = { organizer : email}
        const result = await addCampColaction.find(query).toArray()
        res.send(result)
      }
  
      catch(err){
        console.log(err)
      }
  
      })

// --------------------ORGANIZER DATA UPDATE ------------------------------------------

app.put('/update-camp/:id',async(req,res) => {

  try{
    const id = req.params.id;
    const camp = req.body;
    
    console.log("id", id);
    const filter = { _id: new ObjectId(id) };
    // const options = { upsert: true };
    const updatedcamp = {
      $set: {
      ...camp
      },
    };
    const result = await addCampColaction.updateOne(
      filter,
      updatedcamp,
      // options
    );
    res.send(result);
  }

  catch(err){
    console.log(err)
  }
})





//---------------------------------ORGANIZER DELETE CAMP----------------------------


app.delete('/deletecamp/delete/:id',async(req,res) => {


  try{
    const id = req.params.id;
    console.log("delete", id);
    const query = { _id : new ObjectId(id),
    };
    const result = await addCampColaction.deleteOne(query);
    console.log(result);
    res.send(result);
  }

  catch(err){
     console.log(err)
  }
})



// -------------------------------------------------REGISTER DETAILS POST-------------------------------


app.post('/register-camp',async(req,res) => {
    
     
  try{

    const register = req.body
    const result = await registerCampColaction.insertOne(register)
    res.send(result)
  }

  catch(err){
    console.log(err)
  }

  })



// -------------------------------------------------REGISTER DETAILS GET ALL-------------------------------


app.get('/register-camp',async(req,res) => {

  try{

   
    const result = await registerCampColaction.find().toArray()
    res.send(result)
  }

  catch(err){
    console.log(err)
  }


})


// -------------------------------------------------REGISTER DETAILS GET SINGLE DATA-------------------------------


app.get('/register-camp/:id',async(req,res) => {

  try{

    const id = req.params.id
    const query = { _id : new ObjectId(id)}
    const result = await registerCampColaction.findOne(query)
    res.send(result)
  }

  catch(err){
    console.log(err)
  }


})

// / -------------------------------------------------REGISTER REQUEST SUCCESSS-------------------------------


app.patch('/register-camp/status/:id',async(req,res) => {
try{
  
  const id = req.params.id
  const filter ={_id : new ObjectId(id)}
  const updateDoc = {
    $set: {
      status : 'Confrimed'
    },
  };
  const result = await registerCampColaction.updateOne(filter,updateDoc)
  res.send(result)
}
catch(err){

  console.log(err)
}
})




// / -------------------------------------------------REGISTER REQUEST SUCCESSS-------------------------------


app.patch('/register-camp/paid/:id',async(req,res) => {
  try{
    
    const id = req.params.id
    const filter ={_id : new ObjectId(id)}
    const updateDoc = {
      $set: {
        payment : 'Confrimed'
      },
    };
    const result = await registerCampColaction.updateOne(filter,updateDoc)
    res.send(result)
  }
  catch(err){
  
    console.log(err)
  }
  })
  


// 

// / -------------------------------------------------REGISTER REQUEST DElETE-------------------------------


app.delete('/register-camp/delete/:id',async(req,res) => {
  try{
    
    const id = req.params.id
    const query ={ _id : new ObjectId(id)}
    const result = await registerCampColaction.deleteOne(query)
    res.send(result)
    console.log(result)
  }
  catch(err){
  
    console.log(err)
  }
  })


  
// / -------------------------------------------------REGISTER REQUEST GET BY EMAIL-------------------------------


app.get('/register-camp/email/:email',async(req,res) => {
    
     
  try{

    const email = req.params.email
    console.log('333 line --->',email)
    const query = { 'participants.email' : email}
    console.log('335 line --->',query)
    const result = await registerCampColaction.find(query).toArray()
    res.send(result)
  }

  catch(err){
    console.log(err)
  }

  })


  // -----------------------------------------GENARETE CLIENT SECRET------------------------------------

  app.post('/create-paymnet-intent',async(req,res) => {
    

    try{

      
    const {price} = req.body
   
    const amuont = parseInt(price * 100)

    const paymentIntent = await stripe.paymentIntents.create({

      amount: amuont,
      currency: 'usd',
      payment_method_types:['card']
    })

    res.send({
      clientSecret: paymentIntent.client_secret,
    })
    }
 catch(err){

   console.log(err)
 }
  })
  
  // --------------------------PAYMENT COLACTION POST-------------------------

  app.post('/payment',async(req,res) =>{

  try{

    const payment = req.body
    const paymnetresult = await paymentcolaction.insertOne(payment)
    console.log(payment)
    res.send(paymnetresult)
  }

  catch(err){

     console.log(err)
  }

  })

  //  paymmet pach---------------------------------------------------

  app.patch('/payment/status/:id',async(req,res) =>{

    try{
  
      const id = req.params.id
      console.log(id)
      const query = { _id : new ObjectId(id)}

      const updatedoc = {

        $set:{

          payment : 'paid'
        }
      }

      const result = await registerCampColaction.updateOne(query,updatedoc)

      res.send(result)
    }
  
    catch(err){
  
       console.log(err)
    }

  })
  

  // get payment-------------------------

  
app.get('/payment/email/:email',async(req,res) => {
    
     
  try{

    const email = req.params.email
    console.log('333777 line --->',email)
    const query = { email : email}
    console.log('335 line --->',query)
    const result = await paymentcolaction.find(query).toArray()
    res.send(result)
  }

  catch(err){
    console.log(err)
  }

  })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);









app.get('/', (req, res) => {
  res.send('Medical Camps Server Running!-.......')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})