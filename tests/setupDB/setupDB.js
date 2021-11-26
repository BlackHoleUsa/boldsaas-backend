const mongoose = require('mongoose');

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/boldsaas-testDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:true,
        useCreateIndex:true
    }).then(()=>{
      console.log('db connected successfully!')
    }).catch((err) => console.log(err));
  });

   beforeEach(async () => {
     await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany()));
   });

  afterAll(async () => {
    // await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany()));
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;