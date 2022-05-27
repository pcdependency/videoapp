import React, { useState } from "react";
import "../css/FormModal.css";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Input from "@mui/material/Input";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import SvgIcon from "@mui/material/SvgIcon";
import {
  outlinedBtnStyle,
  modalStyle,
  containedBtnStyle,
  textFieldStyle,
  popperStyle,
  linearProgressStyle,
} from "../css/MuiStyles";
import { TextField } from "@mui/material";
import { formValidation } from "../validation/formValidation";
import {
  INIT_FORM,
  REMOVE_FORM,
  UPDATE_ALV,
} from "../redux/client/clientTypes";
import Autocomplete from "@mui/material/Autocomplete";
import Popper from "@mui/material/Popper";
import LinearProgress from "@mui/material/LinearProgress";
import ModalFooter from "./footers/ModalFooter";

const CustomPopper = (props) => {
  return <Popper placement="top" {...props} sx={popperStyle} />;
};

const forgotInitialState = [
  {
    name: "email",
    label: "Your Email",
    required: true,
    inputType: "email",
    helperText: "(ex. youremail@domain.com)",
    test: "validateEmail",
    minLength: 5,
    maxLength: 350,
  },
];

const FormModal = ({
  initialState,
  btnName,
  btnIcon,
  btnClassName,
  footerComponent,
  btnVariant,
  name,
  progress,
  requireValidated,
  fullWidth,
}) => {
  const dispatch = useDispatch();
  const { client, auth } = useSelector((state) => state);
  const state = client.form[name];
  const stateProgress = client.progress;
  const [open, setOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  function handleOpen() {
    dispatch({
      type: INIT_FORM,
      payload: {
        key: name,
        value: initialState,
      },
    });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    dispatch({
      type: REMOVE_FORM,
      payload: name,
    });
  }

  function setStateValue(iName, value, key, prev) {
    prev
      ? dispatch({
          type: UPDATE_ALV,
          payload: {
            keys: ["form", name],
            value: {
              ...state,
              [iName]: {
                ...state[iName],
                [key]: value,
              },
            },
            type: "set",
          },
        })
      : dispatch({
          type: UPDATE_ALV,
          payload: {
            keys: ["form", name, iName, key],
            value: value,
            type: "set",
          },
        });
  }

  return (
    <>
      {btnIcon ? (
        <SvgIcon
          component={btnIcon}
          style={{
            ...btnClassName,
            opacity: requireValidated && !auth.validated ? ".5" : "1",
            cursor: requireValidated && !auth.validated ? "default" : "pointer",
          }}
          onClick={() =>
            requireValidated && !auth.validated ? "" : handleOpen()
          }
        />
      ) : btnVariant === "text" ? (
        <p
          onClick={handleOpen}
          className={btnClassName}
          style={{
            opacity: requireValidated && !auth.validated ? ".5" : "1",
            cursor: requireValidated && !auth.validated ? "default" : "pointer",
          }}
        >
          {btnName}
        </p>
      ) : (
        <Button
          fullWidth={fullWidth}
          disabled={requireValidated && !auth.validated}
          variant={btnVariant}
          sx={btnVariant === "outlined" ? outlinedBtnStyle : containedBtnStyle}
          className={btnClassName}
          onClick={handleOpen}
        >
          {btnName}
        </Button>
      )}

      {state && (
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle} className="modalContainer">
            {progress && (
              <LinearProgress
                variant="determinate"
                value={stateProgress}
                sx={linearProgressStyle}
              />
            )}
            <div className="modalHeader">
              <div>
                <div className="modalHeaderTopContainer">
                  <p className="modalHeaderTxt">{btnName}</p>
                  <p className="modalRequiredTxt">( * = Required )</p>
                </div>
                {name === "login" && (
                  <FormModal
                    key="forgot"
                    name="forgot"
                    initialState={forgotInitialState}
                    btnName="Forgot password"
                    btnVariant="text"
                    btnClassName="forgotPasswordTxt"
                    verify={false}
                    progress={false}
                    requireValidated={false}
                    footerComponent={
                      <ModalFooter
                        name="forgot"
                        btnName="Email Password"
                        action="forgotPassword"
                        verify={false}
                        completeness="full"
                        initialState={forgotInitialState}
                      />
                    }
                  />
                )}
              </div>

              <CloseIcon
                style={{ height: "30px", width: "30px", cursor: "pointer" }}
                className="closeIcon"
                onClick={handleClose}
              />
            </div>
            <div className="modalBodyContainer">
              {initialState.map((i, idx) => {
                return (
                  <div key={i.name}>
                    {(i.inputType === "text" ||
                      i.inputType === "password" ||
                      i.inputType === "email") && (
                      <TextField
                        fullWidth
                        key={i.name}
                        required={i.required}
                        value={state[i.name].value}
                        label={i.label}
                        variant="filled"
                        multiline={i.multiline}
                        rows={i.rows}
                        error={
                          !state[i.name].focus && Boolean(state[i.name].error)
                        }
                        onFocus={() =>
                          setStateValue(i.name, true, "focus", true)
                        }
                        onBlur={() =>
                          setStateValue(i.name, false, "focus", true)
                        }
                        onChange={(e) => {
                          setStateValue(
                            i.name,
                            formValidation(
                              i.test,
                              e.target.value,
                              state,
                              initialState[idx]
                            ),
                            "error",
                            false
                          );
                          setStateValue(i.name, e.target.value, "value", true);
                        }}
                        helperText={state[i.name].focus ? i.helperText : ""}
                        type={
                          (i.inputType === "password" && passwordVisible) ||
                          i.inputType !== "password"
                            ? "text"
                            : "password"
                        }
                        sx={textFieldStyle}
                        inputProps={{
                          maxLength: i.maxLength,
                          minLength: i.minLength,
                        }}
                        InputProps={{
                          endAdornment:
                            i.inputType === "password" ? (
                              <IconButton
                                onClick={() =>
                                  setPasswordVisible(!passwordVisible)
                                }
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                {passwordVisible ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            ) : null,
                        }}
                      />
                    )}

                    {i.inputType === "file" && (
                      <label key={i.name}>
                        <Input
                          accept={`${i.fileType}/*`}
                          type="file"
                          sx={{ display: "none" }}
                          onChange={(e) =>
                            setStateValue(
                              i.name,
                              e.target.files[0],
                              "value",
                              true
                            )
                          }
                        />
                        <Button
                          disabled={!auth.validated && i.requireValidated}
                          endIcon={
                            <SvgIcon
                              component={i.endIcon}
                              style={{
                                filter:
                                  "brightness(0) saturate(100%) invert(79%) sepia(11%) saturate(6149%) hue-rotate(14deg) brightness(104%) contrast(75%)",
                                opacity:
                                  !auth.validated && i.requireValidated
                                    ? ".1"
                                    : "1",
                              }}
                            />
                          }
                          variant="outlined"
                          component="span"
                          fullWidth
                          sx={outlinedBtnStyle}
                        >
                          {state[i.name].value
                            ? state[i.name].value.name
                            : i.required
                            ? i.label + " *"
                            : i.label}
                        </Button>
                      </label>
                    )}

                    {i.inputType === "autocomplete" && (
                      <Autocomplete
                        key={i.name}
                        margin="normal"
                        isOptionEqualToValue={() => {
                          return true;
                        }}
                        disablePortal
                        options={i.listItems}
                        PopperComponent={CustomPopper}
                        sx={textFieldStyle}
                        onChange={(e) => {
                          const cat = i.listItems[e.target.dataset.optionIndex];
                          setStateValue(
                            i.name,
                            formValidation(
                              i.test,
                              e.target.value,
                              state,
                              initialState[idx]
                            ),
                            "error",
                            false
                          );
                          setStateValue(
                            i.name,
                            cat ? cat.label : "",
                            "value",
                            false
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required={i.required}
                            value={state[i.name].value}
                            helperText={state[i.name].focus ? i.helperText : ""}
                            onFocus={() =>
                              setStateValue(i.name, true, "focus", true)
                            }
                            onBlur={() =>
                              setStateValue(i.name, false, "focus", true)
                            }
                            label={i.label}
                          />
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {footerComponent}
          </Box>
        </Modal>
      )}
    </>
  );
};

export default FormModal;
