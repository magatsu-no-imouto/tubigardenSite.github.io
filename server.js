const {MongoClient}=require("mongodb");
const uri='mongodb+srv://dbadmin:ji14c7mmiS1cT4Bd@c0.yglrytp.mongodb.net/?retryWrites=true&w=majority'; //database
const options={
useNewUrlParser:true,
useUnifiedTopology:true,
};

const client=new MongoClient(uri);
let rider=client.db('db-TubigardenResort-depl');

const port = 8080;

async function connecto(){
    try{
        await client.connect();
        console.log("Database, please!");
        train.listen(port,()=>{
          console.log(`Connecto, ${port}`);
          });
    }catch(err){
        console.error("E-E-ERROR!",err);
    }
}

connecto();
const exp = require('express');
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const train = exp();
const multer = require('multer');
const upload = multer({
    destination: 'public/media/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  })
train.use(cookieParser());
train.use(exp.json());
train.use(cors());

const isAdmin = async (req, res, next) => {
  try {
    if (req.url.toLowerCase().includes('/admin') && req.url.endsWith('.html')) {
      console.log(req.url);
      const aID = req.cookies.aUser;
      console.log(aID)
      if (!aID) {
        return res.status(403).send('Forbidden: Access Denied');
      }

      const aMem = await rider.collection('admin').findOne({ aID });

      if (aMem) {
        return next();
      } else {
        return res.status(403).send('Forbidden: Access Denied');
      }
    } else {
      return next();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

train.use(isAdmin);
train.use(exp.static('public'));




// Assuming you have an Express app instance called 'train'


train.post('/generate-pdf', async (req, res) => {
  const { sectA,sectB,content} = req.body;
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  const combinedHTML=`
  <html>
      <head>
        <style>
        table {
            border-collapse: collapse;
            width: 50%;
        }
    
        table, th, td {
            border: 0;
        }
    
        th, td {
            padding: 8px;
            text-align: left;
        }
    </style>
      </head>
      <body>
      <h1>Tubigan Garden Resort</h1>
      <h2>Business Report</h2>
      <p>Tubigan Garden Resort</p>
      <p>343 Molino - Paliparan Rd.</p>
      <p>Dasmariñas, 4114 Cavite
      </p>
        <div> ${sectA} ${sectB}</div>
        ${content}
      </body>
    </html>`
console.log(combinedHTML)
const dt=new Date()
dt.getDate()
await page.setContent(combinedHTML);
  const pdfBuffer = await page.pdf();
  const filePath = `./_report.pdf`;
  fs.writeFileSync(filePath, pdfBuffer);
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

  const absolutePath = path.resolve(filePath);
  res.download(absolutePath, 'report.pdf', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error sending the file');
    } else {
      fs.unlinkSync(filePath); // Delete the file after sending
    }
  });
});

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "notificationbot001@gmail.com",
    pass: "i x ru x b k b begl tkcz"
  }
  
});

train.post('/send-notification',async(req,res)=>{
  const paymentGate=req.body.sms;
  console.log('Get Ready For: ',req.body);
  try {
    const info = await transporter.sendMail({
        from: '"REBOTT THE TUBIGAN GARDEN BOT" <notificationbot001@gmail.com>',
        to: "kyle.ticman@gmail.com",
        subject: "Tubigan Garden Resort Reservation Notification",
        text: paymentGate,
        html: `
        <h1>Tubigan Garden Resort</h1>
        <h2>--------------------------------</h2>
        <em>${paymentGate}</em>
        `
    });

    console.log("Message sent: %s", info.messageId);
    res.json({ message: 'Email sent successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Email sending failed' });
}
});

train.post('/send-notificationCust',async(req,res)=>{
  const {paymentGate, customer}=req.body;
  console.log('Get Ready For: ',req.body);
  try {
    const info = await transporter.sendMail({
        from: '"REBOTT THE TUBIGAN GARDEN BOT" <notificationbot001@gmail.com>',
        to: `${customer}`,
        subject: "Tubigan Garden Resort Reservation Notification",
        text: paymentGate,
        html: `
        <h1>Tubigan Garden Resort</h1>
        <h2>--------------------------------</h2>
        <em>${paymentGate}</em>`
    });
    console.log("Message sent: %s", info.messageId);
    res.json({ message: 'Email sent successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Email sending failed' });
}
});

train.post('/verifyNotif',async(req,res)=>{
  const {mID,mName,mEmail}=req.body;
  const link=`http://localhost:8080/verifyMem?mID=${mID}&mEmail=${mEmail}`;
  console.log('Get Ready For: ',req.body)
  try{
    const info=await transporter.sendMail({
      from: '"REBOTT THE TUBIGAN GARDEN BOT" <notificationbot001@gmail.com>',
        to: `${mEmail}`,
        subject: "Tubigan Garden Resort User Notification Notification",
        html: `
        <h1>Tubigan Garden Resort</h1>
        <h2>--------------------------------</h2>
        <em>Good Day, ${mName}. Thank you for signing up for our Website! Enclosed is the link to verify your account. Please click it to activate your account so you can start reserving Rooms for Tubigan Garden Resort<br><a href="${link}">Verify account</a><br>We hope to see you soon!</em>
        `
    })
    console.log("Message sent: %s", info.messageId);
    res.json({ message: 'Email sent successfully' });
  }
  catch(err){
    console.error(err)
    res.status(500).json({message:'Email failed to send.'})
  }
})

//#region html foundation
train.get('/',async(req,res)=>{
    res.sendFile(__dirname+'/public/Tubigan Garden Resort.html');
});
//#endregion

//#region data fill-er-upper
train.get('/room-data', async (req, res) => {
    try {
      const dat = await rider.collection('rooms').find({}).sort({"roomName":1}).toArray();
      res.status(200).json(dat);
    } catch (err) {
      console.error('Something went wrong fetching the data from MongoDB', err);
      res.status(500).send('Internal Server Error');
    }
  });

  train.get('/reservation-data',async(req,res)=>{
    try {
      const dat = await rider.collection('reservations').find({}).sort({"resCheckinDate":1,"resBookeDate":1}).toArray();
      res.json(dat);
    } catch (err) {
      console.error('Something went wrong fetching the data from MongoDB', err);
      res.status(500).send('Internal Server Error');
    }
  });

  train.get('/reservation-data-r',async(req,res)=>{
    try {
      const dat = await rider.collection('reservreport').find({}).sort({"resCheckinDate":1,"resBookeDate":1}).toArray();
      res.json(dat);
    } catch (err) {
      console.error('Something went wrong fetching the data from MongoDB', err);
      res.status(500).send('Internal Server Error');
    }
  });

  train.get('/reschedule-data',async(req,res)=>{
    try {
      const dat = await rider.collection('reschedule').find({}).sort({"reDatePost":1}).toArray();
      res.json(dat);
    } catch (err) {
      console.error('Something went wrong fetching the data from MongoDB', err);
      res.status(500).send('Internal Server Error');
    }
  });

  train.get('/admin-data',async(req,res)=>{
    try {
      const dat = await rider.collection('admin').find({}).toArray();
      res.json(dat);
    } catch (err) {
      console.error('Something went wrong fetching the data from MongoDB', err);
      res.status(500).send('Internal Server Error');
    }
  });
  train.get('/member-data',async(req,res)=>{
    try {
      const dat = await rider.collection('members').find({}).toArray();
      res.json(dat);
    } catch (err) {
      console.error('Something went wrong fetching the data from MongoDB', err);
      res.status(500).send('Internal Server Error');
    }
  });

  train.get('/promo-data',async(req,res)=>{
    try{
      const p=await rider.collection('promos').find({}).toArray();
      res.json(p)
    }catch(err){
      console.error("Something went wrong with MongoDB!", err)
      res.status(500).send("Internal Server Error")
    }
  })

  train.get('/runres-data',async(req,res)=>{
    try{
      const p=await rider.collection('running-balance').find({}).toArray();
      res.json(p)
    }catch(err){
      console.error("Something went wrong with MongoDB!", err)
      res.status(500).send("Internal Server Error")
    }
  })

  train.get('/trans-data',async(req,res)=>{
    try{
      const p=await rider.collection('transactions').find({}).toArray();
      res.json(p)
    }catch(err){
      console.error("Something went wrong with MongoDB!", err)
      res.status(500).send("Internal Server Error")
    }
  })
//#endregion 

//#region Database Legend
/*
Legend! for those who's struggling to understand what the FUCK did I do on the tables. Also for my forgetful self.
a- data from admin table
ame- data from amenities table
res- data from reservation table
re- data from reschedule table
m- decided that it'll be data from members table--which are customers that decided to avail for a membership to avoid having to do registration for the reservation again until
combined terms like resamename or reres- means that it's a foreign key; it belongs to another table.
pro- data for promo table.
*/
//#endregion

//#region Reservation-User Table

rider.collection('reservations').createIndex({ resID: 1 }, { unique: true });
rider.collection('reservreport').createIndex({ resID: 1 }, { unique: true });

train.post('/insertRes',async(req,res)=>{
  const {resID,resmID,resmName,resmEmail,resmPhono,resPax,resCax,resRoomName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resStat}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
        await rider.collection('reservations').insertOne({resID,resmID,resmName,resmEmail,resmPhono,resPax,resCax,resRoomName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resStat
        });
        console.log('Record Inserted!');
        res.status(201).json({message:'Record Inserted!'});
  }catch(err){
    console.error('E-E-ERROR! ',err);
    res.status(500).json({ error: 'An error occurred while inserting the record.' });
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});

train.post('/insertRep',async(req,res)=>{
  const {resID,resmID,resmName,resmEmail,resmPhono,resPax,resCax,resRoomName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resStat}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
    if(!rider){
      console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
    }
        await rider.collection('reservreport').insertOne({resID,resmID,resmName,resmEmail,resmPhono,resPax,resCax,resRoomName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resStat
        });
        console.log('Record Inserted!');
        res.status(201).json({message:'Record Inserted!'});
  }catch(err){
    console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
    console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
})

train.get('/searchRes',async(req,res)=>{
  const {resID}=req.query;
  if(resID!=undefined){
    try{
      if(!rider){
          console.log('Forgetting somethign?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const reserv = await rider.collection('reservations').findOne({resID});
      if(reserv){
          console.log('Found it. ',reserv);
          res.status(200).json(reserv);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Query does not exist")
  }
});



train.get('/searchResCust', async(req,res)=>{
  const {resmID}=req.query;
    try{
      if(resmID!=undefined){
        console.log('looking for: ', resmID);
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const count=await rider.collection('reservations').countDocuments({resmID})
      if(count>0){
        if(count>1){
          const reserv = await rider.collection('reservations').find({resmID}).sort({"resCheckinDate":1,"resBookeDate":1}).toArray();
      if(reserv){
          console.log('Transfer!');
          res.status(200).json(reserv);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
        }else{
          const reserv = await rider.collection('reservations').findOne({resmID})
      if(reserv){
          console.log('Transfer!');
          res.status(200).json(reserv);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
        }
      }else {
        console.log('No reservations found with that ID.');
        res.status(404).json({ error: 'No reservations found with the provided ID.' });
      }
      
      } else{
      console.log("Query does not exist")
    } 
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
})

train.get('/searchResRoom', async(req,res)=>{
  const {resRoomName}=req.query;
    try{
      if(resRoomName!=undefined){
        console.log('looking for: ', resRoomName);
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const count = await rider.collection('reservations').countDocuments({resRoomName});
      if (count > 0) {
        console.log(`Found ${count} reservations.`)
        if(count>1){
          console.log(`More than 1 Record detected. Initiating transfer sequence.`);
        const trans = await rider.collection('reservations').find({resRoomName}).toArray();
      if(trans){
          console.log('Transfer!');
          res.status(200).json({data: trans,count:count});
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
        }else{
          const reserv = await rider.collection('reservations').findOne({resRoomName});
          res.status(200).json({data:reserv});
        }
      } else {
        console.log('No reservations found with that ID.');
        res.status(404).json({ error: 'No reservations found with the provided ID.' });
      }
    }else{
      console.log("Query does not exist")
    }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
})

train.patch('/updateRes',async(req,res)=>{
  const {resID,resmID,resmName,resmEmail,resmPhono,resPax,resCax,resRoomName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resStat}=req.body;
  console.log('Get Ready For:',req.body);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
        const updootQ={resID};
      const updootV={$set:{}}
      if(resmID) updootV.$set.resmID=resmID;
      if(resmName) updootV.$set.resmName=resmName;
      if(resmEmail) updootV.$set.resmEmail=resmEmail;
      if(resmPhono) updootV.$set.resmPhono=resmPhono;
      if(resPax) updootV.$set.resPax=resPax;
      if(resCax) updootV.$set.resCax=resCax;
      if(resRoomName) updootV.$set.resRoomName=resRoomName;
      if(resCheckinDate) updootV.$set.resCheckinDate=resCheckinDate;
      if(resCheckoutDate) updootV.$set.resCheckoutDate=resCheckoutDate;
      if(resBookeDate) updootV.$set.resBookeDate=resBookeDate;
      if(resTour) updootV.$set.resTour=resTour;
      if(resPrice) updootV.$set.resPrice=resPrice;
      if(resPromo) updootV.$set.resPromo=resPromo;
      if(resPayMeth) updootV.$set.resPayMeth=resPayMeth;
      if(resPayStat) updootV.$set.resPayStat=resPayStat;
      if(resStat) updootV.$set.resStat=resStat;

      const result=await rider.collection('reservations').updateOne(updootQ,updootV);
      if (result.matchedCount > 0) {
          console.log('Document updated successfully.');
          res.status(200).json({ message: 'Document updated successfully!' });
        } else {
          console.log('No document found with the provided ID.');
          res.status(404).json({ error: 'No document found with the provided ID.' });
        }
      }
catch(err){
  console.error('Error updating document:', err);
  res.status(500).json({ error: 'An error occurred while updating the document.' })
}});

train.post('/deletRes',async(req,res)=>{
  const {resID}=req.body;
  console.log('Say Bye For: ',req.body);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const deletQ={resID};
      const result=await rider.collection('reservations').deleteOne(deletQ);
      if (result.deletedCount>0){
          console.log('Document Deleted.');
          res.status(200).json({message:`Document deleted successfully!`});
      }else{
          console.log('That reservation does not exist...With that ID, at least.');
          res.status(404).json({error:'No document is found with the provided ID.'});
      }
  }catch(err){
      console.error('E-E-ERROR! ',err);
      res.status(500).json({error:'An error occured while deleting the document.'})
  }
});
//#endregion

//#region Roomnities Table

rider.collection('rooms').createIndex({roomName: 1 }, { unique: true });

train.post('/insertRoom',upload.single('roomImg'),async(req,res)=>{
  const {roomName,roomDesc,roomSize,roomCost,roomReservd,roomLeft}=req.body;
  console.log('Get Ready For: ',req.body," ",req.file.originalname);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
      const params = {
        Bucket: "cyclic-calm-pink-glasses-ap-southeast-1",
        Key: `media/${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };
      await rider.collection('rooms').insertOne({
        roomName,roomImg:`https://${process.env.BUCKET_NAME}.s3.amazonaws.com/media/${req.file.originalname}`,roomDesc,roomSize,roomCost,roomReservd,roomLeft
      });
      console.log('Record Inserted!');
      res.status(201).json({message:'Record Inserted!'});
  }catch(err){
      if(err.name==='MongoError'&& err.code===11000){
          console.log('Duplicate Entry for the provided ID: ',roomName);
          return res.status(400).json({error:'the provided reservation already exists.'});
      }
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});

train.get('/searchRoom',async(req,res)=>{
  const {roomName}=req.query;
  try{
    if(roomName!=undefined){
      console.log('looking for: ', req.query)
      if(!rider){
        console.log('Forgetting somethign?');
        return res.status(500).json({error:'Database is not ready.'});
    }
    const ame = await rider.collection('rooms').findOne({roomName});
    if(ame){
        console.log('Found it. ', ame);
        res.status(200).json(ame);
    }else{
        console.log('Record Not Found with that ID.');
        res.status(404).json({error:'An Error occured while looking for the record.'});
    }
    }
    else{
      console.log("Query does not exist")
    }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
});

train.patch('/updateRoom',upload.single('roomImg'),async(req,res)=>{
  const {roomName,roomImg,roomDesc,roomSize,roomCost,roomReservd,roomLeft}=req.body;
  const roomImgPath = req.file ? req.file.filename : null;
  console.log('Get Ready For:',req.body);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const updootQ={roomName};
      const updootV={$set:{}}
      if (roomImgPath) updootV.$set.roomImg = `media/${roomImgPath}`;
    if (roomDesc) updootV.$set.roomDesc = roomDesc;
    if (roomSize) updootV.$set.roomSize = roomSize;
    if (roomCost) updootV.$set.roomCost = roomCost;
    if (roomReservd) updootV.$set.roomReservd = roomReservd;
    if (roomLeft) updootV.$set.roomLeft = roomLeft;
      const result=await rider.collection('rooms').updateOne(updootQ,updootV);
      if (result.matchedCount > 0) {
          console.log('Document updated successfully.');
          res.status(200).json({ message: 'Document updated successfully!' });
        } else {
          console.log('No document found with the provided ID.');
          res.status(404).json({ error: 'No document found with the provided ID.' });
        }
}catch(err){
  console.error('Error updating document:', err);
  res.status(500).json({ error: 'An error occurred while updating the document.' })
}});

train.post('/deletRoom',async(req,res)=>{
  const {roomName}=req.body;
  console.log('Say Bye For: ',roomName);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const deletQ={roomName};
      const result=await rider.collection('rooms').deleteOne(deletQ);
      if (result.deletedCount>0){
          console.log('Document Deleted.');
          res.status(200).json({message:`Document deleted successfully!`});
      }else{
          console.log('That record does not exist...With that ID, at least.');
          res.status(404).json({error:'No document is found with the provided ID.'});
      }
  }catch(err){
      console.error('E-E-ERROR! ',err);
      res.status(500).json({error:'An error occured while deleting the document.'})
  }
});
//#endregion

//#region Admin User Table
rider.collection('admin').createIndex({ aID: 1 }, { unique: true });

train.post('/insertAdmin',async(req,res)=>{
  const {aID,afName,alName,aEmail,aPass}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
      await rider.collection('admin').insertOne({
        aID,afName,alName,aEmail,aPass
      });
      console.log('Record Inserted!');
      res.status(201).json({message:'Record Inserted!'});
  }catch(err){
      if(err.name==='MongoError'&& err.code===11000){
          console.log('Duplicate Entry for the provided ID: ',aID);
          return res.status(400).json({error:'the provided reservation already exists.'});
      }
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});


train.get('/searchAdmin',async(req,res)=>{
  const {aID}=req.query;
  if(aID!=undefined){
    try{
      console.log('looking for: ', req.query)
      if(!rider){
          console.log('Forgetting somethign?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const ame = await rider.collection('admin').findOne({aID});
      if(ame){
          console.log('Found it. ', ame);
          res.status(200).json(ame);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Query does not exist")
  }
});

train.post('/updateAdmin',async(req,res)=>{
  const {aID,afName,alName,aEmail,aPass}=req.body;
  console.log('Get Ready For:',req.body);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const updootQ={aID};
      const updootV={$set:{afName,alName,aEmail,aPass}}
      const result=await rider.collection('admin').updateOne(updootQ,updootV);
      if (result.matchedCount > 0) {
          console.log('Document updated successfully.');
          res.status(200).json({ message: 'Document updated successfully!' });
        } else {
          console.log('No document found with the provided ID.');
          res.status(404).json({ error: 'No document found with the provided ID.' });
        }
}catch(err){
  console.error('Error updating document:', err);
  res.status(500).json({ error: 'An error occurred while updating the document.' })
}});

train.post('/deletAdmin',async(req,res)=>{
  const {aID}=req.body;
  console.log('Say Bye For: ',aID);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const deletQ={aID};
      const result=await rider.collection('admin').deleteOne(deletQ);
      if (result.deletedCount>0){
          console.log('Document Deleted.');
          res.status(200).json({message:`Document deleted successfully!`});
      }else{
          console.log('That record does not exist...With that ID, at least.');
          res.status(404).json({error:'No document is found with the provided ID.'});
      }
  }catch(err){
      console.error('E-E-ERROR! ',err);
      res.status(500).json({error:'An error occured while deleting the document.'})
  }
});

//#endregion

//#region Reschedule Table
rider.collection('reschedule').createIndex({ reID: 1 }, { unique: true });

train.post('/insertResched',async(req,res)=>{
  const {reDatePost,reID,reresID,remID,reresRoomName,reresTour,renewTour,reresPayMeth,renewPayMeth,reresCheckInDate,reresCheckOutDate,reresBookeDate,renCheckInDate,renCheckOutDate,renBookeDate,reschedStat}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
      await rider.collection('reschedule').insertOne({
        reDatePost,reID,reresID,remID,reresRoomName,reresTour,renewTour,reresPayMeth,renewPayMeth,reresCheckInDate,reresCheckOutDate,reresBookeDate,renCheckInDate,renCheckOutDate,renBookeDate,reschedStat
      });
      console.log('Record Inserted!');
      res.status(201).json({message:'Record Inserted!'});
  }catch(err){
      if(err.name==='MongoError'&& err.code===11000){
          console.log('Duplicate Entry for the provided ID: ', reID);
          return res.status(400).json({error:'the provided request already exists.'});
      }
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});

train.get('/searchResched',async(req,res)=>{
  const {reID}=req.query;
  if(reID!=undefined){
    try{
    console.log('looking for: ', req.query)
      if(!rider){
          console.log('Forgetting somethign?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const ame = await rider.collection('reschedule').findOne({reID});
      if(ame){
          console.log('Found it. ', ame);
          res.status(200).json(ame);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Query does not exist")
  }
});


train.post('/deletResched',async(req,res)=>{
  const {reID}=req.body;
  console.log('Say Bye For: ',reID);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const deletQ={reID};
      const result=await rider.collection('reschedule').deleteOne(deletQ);
      if (result.deletedCount>0){
          console.log('Document Deleted.');
          res.status(200).json({message:`Document deleted successfully!`});
      }else{
          console.log('That record does not exist...With that ID, at least.');
          res.status(404).json({error:'No document is found with the provided ID.'});
      }
  }catch(err){
      console.error('E-E-ERROR! ',err);
      res.status(500).json({error:'An error occured while deleting the document.'})
  }
});

//#endregion

//#region Members Table
rider.collection('members').createIndex({ mID: 1 }, { unique: true });

train.post('/insertMem',async(req,res)=>{
  const {mID,mName,mEmail,mPass,mPhoNo,mAccApp}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
      await rider.collection('members').insertOne({
        mID,mName,mEmail,mPass,mPhoNo,mAccApp
      });
      console.log('Record Inserted!');
      res.status(201).json({message:'Record Inserted!'});
  }catch(err){
      if(err.name==='MongoError'&& err.code===11000){
          console.log('Duplicate Entry for the provided ID: ',aID);
          return res.status(400).json({error:'the provided reservation already exists.'});
      }
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});

train.get('/searchMem',async(req,res)=>{
  const {mID}=req.query;
  if(mID!=undefined){
    try{
    console.log('looking for: ', req.query)
      if(!rider){
          console.log('Forgetting somethign?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const ame = await rider.collection('members').findOne({mID});
      if(ame){
          console.log('Found it. ', ame);
          res.status(200).json(ame);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Query does not exist")
  }
});

train.post('/updateMem',async(req,res)=>{
  const {mID,mName,mEmail,mPass,mPhoNo,mAccApp}=req.body;
  console.log('Get Ready For:',req.body);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const updootQ={mID};
      const updootV={$set:{mName,mEmail,mPass,mPhoNo,mAccApp}}
      const result=await rider.collection('members').updateOne(updootQ,updootV);
      if (result.matchedCount > 0) {
          console.log('Document updated successfully.');
          res.status(200).json({ message: 'Document updated successfully!' });
        } else {
          console.log('No document found with the provided ID.');
          res.status(404).json({ error: 'No document found with the provided ID.' });
        }
}catch(err){
  console.error('Error updating document:', err);
  res.status(500).json({ error: 'An error occurred while updating the document.' })
}});

train.get('/verifyMem',async(req,res)=>{
  const {mID,mEmail}=req.query;
  console.log('Get Ready For:',req.query);
  console.log('Get Ready For:'+mID+" "+mEmail)
try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const mAccApp="Active"
      const updootQ={mID};
      const updootV={$set:{mAccApp}}
      const result=await rider.collection('members').updateOne(updootQ,updootV);
      if (result.matchedCount > 0) {
          console.log('Document updated successfully.');
          res.sendFile(__dirname+'/public/verified.html')
        } else {
          console.log('No document found with the provided ID.');
        }
}catch(err){
  console.error('Error updating document:', err);
}
});

train.post('/deletMem',async(req,res)=>{
  const {mID}=req.body;
  console.log('Say Bye For: ',mID);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const deletQ={mID};
      const result=await rider.collection('members').deleteOne(deletQ);
      if (result.deletedCount>0){
          console.log('Document Deleted.');
          res.status(200).json({message:`Document deleted successfully!`});
      }else{
          console.log('That record does not exist...With that ID, at least.');
          res.status(404).json({error:'No document is found with the provided ID.'});
      }
  }catch(err){
      console.error('E-E-ERROR! ',err);
      res.status(500).json({error:'An error occured while deleting the document.'})
  }
});
//#endregion

//#region Promos Table
rider.collection('promos').createIndex({ proID: 1 }, { unique: true });

train.post('/insertPro',async(req,res)=>{
  const {proID,proName,proDesc,proFX,proStart,proEnd,proStat}=req.body
  console.log("Get Ready For: ",req.body)
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
      await rider.collection('promos').insertOne({
        proID,proName,proDesc,proFX,proStart,proEnd,proStat
      });
      console.log('Record Inserted!');
      res.status(201).json({message:'Record Inserted!'});
  }catch(err){
      if(err.name==='MongoError'&& err.code===11000){
          console.log('Duplicate Entry for the provided ID: ',aID);
          return res.status(400).json({error:'the provided reservation already exists.'});
      }
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }

})
train.get('/searchPro',async(req,res)=>{
  const {proID}=req.body
  if(proID!=undefined){
    try{
    console.log('Looking for', req.body)
    if(!rider){
      console.log('Forgettting something?')
      return res.status(500).json({error:'Database is not ready.'})
    }
    const promoL=await rider.collection('promos').findOne({proID})
    if(promoL){
      console.log('Found it')
      return res.status(200).json(promoL)
    }else{
      console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
    }
  }catch(err){
    console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Query does not exist")
  }
})

train.post('/updatePro',async(req,res)=>{
  const {proID,proName,proDesc,proFX,proStart,proEnd,proStat}=req.body
  const updootQ={proID};
      const updootV={$set:{proName,proDesc,proFX,proStart,proEnd,proStat}}
      const result=await rider.collection('promos').updateOne(updootQ,updootV);
      if (result.matchedCount > 0) {
          console.log('Document updated successfully.');
          res.status(200).json({ message: 'Document updated successfully!' });
        } else {
          console.log('No document found with the provided ID.');
          res.status(404).json({ error: 'No document found with the provided ID.' });
        }
})
train.post('/deletPro',async(req,res)=>{
  const {proID}=req.body;
  console.log('Say Bye for: ',req.body);
  try{
    if(!rider){
      console.log('Forgetting something?')
      return res.status(500).json({error:'Database is not ready.'})
    }
    const deletQ={proID}
    const result=await rider.collection('promos').deleteOne(deletQ)
    if(result.deletedCount>0){
      console.log('Document Deleted')
      res.status(200).json({message:'Document deleted successfully.'})
    }else{
      console.log('That record does not exist...With that ID, at least.');
          res.status(404).json({error:'No document is found with the provided ID.'});
    }
  }catch(err){
    console.error('E-E-ERROR! ',err)
    res.status(500).json({error: 'An error occured while deleting the document.'})
  }
})
//#endregion

//#region Running Balance
rider.collection('running-balance').createIndex({ runresID: 1 }, { unique: true });

train.post('/insertRun',async(req,res)=>{
  const {runID,runresID,runresPrice,runresBal,runresStat}=req.body
  console.log("Get Ready For: ",req.body)
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
        await rider.collection('running-balance').insertOne({
          runID,runresID,runresPrice,runresBal,runresStat
        });
        console.log('Record Inserted!');
        res.status(201).json({message:'Record Inserted!'}); 
  }catch(err){
      if(err.name==='MongoError'&& err.code===11000){
          console.log('Duplicate Entry for the provided ID: ',runID);
          return res.status(400).json({error:'the provided reservation already exists.'});
      }
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }

})

train.get('/searchRun',async(req,res)=>{
  const {runID}=req.query
  console.log(req.query)
  if(runID!=undefined){
    try{
    console.log('Looking for', req.query)
    if(!rider){
      console.log('Forgettting something?')
      return res.status(500).json({error:'Database is not ready.'})
    }
    const runL=await rider.collection('running-balance').findOne({runID})
    if(runL){
      console.log('Found it')
      return res.status(200).json(runL)
    }else{
      console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
    }
  }catch(err){
    console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Query does not exist")
  }
})

train.get('/searchRunRes',async(req,res)=>{
  const {runresID}=req.query
  console.log(req.query)
  if(runresID!=undefined){
    try{
    console.log('Looking for', req.query)
    if(!rider){
      console.log('Forgettting something?')
      return res.status(500).json({error:'Database is not ready.'})
    }
    const runL=await rider.collection('running-balance').findOne({runresID})
    if(runL){
      console.log('Found it')
      return res.status(200).json(runL)
    }else{
      console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
    }
  }catch(err){
    console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Query does not exist")
  }
})

train.post('/updateRun',async(req,res)=>{
  const {runID,runresID,runresPrice,runresBal,runresStat}=req.body
  const updootQ={runID};
      const updootV={$set:{runresID,runresPrice,runresBal,runresStat}}
      const result=await rider.collection('running-balance').updateOne(updootQ,updootV);
      if (result.matchedCount > 0) {
          console.log('Document updated successfully.');
          res.status(200).json({ message: 'Document updated successfully!' });
        } else {
          console.log('No document found with the provided ID.');
          res.status(404).json({ error: 'No document found with the provided ID.' });
        }
})
train.post('/deletRun',async(req,res)=>{
  const {runID}=req.body;
  console.log('Say Bye for: ',req.body);
  try{
    if(!rider){
      console.log('Forgetting something?')
      return res.status(500).json({error:'Database is not ready.'})
    }
    const deletQ={runID}
    const result=await rider.collection('running-balance').deleteOne(deletQ)
    if(result.deletedCount>0){
      console.log('Document Deleted')
      res.status(200).json({message:'Document deleted successfully.'})
    }else{
      console.log('That record does not exist...With that ID, at least.');
          res.status(404).json({error:'No document is found with the provided ID.'});
    }
  }catch(err){
    console.error('E-E-ERROR! ',err)
    res.status(500).json({error: 'An error occured while deleting the document.'})
  }
})

//#endregion

//#region transaction Table command
rider.collection('transactions').createIndex({ tID: 1 }, { unique: true });

train.post('/insertTrans',async(req,res)=>{
  const {tID,tresID,tresmID,tresmEmail,tresmPhono,tresParty,tresRoomName,tresBookIn,tresCheckIn,tresPayMeth,tresPrice,tPaid,tDatePost}=req.body
  console.log("Get Ready For: ", req.body)
  try{
    if(!rider){
      console.log("Where's the Database?")
      return res.status(500).json({error:"Database is not ready"})
    }
    await rider.collection('transactions').insertOne({tID,tresID,tresmID,tresmEmail,tresmPhono,tresParty,tresRoomName,tresBookIn,tresCheckIn,tresPayMeth,tresPrice,tPaid,tDatePost})
    console.log('Record Inserted!')
    res.status(201).json({message:'Record Inserted!'})
  }catch(err){
    if(err.name==='MongoError'&& err.code===11000){
      console.log('Duplicate Entry for the provided ID: ', reID);
      return res.status(400).json({error:'the provided request already exists.'});
  }
  console.error('E-E-ERROR! ',err);
  res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
})
train.get('/searchTrans',async(req,res)=>{
  const {tID}=req.query
  if(tID!=undefined){
    try{
      console.log('looking for: ',req.query)
      if(!rider){
        console.log("Where's the Database?")
        return res.status(500).json({error:'Database is not ready.'});
      }
      const id=await rider.collection('transaction').findOne({tID})
      if(id){
        console.log('Found it. ', id)
        res.status(200).json(id)
      }else{
        console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
    }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
    }
  }
})
train.get('/deletTrans',async(req,res)=>{
  const {tID}=req.query
  if(tID!=undefined){
    try{
      console.log('say bye for: ',req.query)
      if(!rider){
        console.log("Where's the Database?")
        return res.status(500).json({error:'Database is not ready.'});
      }
      const deletQ={tID}
      const result=await rider.collection('transaction').deleteOne({deletQ})
      if (result.deletedCount>0){
        console.log('Document Deleted.');
        res.status(200).json({message:`Document deleted successfully!`});
    }else{
        console.log('That record does not exist...With that ID, at least.');
        res.status(404).json({error:'No document is found with the provided ID.'});
    }
    }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
    }
  }
})
//#endregion

//#region Login Commands



train.post('/loginMem', async(req,res)=>{
  let {mID,mPass}=req.body;
  console.log("Get Ready For: ",req.body)
  try {
      const client = await rider.collection('members').findOne({
        mID: { $regex: new RegExp(`^${mID}$`) },
      });
  
      if (client && client.mPass === mPass) { 
        res.cookie('user',mID)
        res.json({ success: true, client });
      } else {
        res.json({ success: false, message: 'Invalid ID or password' });
      }
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

train.post('/loginAdmin', async (req, res) => {
  const { aID, aPass } = req.body;
  console.log('get ready for:', req.body)
  res.cookie('aUser',aID)
  try {
    const client = await rider.collection('admin').findOne({aID,aPass});

    if (client) { 
      res.json({ success: true, client });
    } else {
      res.json({ success: false, message: 'Invalid ID or password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

train.get('/current_Mem', async(req,res)=>{
  const mID=req.cookies.user;
    console.log('looking for: ',mID);
    try{
        if(!rider){
            console.log('Forgetting something?');
            return res.status(500).json({error:'Database is not ready.'});
        }
        const mem = await rider.collection('members').findOne({mID});
        if(mem){
            console.log('Found it. ',mem);
            res.status(200).json(mem);
        }else{
            console.log('Record Not Found with that ID.');
            res.status(404).json({error:'An Error occured while looking for the record.'});
        }
    }catch(err){
        console.error('Error while looking for record. ',err);
        res.status(500).json({error:'an error has occured while searching for the record.'});
    }
  })

train.post('/applyCurrentRes',async(req,res)=>{
  const {resID}=req.body
  console.log("Get Ready For: ", resID)
  res.cookie('curRes',resID)
  console.log(req.cookies.curRes)
  res.json({success:true});
})

train.get('/current_reservation',async(req,res)=>{
  const resID=req.cookies.curRes;
    console.log('looking for: ',resID);
    try{
        if(!rider){
            console.log('Forgetting something?');
            return res.status(500).json({error:'Database is not ready.'});
        }
        const mem = await rider.collection('reservations').findOne({resID});
        if(mem){
            console.log('Found it. ',mem);
            res.status(200).json(mem);
        }else{
            console.log('Record Not Found with that ID.');
            res.status(404).json({error:'An Error occured while looking for the record.'});
        }
    }catch(err){
        console.error('Error while looking for record. ',err);
        res.status(500).json({error:'an error has occured while searching for the record.'});
    }
});

train.get("/current_ResCount",async(req,res)=>{
  const resmID=req.cookies.user;
  if(resmID!=undefined){
    console.log('looking for: ', resmID);
    try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const count = await rider.collection('reservations').countDocuments({resmID});
       if (count > 0) {
        console.log(`Found ${count} reservations.`);
        res.status(200).json({ count: count });
      } else {
        console.log('No reservations found with that ID.');
        res.status(404).json({ error: 'No reservations found with the provided ID.' });
      }
    } catch (err) {
      console.error('Error while counting reservations. ', err);
      res.status(500).json({ error: 'An error has occurred while counting reservations.' });
    }
  } else {
    console.log("Session does not exist");
  }
})


train.post('/applyCurrentActive',async(req,res)=>{
  const {it}=req.body
  console.log("Get Ready For: ", it)
  res.cookie('curAct',it)
  console.log(req.cookies.curAct)
  res.json({success:true});
})

train.get('/logout', async(req, res) => {
  let prev=req.cookies.curAct
  console.log("previous user type: "+prev)
  if(prev=="admin"){
    res.clearCookie('aUser')
  }
    res.clearCookie('user')
    res.clearCookie('curRes')
    res.json({message:"Cookies cleared"})
  console.log(req.cookies.aUser)
  console.log(req.cookies.user)
  console.log(req.curRes)
});


//#endregion
