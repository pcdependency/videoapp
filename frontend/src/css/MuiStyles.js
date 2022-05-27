export const outlinedBtnStyle = {
  color: "rgb(224, 222, 61)",
  borderColor: "rgb(224, 222, 61)",
  "&:hover": {
    borderColor: "rgb(224, 222, 61)",
    backgroundColor: "rgba(224, 222, 61, .04)",
  },
};

export const containedBtnStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "black",
  backgroundColor: "rgb(224, 222, 61)",
  "& .MuiButton-endIcon": {
    filter: "brightness(0.2)",
  },
  "&:hover": {
    backgroundColor: "rgb(194, 192, 31)",
  },
};

export const modalStyle = {
  display: "grid",
  gridAutoFlow: "row",
  gap: "10px",
  width: "90%",
  maxWidth: "350px",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "rgb(20,20,20)",
  p: 4,
  borderRadius: "2px",
  outline: "none",
};

export const textFieldStyle = {
  "& .MuiFilledInput-root": {
    backgroundColor: "rgb(15,15,15)",
  },
  borderRadius: "5px",
  "& .MuiInputBase-root:before": {
    borderBottomColor: "rgba(224, 222, 61, .42)",
  },
  "& .MuiInputBase-root:after": {
    borderBottomColor: "rgb(224, 222, 61)",
  },
  // ":after": { borderBottomColor: "rgb(224, 222, 61)" },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: "rgb(224, 222, 61)",
    },
  },
  "& .Mui-error.MuiInputBase-root:after": {
    borderBottomColor: "rgb(157, 19, 9)",
  },
  "& .MuiFormHelperText-root": {
    color: "white",
  },

  "& .MuiTextField-root": {
    backgroundColor: "rgb(15,15,15)",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgb(224, 222, 61, .42)",
    },
  },
};

export const popperStyle = {
  "& .MuiPaper-root": {
    "& .MuiAutocomplete-noOptions": {
      color: "white",
    },
    backgroundColor: "rgb(10,10,10)",
    "& .MuiAutocomplete-listbox": {
      backgroundColor: "rgb(10,10,10)",
      "& .MuiAutocomplete-option": {
        backgroundColor: "rgb(10,10,10)",
      },
      "& .MuiAutocomplete-option:hover": {
        backgroundColor: "rgb(20,20,20)",
      },
      "& .MuiAutocomplete-option:focus": {
        backgroundColor: "rgb(20,20,20)",
      },
      "& .MuiAutocomplete-option.Mui-focused": {
        backgroundColor: "rgb(20,20,20)",
      },
    },
  },
};

export const alertStyle = {
  width: "100%",
  maxWidth: "650px",
};

export const linearProgressStyle = {
  backgroundColor: "transparent",
  "& .MuiLinearProgress-bar": {
    backgroundColor: "rgb(224, 222, 61)",
  },
};

export const linearProgressBufferStyle = {
  "& .MuiLinearProgress-dashed": {
    backgroundColor: "rgba(255,255,255,.5)",
    animation: "none",
    backgroundImage: "none",
  },
  "& .MuiLinearProgress-barColorPrimary.MuiLinearProgress-bar1Buffer": {
    backgroundColor: "rgb(224, 222, 61)",
  },
  "& .MuiLinearProgress-colorPrimary.MuiLinearProgress-bar2Buffer": {
    backgroundColor: "white",
  },
};

export const menuStyle = {
  "& .MuiMenu-paper": {
    backgroundColor: "rgb(10, 10, 10)",
  },
};

export const muiItemStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  "&:hover": {
    backgroundColor: "rgb(40,40,40)",
  },
};
