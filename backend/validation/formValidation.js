var validator = require("fluent-validator");
var passwordValidator = require("password-validator");

function formValidation(type, value, extra) {
  if (value) {
    switch (type) {
      case "validateEmail":
        if (validator.isEmail(value)) return "";
        return "Invalid Email";

      case "validateLength":
        if (
          validator.isInRange(
            value.length,
            extra.minLength - 1,
            extra.maxLength + 1
          )
        )
          return "";
        return "Invalid length";

      case "validatePassword":
        var pass = new passwordValidator();
        pass
          .is()
          .min(6)
          .is()
          .max(26)
          .has()
          .uppercase(2)
          .has()
          .lowercase(2)
          .has()
          .digits(2)
          .has()
          .symbols(2)
          .has()
          .not()
          .spaces();
        if (pass.validate(value)) return "";
        return "Invalid Password";

      case "validateComparePasswords":
        if (value === extra.password1) return "";
        return "Passwords do not match";
      default:
        break;
    }
  }
}

function getErrors(validate) {
  const errors = [];
  validate
    .filter((v) => v.value)
    .forEach((v) => {
      const validate = formValidation(v.type, v.value, v.extra);
      validate !== "" && errors.push(validate);
    });
  return errors;
}

module.exports = {
  formValidation,
  getErrors,
};
