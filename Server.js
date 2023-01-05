// REQUIRE ALL YOUR DEPENDENCES
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//2. CONFIGURE YOUR CONFIG FILE
dotenv.config({ path: './config.env' });

//.3 REQUIRE YOUR EXPRESS APP
const app = require('./App');

//4. CREATE YOUR DATABASES FROM YOUR CONFIG FILE
const db = process.env.NATOURSDB;

//.5 CONFIG YOUR MONGOOSE FILE USING THE STANDARDS AND CATCH ANY ERROR SINCE ITS A PROMISE
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('server is running');
  });

//.6 CREATE YOUR PORT FROM YOUR ENV VARIABLES

const port = process.env.PORT;

//7KICK START YOUR APP SERVER
app.listen(port, () => {
  console.log('App listening on port 3000');
});

console.log(process.env.NODE_ENV);
