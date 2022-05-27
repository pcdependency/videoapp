import React from "react";
import "../css/EmailConfirmation.css";
import { Button } from "@mui/material";
import { resendEmail } from "../redux/auth/authActions";
import { useDispatch } from "react-redux";
import FormModal from "../modals/FormModal";
import ModalFooter from "../modals/footers/ModalFooter";

const initialState = [
  {
    name: "code",
    label: "Code",
    required: true,
    inputType: "text",
    helperText: "Paste the code from your email",
    test: "validateLength",
    minLength: 64,
    maxLength: 64,
  },
];
const EmailConfirmation = () => {
  const dispatch = useDispatch();
  return (
    <div className="validateEmailContainer">
      <p className="validateEmailTxt">
        Validate your email to upload and like videos and follow others.
      </p>
      <FormModal
        key="code"
        name="code"
        initialState={initialState}
        btnName="Confirm"
        btnVariant=""
        verify={false}
        btnClassName="confirmBtn"
        progress={false}
        requireValidated={false}
        footerComponent={
          <ModalFooter
            name="code"
            btnName="Confirm Email"
            action="verifyEmail"
            verify={false}
            completeness="full"
            initialState={initialState}
          />
        }
      />
      <Button
        onClick={() => dispatch(resendEmail())}
        variant=""
        sx={{
          textDecoration: "underline",
          color: "black",
          ":hover": {
            backgroundColor: "rgb(194, 192, 31)",
          },
        }}
      >
        Resend
      </Button>
    </div>
  );
};

export default EmailConfirmation;
