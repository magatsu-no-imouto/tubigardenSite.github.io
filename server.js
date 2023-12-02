const {MongoClient}=require("mongodb");
const uri='mongodb+srv://dbadmin:ji14c7mmiS1cT4Bd@c0.yglrytp.mongodb.net/?retryWrites=true&w=majority'; //database
const options={
useNewUrlParser:true,
useUnifiedTopology:true,
};

const client=new MongoClient(uri);
let rider=client.db('db-TubigardenResort-depl');

async function connecto(){
    try{
        await client.connect();
        console.log("Database, please!");
    }catch(err){
        console.error("E-E-ERROR!",err);
    }
}

connecto();

const exp=require('express');
const cookieParser = require('cookie-parser');
const train=exp();
const port=8080;
const cors=require('cors');
train.use(exp.json());
train.use(cors());
train.use(exp.static('public'));
train.use(cookieParser());
const fs = require('fs');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
train.use(bodyParser.urlencoded({ extended: true }));
train.use(bodyParser.json());

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
await page.setContent(combinedHTML);
  const pdfBuffer = await page.pdf();
  const filePath = `./${Date.now()}_report.pdf`;
  fs.writeFileSync(filePath, pdfBuffer);
  await browser.close();

  res.send('PDF generation successful.');
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
  let {paymentGate, customer}=req.body;
  console.log('Get Ready For: ',req.body);
  try {
    const info = await transporter.sendMail({
        from: '"BOTT THE BOT" <notificationbot001@gmail.com>',
        to: "kyle.ticman@gmail.com",
        subject: "Tubigan Garden Resort Reservation Notification",
        text: paymentGate,
        html: `<em>${paymentGate}</em>`
    });

    console.log("Message sent: %s", info.messageId);
    res.json({ message: 'Email sent successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Email sending failed' });
}
});

train.listen(port,()=>{
    console.log(`Connecto, ${port}`);
    });

//#region html foundation
train.get('/',async(req,res)=>{
    res.sendFile(__dirname+'/public/Tubigan Garden Resort.html');
});
//#endregion

//#region data fill-er-upper
train.get('/amenities-data', async (req, res) => {
    try {
      const dat = await rider.collection('amenities').find({}).sort({"ameName":1}).toArray();
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
      const count=await rider.collection('reservreport').countDocuments({})
      res.json({data:dat, count:count});
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
  const {resID,rescID,rescName,resPax,resCax,rescEmail,rescphono,rescPass,resAmeName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resAppStat}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
        await rider.collection('reservations').insertOne({
          resID,rescID,rescName,resPax,resCax,rescEmail,rescphono,rescPass,resAmeName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resAppStat
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
  const {resID,rescID,rescName,resPax,resCax,rescEmail,rescphono,rescPass,resAmeName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resAppStat}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
    if(!rider){
      console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
    }
        await rider.collection('reservreport').insertOne({
          resID,rescID,rescName,resPax,resCax,rescEmail,rescphono,rescPass,resAmeName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resAppStat
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

train.get('/checkRes',async(req,res)=>{
  const {resID}=req.query;
  if(resID!=undefined){
    try{
      if(!rider){
          console.log('Forgetting somethign?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const reserv = await rider.collection('reservreport').findOne({resID});
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
  const {rescID}=req.query;
    try{
      if(rescID!=undefined){
        console.log('looking for: ', rescID);
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const count = await rider.collection('reservations').countDocuments({rescID});
      if (count > 0) {
        console.log(`Found ${count} reservations.`)
        if(count>1){
          console.log(`More than 1 Record detected. Initiating transfer sequence.`);
        const trans = await rider.collection('reservations').find({rescID}).skip(1).toArray();
      if(trans){
          console.log('Transfer!');
          res.status(200).json(trans);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
        }else{
          const reserv = await rider.collection('reservations').findOne({rescID});
          res.status(200).json(reserv);
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

train.get('/searchResCustAll', async(req,res)=>{
  const {rescID}=req.query;
    try{
      if(rescID!=undefined){
        console.log('looking for: ', rescID);
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const count = await rider.collection('reservations').countDocuments({rescID});
      if (count > 0) {
        console.log(`Found ${count} reservations.`)
        if(count>1){
          console.log(`More than 1 Record detected. Initiating transfer sequence.`);
        const trans = await rider.collection('reservations').find({rescID}).toArray();
      if(trans){
          console.log('Transfer!');
          res.status(200).json(trans);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
        }else if(count=1){
          const reserv = await rider.collection('reservations').findOne({rescID});
          res.status(200).json(reserv);
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

train.get('/searchResCustLite', async(req,res)=>{
  const {rescID}=req.query;
    try{
      if(rescID!=undefined){
        console.log('looking for: ', rescID);
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const reserv = await rider.collection('reservations').findOne({rescID});
      if(reserv){
          console.log('Transfer!');
          res.status(200).json(reserv);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
      } else{
      console.log("Query does not exist")
    } 
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
 
  
})

train.get('/searchResAme', async(req,res)=>{
  const {resAmeName}=req.query;
    try{
      if(resAmeName!=undefined){
        console.log('looking for: ', resAmeName);
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const count = await rider.collection('reservations').countDocuments({resAmeName});
      if (count > 0) {
        console.log(`Found ${count} reservations.`)
        if(count>1){
          console.log(`More than 1 Record detected. Initiating transfer sequence.`);
        const trans = await rider.collection('reservations').find({resAmeName}).toArray();
      if(trans){
          console.log('Transfer!');
          res.status(200).json({data: trans,count:count});
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
        }else{
          const reserv = await rider.collection('reservations').findOne({resAmeName});
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

train.get('/searchRes-Filter', async(req,res)=>{
  const {resHuh, resTime, resPayStat, resAppStat, resAmeName,startDate,endDate}=req.query;
    try{
      if(resHuh!=undefined){
        console.log('looking for: ', req.query);
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      if(resAppStat){
        const countA = await rider.collection('reservreport').countDocuments({resAppStat});
        const countB = await rider.collection('reservations').countDocuments({resAppStat});
      const count=countA+countB
      if (count > 0) {
        console.log(`Found ${count} reservations.`)
        if(count>1){
          console.log(`More than 1 Record detected. Initiating transfer sequence.`);
          const transA = await rider.collection('reservations').find({ resAppStat }).toArray();
          const transB = await rider.collection('reservreport').find({ resAppStat }).toArray();
          if(transA && !transB){
            console.log('Transfer!');
            res.status(200).json({data: transA,count:count});
          }else if(!transA && transB){
            console.log('Transfer!');
            res.status(200).json({data: transB,count:count,transB:"Yes"});
          }else if(transA && transB){
            const trans = [...transA, ...transB];
              if(trans){
          console.log('Transfer!');
          res.status(200).json({data: trans,count:count,transB:"Yes"});
              }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
             }
          }
        }else{
          if(countA>0){
            const reserv = await rider.collection('reservreport').findOne({resAppStat});
          res.status(200).json({data:reserv,transB:"Yes"});
          }else if(countB>0){
            const reserv = await rider.collection('reservations').findOne({resAppStat});
          res.status(200).json({data:reserv});
          }
        }
      } else {
        console.log('No reservations found with that ID.');
        res.status(404).json({ error: 'No reservations found with the provided ID.' });
      }
      }else if(resPayStat){
        const countA = await rider.collection('reservreport').countDocuments({resPayStat});
      const countB = await rider.collection('reservations').countDocuments({resPayStat});
      const count=countA+countB
      if (count > 0) {
        console.log(`Found ${count} reservations.`)
        if(count>1){
          console.log(`More than 1 Record detected. Initiating transfer sequence.`);
          const transA = await rider.collection('reservations').find({ resPayStat }).toArray();
          const transB = await rider.collection('reservreport').find({ resPayStat }).toArray();
          if(transA && !transB){
            console.log('Transfer!');
            res.status(200).json({data: transA,count:count});
          }else if(!transA && transB){
            console.log('Transfer!');
            res.status(200).json({data: transB,count:count,transB:"Yes"});
          }else if(transA && transB){
            const trans = [...transA, ...transB];
              if(trans){
          console.log('Transfer!');
          res.status(200).json({data: trans,count:count,transB:"Yes"});
              }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
             }
          }
        }else{
          if(countA>0){
            const reserv = await rider.collection('reservations').findOne({resPayStat});
          res.status(200).json({data:reserv,transB:"Yes"});
          }else if(countB>0){
            const reserv = await rider.collection('reservreport').findOne({resPayStat});
          res.status(200).json({data:reserv});
          }
        }
      } else {
        console.log('No reservations found with that ID.');
        res.status(404).json({ error: 'No reservations found with the provided ID.' });
      }
      }else if(resAmeName){
        const regexAmeName = new RegExp(resAmeName, 'i');
        const countA = await rider.collection('reservreport').countDocuments({resAmeName:{$regex:regexAmeName}});
        const countB = await rider.collection('reservations').countDocuments({resAmeName:{$regex:regexAmeName}});
        const count=countA+countB
        if (count > 0) {
          console.log(`Found ${count} reservations.`)
          console.log(`Count A: ${countA}`)
          console.log(`Count B: ${countB}`)
          if(count>=2){
            console.log("Me2")
            console.log(`More than 1 Record detected. Initiating transfer sequence.`);
            const transA = await rider.collection('reservations').find({ resAmeName:{$regex:regexAmeName} }).toArray();
            const transB = await rider.collection('reservreport').find({ resAmeName:{$regex:regexAmeName} }).toArray();
            if(transA && !transB){
              console.log('Transfer!');
              res.status(200).json({data: transA,count:count});
            }else if(!transA && transB){
              console.log('Transfer!');
              res.status(200).json({data: transB,count:count,transB:"Yes"});
            }else if(transA && transB){
              const trans = [...transA, ...transB];
                if(trans){
            console.log('Transfer!');
            res.status(200).json({data: trans,count:count,transB:"Yes"});
                }else{
            console.log('Record Not Found with that ID.');
            res.status(404).json({error:'An Error occured while looking for the record.'});
               }
            }
          }else if(count==1){
            if(countA>0){
              const reserv = await rider.collection('reservreport').findOne({resAmeName:{$regex:regexAmeName}});
            res.status(200).json({data:reserv,transB:"Yes"});
            }else if(countB>0){
              console.log("It should've been me.")
              const reserv = await rider.collection('reservations').findOne({resAmeName:{$regex:regexAmeName}});
            res.status(200).json({data:reserv});
            }
          }
        }else{
          console.log('Record Not Found with that ID.');
            res.status(404).json({error:'An Error occured while looking for the record.'});
        }
      }else if(resTime){
        const countA = await rider.collection('reservreport').countDocuments({resCheckinDate:{$gte: startDate,$lt:endDate}});
      const countB = await rider.collection('reservations').countDocuments({resCheckinDate:{$gte: startDate,$lt:endDate}});
      const count=countA+countB
      if (count > 0) {
        console.log(`Found ${count} reservations.`)
        if(count>1){
          console.log(`More than 1 Record detected. Initiating transfer sequence.`);
          const transA = await rider.collection('reservations').find({ resCheckinDate:{$gte: startDate,$lt:endDate}}).toArray();
          const transB = await rider.collection('reservreport').find({ resCheckinDate:{$gte: startDate,$lt:endDate}}).toArray();
          if(transA && !transB){
            console.log('Transfer!');
            res.status(200).json({data: transA,count:count,startDate:startDate,endDate:endDate});
          }else if(!transA && transB){
            console.log('Transfer!');
            res.status(200).json({data: transB,count:count,transB:"Yes",startDate:startDate,endDate:endDate});
          }else if(transA && transB){
            const trans = [...transA, ...transB];
              if(trans){
          console.log('Transfer!');
          res.status(200).json({data: trans,count:count,startDate:startDate,endDate:endDate});
              }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
             }
          }
        }else if(count==1){
          if(countA>0){
            const reserv = await rider.collection('reservreport').findOne({resCheckinDate:{$gte: startDate,$lt:endDate}});
          res.status(200).json({data:reserv,transB:"Yes",startDate:startDate,endDate:endDate});
          }else if(countB>0){
            const reserv = await rider.collection('reservations').findOne({resCheckinDate:{$gte: startDate,$lt:endDate}});
          res.status(200).json({data:reserv,startDate:startDate,endDate:endDate});
          }
        }
      } else {
        console.log('No reservations found with that ID.');
        res.status(404).json({ error: 'No reservations found with the provided ID.' });
      }
      }
    }else{
      console.log("Query does not exist")
    }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
})

train.post('/updateRes',async(req,res)=>{
  const {resID,rescID,rescName,resPax,resCax,rescEmail,rescphono,rescPass,resAmeName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resAppStat}=req.body;
  console.log('Get Ready For:',req.body);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
        const updootQ={resID};
      const updootV={$set:{rescName,rescID,resPax,resCax,rescEmail,rescphono,rescPass,resAmeName,resCheckinDate,resCheckoutDate,resBookeDate,resTour,resPrice,resPromo,resPayMeth,resPayStat,resAppStat}}
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

//#region Amenities Table

rider.collection('amenities').createIndex({ameName: 1 }, { unique: true });

train.post('/insertAme',async(req,res)=>{
  const {ameName,ameSize,ameCost,ameReservd,ameLeft}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
      await rider.collection('amenities').insertOne({
        ameName,ameSize,ameCost,ameReservd,ameLeft
      });
      console.log('Record Inserted!');
      res.status(201).json({message:'Record Inserted!'});
  }catch(err){
      if(err.name==='MongoError'&& err.code===11000){
          console.log('Duplicate Entry for the provided ID: ',ameName);
          return res.status(400).json({error:'the provided reservation already exists.'});
      }
      console.error('E-E-ERROR! ',err);
      res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});

train.get('/searchAme',async(req,res)=>{
  const {ameName}=req.query;
  try{
    if(ameName!=undefined){
      console.log('looking for: ', req.query)
      if(!rider){
        console.log('Forgetting somethign?');
        return res.status(500).json({error:'Database is not ready.'});
    }
    const ame = await rider.collection('amenities').findOne({ameName});
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

train.post('/updateAme',async(req,res)=>{
  const {ameName,ameSize,ameCost,ameReservd,ameLeft}=req.body;
  console.log('Get Ready For:',req.body);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const updootQ={ameName};
      const updootV={$set:{ameSize,ameCost,ameReservd,ameLeft}}
      const result=await rider.collection('amenities').updateOne(updootQ,updootV);
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

train.post('/deletAme',async(req,res)=>{
  const {ameName}=req.body;
  console.log('Say Bye For: ',ameName);
  try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const deletQ={ameName};
      const result=await rider.collection('amenities').deleteOne(deletQ);
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
  const {reDatePost,reID,reresID,recID,reresAmeName,reresCheckinDate,reresCheckoutDate,reresBookeDate,renCheckinDate,renCheckout,renBookeDate,reschedStat}=req.body;
  console.log('Get Ready For: ',req.body);
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
      await rider.collection('reschedule').insertOne({
        reDatePost,reID,reresID,recID,reresAmeName,reresCheckinDate,reresCheckoutDate,reresBookeDate,renCheckinDate,renCheckout,renBookeDate,reschedStat
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

train.get('/searchReschedPlus',async(req,res)=>{
  const {reID}=req.query;
  if(reID!=undefined){
    try{
    console.log('looking for: ', req.query)
      if(!rider){
          console.log('Forgetting somethign?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const ame = await rider.collection('reschedule').find({reID}).toArray();
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
  const {runresID,runresPrice,runresBal,runresStat}=req.body
  console.log("Get Ready For: ",req.body)
  try{
      if(!rider){
          console.log('Wheres the Database?');
          return res.status(500).json({error: 'Database is not ready.'});
      }
        await rider.collection('running-balance').insertOne({
          runresID,runresPrice,runresBal,runresStat
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
train.get('/searchRun',async(req,res)=>{
  const {runresID}=req.query
  console.log(req.query)
  if(runresID!=undefined){
    try{
    console.log('Looking for', req.body)
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
  const {runresID,runresPrice,runresBal,runresStat}=req.body
  const updootQ={runresID};
      const updootV={$set:{runresPrice,runresBal,runresStat}}
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
  const {runresID}=req.body;
  console.log('Say Bye for: ',req.body);
  try{
    if(!rider){
      console.log('Forgetting something?')
      return res.status(500).json({error:'Database is not ready.'})
    }
    const deletQ={runresID}
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

//#region Login Commands
train.post('/login', async(req,res)=>{
  let {rescID,rescPass}=req.body;
  console.log("Get Ready For: ",req.body)
  try {
      const client = await rider.collection('reservations').findOne({
        rescID: { $regex: new RegExp(`^${rescID}$`) },
      });
  
      if (client && client.rescPass === rescPass) { 
        res.cookie('user',rescID)
        res.json({ success: true, client });
      } else {
        res.json({ success: false, message: 'Invalid ID or password' });
      }
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

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

train.post('/updateStandby',async(req,res)=>{
  res.cookie("updateReady",req.body)
  console.log("Updating Reservation!")
  res.json({success:true});
});

train.get('/updateGo',async(req,res)=>{
  try{
    if(req.cookies.updateReady){
      console.log("Updating Reservation With...")
      res.json({message: "Update is go", data: "yes"});
    }else{
      console.log("No Update")
      res.json({ message: "No update available", data:"no" });
    }
  }catch(err){
    console.error('Error while loading session. ',err);
    res.status(500).json({error:'an error has occured while loading the session.'});
  }
})

train.get('/current_reservation', async(req,res)=>{
  const rescID=req.cookies.user;
  if(rescID!=undefined){
    console.log('looking for: ', rescID);
    try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const trans = await rider.collection('reservations').findOne({rescID});
      if(trans){
          console.log('Found it. ',trans);
          res.status(200).json(trans);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Session does not exist")
  }
  
})

train.get("/current_ResCount",async(req,res)=>{
  const rescID=req.cookies.user;
  if(rescID!=undefined){
    console.log('looking for: ', rescID);
    try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const count = await rider.collection('reservations').countDocuments({rescID});
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

train.get('/current_ReservationPlus', async(req,res)=>{
  const rescID=req.cookies.user;
  if(rescID!=undefined){
    console.log('looking for: ', rescID);
    try{
      if(!rider){
          console.log('Forgetting something?');
          return res.status(500).json({error:'Database is not ready.'});
      }
      const trans = await rider.collection('reservations').find({rescID}).skip(1).toArray();
      if(trans){
          console.log('Found it. ',trans);
          res.status(200).json(trans);
      }else{
          console.log('Record Not Found with that ID.');
          res.status(404).json({error:'An Error occured while looking for the record.'});
      }
  }catch(err){
      console.error('Error while looking for record. ',err);
      res.status(500).json({error:'an error has occured while searching for the record.'});
  }
  }else{
    console.log("Session does not exist")
  }
  
})

train.get('/current_Mem', async(req,res)=>{
  const mID=req.cookies.user;
  if(mID!=undefined){
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
  }else{
    console.log("User is not logged in.")
  }
 
})

train.get('/logout', (req, res) => {
  const cookies = Object.keys(req.cookies);

  cookies.forEach(cookie => {
    res.clearCookie(cookie);
  });

  res.send('All cookies cleared');
});



//#endregion
