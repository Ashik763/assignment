const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@voyage.s21ywkk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    
    const infos = client.db("Voyage").collection("infos");
   



    //assignments

    app.get("/", async (req, res) => {
        
        const query = {};
        const event = await infos.find(query).toArray();
        res.send(event);
    });

    app.get("/api/v3/app/events", async (req, res) => {
      if (req?.query?.type) {
        const type = req.query.type;
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        
        const query = { type: type };
        const all = infos.find({});
        const specificInfos = await all
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        
        res.send(specificInfos);
      } else {
        const id = req.query.id;
        const query = { _id: new ObjectId(id) };
        const event = await infos.findOne(query);
        res.send(event);
      }
    });
    app.post("/api/v3/app/events", async (req, res) => {
      const info = req.body;
      console.log(info);
      const result = await infos.insertOne(info);
      // console.log(result);
      res.send(result.insertedId);
    });

    app.put('/api/v3/app/events/:id', async (req, res) => {
      const id = req.params.id;


      const {type,uid,name,tagline,schedule,description,image,moderator,category,sub_category,rigor_rank,attendees} = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedDoc = {
          $set: {
             
              type,
              uid,
              name,
              tagline,
              schedule,
              description,
              files: {
                image
              },
              moderator,
              category,
              sub_category,
              rigor_rank,
              attendees
          }
      }
      const result = await infos.updateOne(filter, updatedDoc, options);
      res.send(result);
  });

  app.delete("/api/v3/app/events/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await infos.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
