const express = require('express')
const app = express()
const cors = require('cors')
require("dotenv").config();
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const stripe = require('stripe')(process.env.VITE_STRIPE_PAYMENT_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000



const corsOptions = {
  origin: ['http://localhost:5173','http://localhost:5175','https://ruby-medical-camps.surge.sh'],
  credentials: true,
  optionSuccessStatus: 200,
}
// midleware

app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())




const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  console.log(token)
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}




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
    const feedbackCampColaction = client.db("MedicalCampDB").collection("FeedBack");
    const registerCampColaction = client.db("MedicalCampDB").collection("RegisterCamp");
    const paymentcolaction = client.db("MedicalCampDB").collection("Payment");
    const healthcareColaction = client.db("MedicalCampDB").collection("Healthcare");
    const upCamingCampcareColaction = client.db("MedicalCampDB").collection("upCamingCamp");
    const uupCamingCampRegsiterCareColaction = client.db("MedicalCampDB").collection("UpCamingCampRegsiter");

   
  //  ------------------------------------JWT IN AND OUT TOKEN----------------------------------





    // ---------------------------------------JWT POST TOKEN-----------------------------------


      app.post('/jwt', async (req, res) => {
        const user = req.body
        console.log('I need a new jwt', user)
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '365d',
        })
        res
          .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
      })
  
      // ---------------------------------------JWT LOGOUT-----------------------------------


      app.get('/logout', async (req, res) => {
        try {
          res
            .clearCookie('token', {
              maxAge: 0,
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            })
            .send({ success: true })
          console.log('Logout successful')
        } catch (err) {
          res.status(500).send(err)
        }
      })
   
   
   
   
   
   
   
   
   
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

    app.post('/add-a-camp',verifyToken,async(req,res) => {
    
     
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
        const query = req.query
        const page = query.page
        const pagesNumber = parseInt(page)
        const perpages = 9
        const skip = pagesNumber * perpages
        const result = await addCampColaction.find().skip(skip).limit(perpages).toArray()
        res.send(result)
      }
  
      catch(err){
        console.log(err)
      }
  
      })

      // --------------------------------------------GET SINGLE CMAP BY ID-----------------------------

      
    app.get('/all-camp/:id',verifyToken,async(req,res) => {
    
     
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

    app.get('/add-a-camp/:email',verifyToken,async(req,res) => {
    
     
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

app.put('/update-camp/:id',verifyToken,async(req,res) => {

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


app.delete('/deletecamp/delete/:id',verifyToken,async(req,res) => {


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


  // -------------------------------register campcolaction update-------------------------------------


  app.patch('/camp-count/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    
    const exitCamp = await addCampColaction.findOne({ _id: new ObjectId(id) });
    const currentCount = exitCamp && exitCamp.count !== undefined ? exitCamp.count : 0;

    const query = { _id: new ObjectId(id) };
    const updateDoc = {
        $set: {
            count: currentCount + 1
        }
    };

    const result = await addCampColaction.updateOne(query, updateDoc);
    res.send(result);
});




// -------------------------------------------------REGISTER DETAILS GET ALL-------------------------------


app.get('/register-camp',verifyToken,async(req,res) => {

  try{

   
    const result = await registerCampColaction.find().toArray()
    res.send(result)
  }

  catch(err){
    console.log(err)
  }


})


// -------------------------------------------------REGISTER DETAILS GET SINGLE DATA-------------------------------


app.get('/register-camp/:id',verifyToken,async(req,res) => {

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


app.patch('/register-camp/status/:id',verifyToken,async(req,res) => {
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


app.patch('/register-camp/paid/:id',verifyToken,async(req,res) => {
  try{
    
    const id = req.params.id
    const filter ={_id : new ObjectId(id)}
    const updateDoc = {
      $set: {
        payment : 'paid'
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


app.delete('/register-camp/delete/:id',verifyToken,async(req,res) => {
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


app.get('/register-camp/email/:email',verifyToken,async(req,res) => {
    
     
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

  app.post('/create-paymnet-intent',verifyToken,async(req,res) => {
    

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

  //  ----------------------------------------PAYMENT PACH---------------------------------------------------

  app.patch('/payment/status/:id',verifyToken,async(req,res) =>{

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
  

  // ---------------------------------GET PAYMNET-------------------------

  
app.get('/payment/email/:email',verifyToken,async(req,res) => {
    
     
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



  // -------------------------FEEDBACK AND RATING GET BY EMAIL AND STATUS----------------------------

  app.get('/feedback-and-ratings/email/:email',verifyToken, async (req, res) => {
    try {
      const email = req.params.email;
  
      const query = { "participants.email": email, status: 'Confrimed', payment: 'paid' };
  
      console.log(query);
  
      const results = await registerCampColaction.find(query).toArray();
  
      console.log(results);
      res.send(results);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  });



  // ------------------POST FEEDBACK----------------------
  

  app.post('/feedback-camp',async(req,res) =>{

    try{
  
      const feedback = req.body
      const result = await feedbackCampColaction.insertOne(feedback)
      console.log(result)
      res.send(result)
    }
  
    catch(err){
  
       console.log(err)
    }
  
    })

// ----------------------------------------GET FEED BACK---------------------



app.get('/feedback-camp',async(req,res) => {
    
     
  try{

    
    const result = await feedbackCampColaction.find().toArray()
    res.send(result)
  }

  catch(err){
    console.log(err)
  }

  })



  // ------------------------------------------post professional user data post--------------------------------------

  app.put('/healthcareprofile/exit/:email',verifyToken,async(req,res) =>{

    try{

      const email = req.params.email
      const user = req.body
      const query = { email: email }
      const options = { upsert: true }
      const isExist = await healthcareColaction.findOne(query)
      console.log('User found?----->', isExist)
      if (isExist) return res.send(isExist)
      const result = await healthcareColaction.updateOne(
        query,
        {
          $set: { ...user, timestamp: Date.now() },
        },
        options
      )
      res.send(result)
    }

     catch(err){

      console.log(err)
     }
  
    })


    // ----------------------------------------------Update Profile--------------------------------------------------------------------

    app.patch('/healthcareprofile/update/:email',verifyToken,async(req,res) =>{

      try{
  
        const email = req.params.email
        const profile = req.body
        const query = { email: email }
        const options = { upsert: true }
      
        const result = await healthcareColaction.updateOne(
          query,
          {
            $set:  {...profile}
          },
          options
        )
        res.send(result)
      }
  
       catch(err){
  
        console.log(errr)
       }
    
      })


    // healcare data get-----------------------------------


    app.get('/healthcareprofile',verifyToken,async(req,res) =>{

      try{
    
     
        const result = await healthcareColaction.find().toArray()
        console.log(result)
        res.send(result)
      }
    
      catch(err){
    
         console.log(err)
      }
    
      })


      // --------------------------------FIND ONE---------------------------


      app.get('/healthcareprofile/email/:email',verifyToken, async (req, res) => {
       

          try{
           const email = req.params.email
           console.log(email)
           
             const result = await healthcareColaction.findOne({email})
             console.log(result)
             res.send(result)
          }
          catch(err){
           console.log(err)
          }
            
          })





           // --------------------------------FIND ONE by role---------------------------


      app.get('/healthcareprofile/role/:role',verifyToken, async (req, res) => {
       

        try{
         const role = req.params.role
         console.log(role)
         
           const result = await healthcareColaction.findOne({role})
           console.log(result)
           res.send(result)
        }
        catch(err){
         console.log(err)
        }
          
        })


  // ------------------------------ORGNIZER PROFILE UPDATE ND ADDD------------------------------


  app.patch('/organizerprofileupdate/role/:role',verifyToken,async(req,res) =>{

    try{

      const role = req.params.role
      const profile = req.body
      const query = { role : role }
      const options = { upsert: true }
    
      const result = await healthcareColaction.updateOne(
        query,
        {
          $set:  {...profile}
        },
        options
      )
      res.send(result)
    }

     catch(err){

      console.log(errr)
     }
  
    })

 
  // / ------------------------------Partecepent PROFILE UPDATE ND ADDD------------------------------


  app.patch('/updateprofilePartecipent/role/:role',verifyToken,async(req,res) =>{

    try{

      const role = req.params.role
      const profile = req.body
      const query = { role : role }
      const options = { upsert: true }
    
      const result = await healthcareColaction.updateOne(
        query,
        {
          $set:  {...profile}
        },
        options
      )
      res.send(result)
    }

     catch(err){

      console.log(errr)
     }
  
    })

  


  // 

    // --------------------------------- POST CAMP ---------------------

    app.post('/add-upcaming-camp',verifyToken,async(req,res) => {
    
     
      try{
  
        const upcamp = req.body
        const result = await upCamingCampcareColaction.insertOne(upcamp)
        res.send(result)
      }
  
      catch(err){
        console.log(err)
      }
  
      })



        // -----------------------------GET ALL UPCAMINGCAMP-----------------------

        app.get('/all-upcamingcamp', async (req, res) => {
          try {
            
            const result = await upCamingCampcareColaction.find().limit(6).toArray();
            res.send(result);
          } catch (err) {
            console.log(err);
          }
        });
  

        

        // -----------------------------GET one UPCAMINGCAMP-----------------------

        app.get('/all-upcamingcamp/:id',verifyToken,async(req,res) => {
    
     
          try{
      
            const id = req.params.id;
            const query = { _id : new ObjectId(id) };
            const result = await upCamingCampcareColaction.findOne(query)
            res.send(result)
          }
      
          catch(err){
            console.log(err)
          }
      
          })
   
    

  // ---------------------------POST UPCAMING REGSITER USER AND PROFESIONAL-------------------------


  app.post('/upcamingregister', async (req, res) => {
    try {
      const participantDetails = req.body;
  
      // Insert participant details into the MongoDB collection
      const result = await uupCamingCampRegsiterCareColaction.insertOne(participantDetails);
  
      // Increment the interested participant count in the same collection
      await uupCamingCampRegsiterCareColaction.updateOne(
        { _id: 'camp_interest_count' }, // Assuming you have a document with this specific _id to store the count
        { $inc: { interestedParticipantCount: 1 } },
        { upsert: true } // Create the document if it doesn't exist
      );
  
      // Check if the participant is a professional
      if (participantDetails.isProfessional) {
        // Increment the professional participant count in the same collection
        await uupCamingCampRegsiterCareColaction.updateOne(
          { _id: 'camp_professional_count' }, // Assuming you have a document with this specific _id to store the count
          { $inc: { professionalParticipantCount: 1 } },
          { upsert: true } // Create the document if it doesn't exist
        );
      }
  
      res.status(200).json({ message: 'Participant added successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  




  // show home card-----

  app.get('/show-home', async (req, res) => {

   try{

   const result = await addCampColaction.find().limit(6).sort({count:-1}).toArray()
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