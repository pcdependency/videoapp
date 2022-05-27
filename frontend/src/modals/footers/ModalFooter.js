import React from "react";
import "../../css/ModalFooter.css";
import Button from "@mui/material/Button";
import { containedBtnStyle } from "../../css/MuiStyles";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
} from "../../redux/auth/authActions";
import getSaveState from "../../utils/getSaveState";
import { SET_ALERT } from "../../redux/error/alertTypes";
import { checkComplete, getErrors } from "../../validation/formValidation";
import { updateProfile, uploadVideo } from "../../redux/client/clientActions";
import CircularProgress from "@mui/material/CircularProgress";
import { UPDATE_ALV } from "../../redux/client/clientTypes";
import FormModal from "../FormModal";

const authInitialState = [
  {
    name: "password1",
    label: "Your current password",
    required: true,
    inputType: "password",
    minLength: 6,
    maxLength: 26,
    helperText: "Your current password",
    test: "validatePassword",
  },
];

const ModalFooter = ({
  name,
  completeness,
  action,
  verify,
  parentName,
  authBtnName,
  initialState,
  btnName,
  fullWidth,
}) => {
  const dispatch = useDispatch();
  const client = useSelector((state) => state.client);
  const state = client.form[name];

  function submit() {
    const notComplete = checkComplete(state, completeness, initialState);
    if (notComplete) {
      dispatch({
        type: SET_ALERT,
        payload: {
          message: notComplete,
          type: "error",
          duration: 2000,
          visible: true,
        },
      });
    }
    const hasErrors = getErrors(state);
    if (!notComplete && hasErrors) {
      dispatch({
        type: SET_ALERT,
        payload: {
          message: hasErrors,
          type: "error",
          duration: 2000,
          visible: true,
        },
      });
    }

    if (!notComplete && !hasErrors) {
      const loading = ["updateProfile", "uploadVideo"];
      if (loading.indexOf(action) !== -1) {
        dispatch({
          type: UPDATE_ALV,
          payload: {
            keys: ["loading"],
            value: true,
            type: "set",
          },
        });
      }
      action === "register" && dispatch(register(getSaveState(state)));
      action === "login" && dispatch(login(getSaveState(state)));
      action === "updateProfile" &&
        dispatch(
          updateProfile(getSaveState({ ...state, ...client.form[parentName] }))
        );
      action === "uploadVideo" && dispatch(uploadVideo(getSaveState(state)));
      action === "verifyEmail" && dispatch(verifyEmail(getSaveState(state)));
      action === "forgotPassword" &&
        dispatch(forgotPassword(getSaveState(state)));
    }
  }

  return (
    <div className="modalFooterContainer">
      {verify ? (
        <FormModal
          key="auth"
          name="auth"
          initialState={authInitialState}
          btnName={authBtnName}
          btnClassName=""
          btnVariant="contained"
          verify={false}
          progress={false}
          requireValidated={false}
          fullWidth={true}
          footerComponent={
            <ModalFooter
              parentName={parentName}
              fullWidth={true}
              name="auth"
              btnName="Update"
              action="updateProfile"
              verify={false}
              completeness="required"
              initialState={authInitialState}
            />
          }
        />
      ) : (
        <Button
          disabled={client.loading}
          onClick={() => submit()}
          style={{ textTransform: "uppercase" }}
          variant="contained"
          fullWidth
          sx={containedBtnStyle}
        >
          {btnName ? btnName : name}
        </Button>
      )}
      {client.loading && (
        <CircularProgress
          sx={{
            marginLeft: "10px",
            maxWidth: "30px",
            width: "100%",
            height: "100%",
            maxHeight: "30px",
            "& .MuiCircularProgress-circle": {
              stroke: "rgb(224, 222, 61)",
            },
          }}
        />
      )}
    </div>
  );
};

export default ModalFooter;
