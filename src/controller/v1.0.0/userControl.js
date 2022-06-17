const bcrypt = require("bcrypt");
const userSchema = require("../../model/userSchema");
const taskSchema = require("../../model/taskSchema");
const jwt = require("jsonwebtoken");
const sendMail = require("../../helper/mailFunction").sendMail;

/*user registration with basic details*/
exports.signUp = async (req, res) => {
  const body = req.body;

  if (!(body.email && body.password)) {
    return res.status(400).json({ error: "data not formatted properly" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(body.password, salt);

  await userSchema
    .create({
      email: body.email,
      fullName: body.fullName,
      userName: body.userName,
      password: hashedpassword,
    })
    .then((user) => {
      console.log(" register completed");
      res.status(200).json({ message: "User Created Successfully", UserDetails: user });
    })
    .catch((err) => {
      res.status(404).json({error: err.message});
    });
};

/**Login the appropriate with their E-mail and Password
 * Password has been securely stored with bcrypt method
 */
exports.logIn = async (req, res) => {

  const body = req.body;
  var otp = `${Math.floor(1000 + Math.random() * 9000)}`; //otp formula

  const user = await userSchema.findOne({ email: body.email });
  if (user) {
    const validPassword = await bcrypt.compare(body.password, user.password);

    if (validPassword) {

      res.status(200).json({ message: "we have sent a otp via Email" });
      await userSchema.findOneAndUpdate({ email: user.email }, { otp: otp });
      sendMail(user.email, otp);

    } else {
      res.status(400).json({ error: "Invalid Password" });
    }
  } else {
    res.status(404).json({error: "email does not exist " });
  }
};

// otp verification for particular Email id

exports.otpVerify = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  await userSchema.findOne({ email: email }).then(async (user) => {
    if (user.otp == otp) {
      await userSchema.findOneAndUpdate(
        { email: user.email },
        { $set: { otp: 0 } }
      );

      const token = jwt.sign({ email: user.email }, "secretkey", {
        algorithm: "HS256",
        expiresIn: "2d",
      });
      return res.status(200).json({message: "login success",token: "bearer " + token});
    } else {
      res.status(400).json({error:"incorrect otp "});
    }
  });
};

/**Update the User details by calling with their id */

exports.updateUser = async (req, res) => {
  const body = req.body;
  const userId = req.params.userid;
  const hashedpassword = await bcrypt.hash(body.password, 10);
  const user = await userSchema.findByIdAndUpdate(
    { _id: userId },
    { $set: { fullName: body.fullName, password: hashedpassword } },
    { new: true }
  );
  if (user) {
    console.log("user updated successfully");
    res
      .status(200)
      .send({ message: "user details updated", updatedDetails: user });
  } else {
    res.status(404).send({ error: "user does not exist " });
  }
};

/**To delete User with their -id */

exports.deleteUser = async (req, res) => {
  await userSchema
    .findByIdAndDelete({ _id: req.params.userid }, { new: true })
    .then((user) => {
      if (!user) {
        res.status(400).json({error:req.params.userid + " was not found"});
      } else {
        console.log("user deleted successfully");
        res.status(200).json({message:req.params.userid + " was deleted."});
      }
    })
    .catch((errors) => {
      res.status(404).json({error:errors.message});
    });
};

//find the task details by user

exports.findTask = async (req, res) => {
  const userId = req.params.userid;

  await userSchema
    .find({ _id: userId })
    .populate("taskDetails")
    .then((user) => {
      if (user) {
        res.status(200).json({ message: "task details here", task: user });
        console.log(user);
      } else {
        res.status(400).json({error:"invalid userid"});
      }
    })
    .catch((err) => {
      res.status(400).json({error:err.message})
    });
};
