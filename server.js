const app = require('./app.js');
const db = require("./app/models");

const PORT = process.env.PORT || 3002;

db.mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:true,
    useCreateIndex:true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
    
  })
  .catch((err) => {
    console.error("Connection error", err);
  })


