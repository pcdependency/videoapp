var validator = require("fluent-validator");
var passwordValidator = require("password-validator");

export function formValidation(type, value, state, initialState) {
  if (value) {
    switch (type) {
      case "validateEmail":
        if (validator.isEmail(value)) return "";
        return "Invalid Email";

      case "validateImage":
        const imageReg = /(jpe?g|tiff?|png|webp|bmp)$/;

        if (
          value.size <= initialState.maxSize &&
          imageReg.test(value.name.split("/")[1])
        )
          return "";
        return "Image too large";

      case "validateVideo":
        const videoReg = /(mov|mp4|m4v|avi|webm)$/;

        if (
          value.size <= initialState.maxSize &&
          videoReg.test(value.name.split("/")[1])
        )
          return "";
        return "Video too large";

      case "validateLength":
        if (
          validator.isInRange(
            value.length,
            initialState.minLength - 1,
            initialState.maxLength + 1
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
        if (value === state.password1.value) return "";
        return "Passwords do not match";
      default:
        break;
    }
  }
}

export function getErrors(state) {
  const errors = [];
  Object.keys(state)
    .filter((k) => state[k].error)
    .forEach((k) => {
      errors.push(state[k].error);
    });
  if (errors.length === 0) return false;
  const message = errors.length > 1 ? errors.join(" & ") : errors[0];
  return message;
}

export function checkComplete(state, completeness, initialState) {
  const completed = Object.keys(state).filter((k) => state[k].value).length;

  switch (completeness) {
    case "full":
      if (completed !== Object.keys(state).length) return "Form must be filled";
      break;
    case "partial":
      if (completed === 0) return "Form must have at least one value";
      break;
    case "required":
      const required = initialState.filter(
        (i) => (i.required && state[i.name].value) || !i.required
      ).length;
      if (required !== initialState.length)
        return "Required fields must be filled";
      break;
    default:
  }

  return false;
}
