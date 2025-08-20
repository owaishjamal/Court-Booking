const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  let cookie = req.cookies.access_token;
  if (!cookie) {
    console.log("not verified -- verifyUser.js");
    res.render("landing");
  } else {
    jwt.verify(
      cookie,
      "b0742345623214e7f5aac75a4200799d80b55d26a62b97cd23015c33ae3ac11513e2e7",
      (err, user) => {
        req.user = user;
        next();
      }
    );
  }
};

exports.verifyUser = verifyUser;
