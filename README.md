```js
const bcrypt = require("bcryptjs");
const salt = await bcrypt.genSalt(10);
//here we are generating the random bytes which determines how long our password will be
const hashedPassword = await bcrypt.hash(password, salt);
// now we have passed our password in string to the hash with salt and created a hashed password.

### refactoring our code:-
models/auth.js
UserSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
// here we are using the pre middleware from mongoose documentation
//don't use CB as they have different scope than the normal function

###JWT LEARNINGS: -
// never share the password and after creating the jwt token we can either send the token or we can also send the user
depends upon the use cases.
// never share any confidential information over token
//use the sign part after the data is created in the DB
const token = jwt.sign({ userId: user._id, name: user.name }, "usertoken", {
        expiresIn: "30d",
    });

### Mongoose Schema Instances : -
// in our model document we can define our own functions similar to the build  in methods that they have
Now all of our Model instances have a defined method available to them.
- refactoring our JWT
models/auth.js
UserSchema.methods.createJwt = function () {
    return jwt.sign({ userId: this._id, name: this.name }, "Tz1JCppJKVjP8mAxGxTsnya8PAZxz6Fj", {
        expiresIn: "30d",
    });
};

const user = await User.create(req.body);
    const token = user.createJwt();


### For comparing the hashed password
models/user.js
UserSchema.methods.comparePassword = async function (userPassword) {
    const isMatched = await bcrypt.compare(userPassword, this.password);
    return isMatched;
};

controller/user.js
const isMatched = await user.comparePassword(password);
    if (!isMatched) {
        throw new UnauthenticatedError("Invalid Password");
    }
```

```js
authentication.js
-uses: -\
used when we want to add some kind of authentication to all our routes based on JWT
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");
const User = require("../models/User");

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthenticatedError("Invalid Authorization");
    }
    const token = authHeader.split(" ")[1];

    try {
        const payload = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: payload.userId, name: payload.name };
        next();//moving to the next middleware
    } catch (error) {
        throw new UnauthenticatedError("Invalid Authorization");
    }
};
module.exports = auth;

app.js
app.use("/api/v1/jobs", [userAuthentication, jobsRouter]);//all routes will access the middleware
`Jobs model:-
1.Primary Keys: ObjectIds are used as the primary key fo documents in a MongoDB collection.
 _id: mongoose.Types.ObjectId.
2.Referencing Documents: ObjectIds are used to create relationships between different collections by referencing documents.
`
createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "User in required"],
    },
    //this will relate the user model with the job model and will associate the jobs to the particular user.
```

```js
const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId; //always get the user id to associate the user to a job
    const user = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json(user);
};
POSTMASTER SETTING UP AUTHORIZATION DYNAMICALLY
login route
const jsonData = pm.response.json();
pm.globals.set("accessToken",jsonData.token);

then access the token in the getAllJobs route as bearer token or any other router where we are serving some kind of resource
from our DB .

### CUSTOM ERROR
We will create them only once and bring them from project to  project
const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        // set default
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong try again later",
    };

    // if (err instanceof CustomAPIError) {
    //   return res.status(err.statusCode).json({ msg: err.message })
    // }

    if (err.name === "ValidationError") {
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(",");
        customError.statusCode = 400;
    }
    if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value`;
        customError.statusCode = 400;
    }
    if (err.name === "CastError") {
        customError.msg = `No item found with id : ${err.value}`;
        customError.statusCode = 404;
    }

    return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;

### Adding security to our app
packages needed :-
- helmet  is a collection of middleware functions that help secure Express.js applications by setting various HTTP headers

- express-rate-limit is a middleware for Express.js applications that helps prevent brute-force attacks and denial-of-service attacks by limiting the number of requests a client can make within a certain period of time.

- cors is a vital security feature that helps manage cross-origin requests in web applications. By using the cors package in Node.js, you can easily configure your Express.js server to handle these requests in a secure and flexible manner.

- xss-clean It filters out any input from users that could potentially contain malicious scripts. This is particularly important for any input fields where users can submit data.
--note the xss-clean is deprecated so try using some other packages.

```
