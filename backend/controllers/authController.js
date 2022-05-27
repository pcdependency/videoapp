const jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  bcrypt = require("bcryptjs"),
  User = require("../models/User"),
  Video = require("../models/Video"),
  EmailPassword = require("../models/EmailPassword"),
  EmailToken = require("../models/EmailToken"),
  { getErrors } = require("../validation/formValidation"),
  ObjectId = require("mongodb").ObjectId,
  sendEmail = require("../utils/email"),
  passwordGenerator = require("../utils/passwordGenerator");

const head = `
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        p, tr {
          margin: 0;
        }
        .emailContainer {
          background-color: #141414;
          border: 1px solid #e0de3d;
          border-radius: 5px;
          display: grid;
          grid-auto-flow: row;
          justify-content: center;
          align-content: center;
          padding: 20px;
          max-width: max-content;
        }
        .logo {
          height: 50px;
          width: 50px;
          object-fit: contain;
          margin: 0 0 10px 0;
        }
        .name {
          text-align: center;
          font-size: 2em;
          font-weight: bold;
          letter-spacing: 5px;
          line-height: .7;
        }
        .title {
          text-align: center;
          font-size: 1em;
          color: rgb(150,150,150);
          letter-spacing: 2px;
          font-weight: bold;
          line-height: .7;
          margin-bottom: 10px;
        }
        .divider {
          width: max-content;
          height: 1px;
          background-color: rgb(224, 222, 61);
          margin-bottom: 10px;
        }
        .codeLabel {
          text-align: center;
          user-select: none;
          font-size: 1.5em;
          color: rgb(150,150,150);
          font-weight: bold;
        }
        .code {
          text-align: center;
          font-size: 1em;
        }
        .notify {
          text-align: center;
          font-size: .7em;
          color: rgb(150,150,150);
          line-height: 1;
        }
      </style>
    </head>
  `;

const updateLiked = async (req, res) => {
  try {
    const { type, media, _id } = req.params;
    const types = ["like", "unlike"];
    const medias = ["video", "photo"];

    const user = await User.findOne({ _id: ObjectId(req.user._id) });

    if (!user.validated)
      return res.status(400).json({ message: "Email not validated" });

    if (
      types.indexOf(type) === -1 ||
      medias.indexOf(media) === -1 ||
      !ObjectId.isValid(_id)
    )
      return res.status(400).json({ message: "Invalid data" });
    const cType =
      type === "like"
        ? { key: "$addToSet", value: 1 }
        : { key: "$pull", value: -1 };

    const mType = "liked" + media[0].toUpperCase() + media.slice(1) + "s";

    const updateUser = await User.updateOne(
      {
        _id: ObjectId(req.user._id),
      },
      {
        [cType.key]: {
          [mType]: ObjectId(_id),
        },
      }
    );

    if (updateUser.modifiedCount === 1) {
      const query = [
        {
          _id: ObjectId(_id),
        },
        {
          $inc: {
            likes: cType.value,
          },
        },
      ];
      if (media === "video") await Video.updateOne(...query);

      return res.status(200).json();
    }
  } catch (error) {
    console.log("test");
    return res.status(400).json({ message: error });
  }
};

const getFollow = async (req, res) => {
  try {
    const { type } = req.params;
    const { page_id, user_id, requesting, requested } = req.body;

    if (
      !ObjectId.isValid(page_id) ||
      !ObjectId.isValid(user_id) ||
      isNaN(requesting) ||
      isNaN(requested)
    )
      return res.status(400).json({ message: "Invalid data" });

    const resData = await User.aggregate([
      { $match: { _id: ObjectId(page_id) } },
      {
        $unwind: `$${type}`,
      },
      {
        $limit: parseInt(requesting),
      },
      {
        $skip: parseInt(requested),
      },
      {
        $lookup: {
          from: "users",
          let: { ids: `$${type}` },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$ids"] } } },
            {
              $project: {
                userName: 1,
                isFollowing: {
                  $in: [user_id ? ObjectId(user_id) : "", "$followers"],
                },
              },
            },
          ],
          as: "userFollowers",
        },
      },
      {
        $unwind: "$userFollowers",
      },
      {
        $replaceWith: "$userFollowers",
      },
    ]);

    if (resData.length > 0) return res.status(200).json(resData);

    return res.status(404).json({ message: "No users found" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const checkFollowing = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params._id))
      return res.status(400).json({ message: "Invalid data" });

    const isFollowing = await User.findOne({
      _id: ObjectId(req.user._id),
      following: ObjectId(req.params._id),
    });
    return res.status(200).json(isFollowing ? true : false);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const updateFollow = async (req, res) => {
  try {
    const { type, _id } = req.params;
    const types = ["follow", "unfollow"];

    const user = await User.findOne({ _id: ObjectId(req.user._id) });

    if (!user.validated)
      return res.status(400).json({ message: "Email not validated" });

    if (!ObjectId.isValid(_id) || types.indexOf(type) === -1)
      return res.status(400).json({ message: "Invalid data" });

    const query = type === "follow" ? "$addToSet" : "$pull";
    const updateUser = await User.updateOne(
      {
        _id: ObjectId(req.user._id),
      },
      {
        [query]: {
          following: ObjectId(_id),
        },
      }
    );
    const updateUser2 = await User.updateOne(
      {
        _id: ObjectId(_id),
      },
      {
        [query]: {
          followers: ObjectId(req.user._id),
        },
      }
    );

    if (updateUser.modifiedCount === 1 && updateUser2.modifiedCount === 1)
      return res.status(200).json();

    return res.status(400).json({ message: "Invalid request" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userName, email, password1, password2 } = req.body;
    const validate = [
      {
        value: userName,
        type: "validateLength",
        extra: { minLength: 1, maxLength: 14 },
      },
      { value: email, type: "validateEmail" },
      { value: password1, type: "validatePassword" },
      { value: password2, type: "validatePassword" },
    ];
    if (getErrors(validate).length !== 0)
      return res.status(400).json({ message: "Invalid Data" });

    const updateObject = {};

    const user = await User.findOne({ _id: ObjectId(req.user._id) });

    const emailPassword = await EmailPassword.findOne({
      user_id: ObjectId(req.user._id),
    });

    if (
      (!emailPassword &&
        (!user || !bcrypt.compareSync(password1, user.password))) ||
      (emailPassword &&
        (!user || !bcrypt.compareSync(password1, emailPassword.password)))
    )
      return res.status(400).json({ message: "Invalid credentials" });

    if (email) {
      const user = await User.findOne({ email });
      if (user)
        return res.status(400).json({ message: "Email already exists" });
      updateObject.email = email;
    }

    if (password2) {
      await EmailPassword.deleteOne({ user_id: ObjectId(req.user._id) });
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password2, salt);
      updateObject.password = hashedPassword;
    }

    if (userName) updateObject.userName = userName;

    await User.updateOne(
      { _id: ObjectId(req.user._id) },
      {
        $set: updateObject,
      }
    );

    if (email) {
      await EmailToken.deleteOne({ user_id: ObjectId(req.user._id) });
      await User.updateOne(
        { _id: ObjectId(req.user._id) },
        {
          $set: {
            validated: false,
          },
        }
      );
      const emailToken = await EmailToken.create({
        user_id: ObjectId(req.user._id),
        token: crypto.randomBytes(32).toString("hex"),
      });
      sendEmail(
        email,
        "Your Confirmation Code",
        `Copy this code: ${emailToken.token}`
      );
    }
    return res.status(200).json();
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const registerUser = async (req, res) => {
  try {
    const { userName, email, password1, password2 } = req.body;

    if (!userName || !email || !password1 || !password2)
      return res.status(400).json({ message: "Must have all fields" });

    const validate = [
      {
        value: userName,
        type: "validateLength",
        extra: { minLength: 1, maxLength: 14 },
      },
      { value: email, type: "validateEmail" },
      { value: password1, type: "validatePassword" },
      {
        value: password2,
        type: "validateComparePasswords",
        extra: { password1 },
      },
    ];

    if (getErrors(validate).length !== 0)
      return res.status(400).json({ message: "Invalid user data" });

    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password1, salt);

    const _id = new ObjectId();

    const user = await User.create({
      _id: _id,
      userName: userName,
      verified: false,
      validated: false,
      email: email,
      password: hashedPassword,
      date: new Date(),
      followers: [],
      following: [],
    });

    const key = await EmailToken.create({
      user_id: _id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    if (!user || !key)
      return res.status(400).json({ message: "Invalid user data" });

    const emailHtml =
      "<html>" +
      head +
      `
      <body>
        <table class="emailContainer">
          <tr align="center">
            <img src="https://i.imgur.com/Ijqd7WJ.png" class="logo">
          </tr>
          <tr align="center">
            <p class="name">VIDEO APP</p>
          </tr>
          <tr align="center">
            <p class="title">EMAIL CONFIRMATION</p>
          </tr>
          <tr class="divider"></tr>
          <tr align="center">
            <tr class="codeLabel">Your code:</tr>
            <tr class="code">${key.token}</tr>
          </tr>
          <tr align="center">
            <tr class="notify">(This code expires in 60 minutes)</tr>
            <tr class="notify">(Do not reply to this email)</tr>
          </tr>
        </table>
      </body>
      </html>
    `;

    sendEmail(email, "Confirm Email", emailHtml);

    return res.status(201).json({
      _id: user._id,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password1 } = req.body;
    const validate = [
      { value: email, type: "validateEmail" },
      { value: password1, type: "validatePassword" },
    ];

    if (getErrors(validate).length !== 0)
      return res.status(400).json({ message: "Invalid user data" });

    const user = await User.findOne({ email });

    const emailPassword = await EmailPassword.findOne({
      user_id: ObjectId(user._id),
    });

    if (
      (!emailPassword &&
        (!user || !bcrypt.compareSync(password1, user.password))) ||
      (emailPassword &&
        (!user || !bcrypt.compareSync(password1, emailPassword.password)))
    )
      return res.status(400).json({ message: "Invalid credentials" });

    return res.status(200).json({
      _id: user._id,
      token: generateToken(user._id),
      temp: Boolean(emailPassword),
    });
  } catch (error) {
    return res.status(400).json({ error });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const emailToken = await EmailToken.findOne({
      user_id: ObjectId(req.user._id),
    });

    if (emailToken.token !== req.params.token)
      return res.status(400).json({ message: "Invalid Token" });

    await User.updateOne(
      { _id: ObjectId(req.user._id) },
      {
        $set: {
          validated: true,
        },
      }
    );

    await EmailToken.deleteOne({ user_id: ObjectId(req.user._id) });

    return res.status(200).json();
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const getProfileInfo = async (req, res) => {
  try {
    const type = req.params.type;
    const types = ["userName", "email", "_id", "date", "validated", "verified"];
    if (types.indexOf(type) === -1)
      return res.status(400).json({ message: "Invalid Data" });

    const user = await User.findOne({ _id: ObjectId(req.user._id) });

    return res.status(200).json({ [type]: user[type] });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const resendEmail = async (req, res) => {
  try {
    await EmailToken.deleteOne({ user_id: ObjectId(req.user._id) });
    const user = await User.findOne({ _id: ObjectId(req.user._id) });

    const key = await EmailToken.create({
      user_id: ObjectId(req.user._id),
      token: crypto.randomBytes(32).toString("hex"),
    });

    const emailHtml =
      "<html>" +
      head +
      `
      <body>
        <table class="emailContainer">
          <tr align="center">
            <img src="https://i.imgur.com/Ijqd7WJ.png" class="logo">
          </tr>
          <tr align="center">
            <p class="name">VIDEO APP</p>
          </tr>
          <tr align="center">
            <p class="title">EMAIL CONFIRMATION</p>
          </tr>
          <tr class="divider"></tr>
          <tr align="center">
            <tr class="codeLabel">Your code:</tr>
            <tr class="code">${key.token}</tr>
          </tr>
          <tr align="center">
            <tr class="notify">(This code expires in 60 minutes)</tr>
            <tr class="notify">(Do not reply to this email)</tr>
          </tr>
        </table>
      </body>
      </html>
    `;

    sendEmail(user.email, "Confirm Email", emailHtml);

    return res.status(200).json();
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const types = ["password", "email"];
    const { info, type } = req.params;
    if (types.indexOf(type) === -1)
      return res.status(400).json({ message: "Invalid data" });

    const user = await User.findOne({ email: info });

    if (!user) return res.status(400).json({ message: "User not found" });

    const password = passwordGenerator();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await EmailPassword.deleteOne({ user_id: ObjectId(user._id) });

    await EmailPassword.create({
      user_id: ObjectId(user._id),
      password: hashedPassword,
    });

    const emailHtml =
      "<html>" +
      head +
      `
      <body>
        <table class="emailContainer">
          <tr align="center">
            <img src="https://i.imgur.com/Ijqd7WJ.png" class="logo">
          </tr>
          <tr align="center">
            <p class="name">VIDEO APP</p>
          </tr>
          <tr align="center">
            <p class="title">TEMPORARY PASSWORD</p>
          </tr>
          <tr class="divider"></tr>
          <tr align="center">
            <tr class="codeLabel">Your password:</tr>
            <tr class="code">${password}</tr>
          </tr>
          <tr align="center">
            <tr class="notify">(This code expires in 60 minutes)</tr>
            <tr class="notify">(Do not reply to this email)</tr>
          </tr>
        </table>
      </body>
      </html>
    `;

    sendEmail(user.email, "Temporary Password", emailHtml);

    return res.status(200).json();
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const generateToken = (_id) => {
  try {
    return jwt.sign({ _id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  } catch (error) {
    res.status(400).json({ message: "Could not sign token" });
  }
};

module.exports = {
  checkFollowing,
  getFollow,
  updateFollow,
  updateProfile,
  registerUser,
  loginUser,
  updateLiked,
  verifyEmail,
  getProfileInfo,
  resendEmail,
  forgotPassword,
};
