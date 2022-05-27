import React, { useEffect, useCallback } from "react";
import "./css/App.css";
import Header from "./layout/Header";
import Nav from "./layout/Nav";
import Main from "./layout/Main";
import Alert from "@mui/material/Alert";
import { alertStyle, modalStyle } from "./css/MuiStyles";
import { useSelector, useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { CLEAR_ALERT } from "./redux/error/alertTypes";
import { checkEmailValid } from "./redux/auth/authActions";

function App() {
  const dispatch = useDispatch();
  const { alert, auth } = useSelector((state) => state);

  const ClearAlert = useCallback(() => {
    setTimeout(() => {
      dispatch({
        type: CLEAR_ALERT,
      });
    }, alert.duration);
  }, [alert.duration, dispatch]);

  const CheckEmailValid = useCallback(() => {
    dispatch(checkEmailValid());
  }, [dispatch]);

  useEffect(() => {
    alert.visible && ClearAlert();
    auth._id && CheckEmailValid();
  }, [alert.visible, auth._id, CheckEmailValid, ClearAlert]);

  return (
    <div className="appContainer">
      <Modal
        open={alert.visible}
        hideBackdrop
        sx={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <Box sx={modalStyle}>
          <Alert
            sx={alertStyle}
            severity={alert.type ? alert.type : "info"}
            variant="filled"
          >
            {alert.message}
          </Alert>
        </Box>
      </Modal>

      <Main />
      <Nav />
      <Header />
    </div>
  );
}

export default App;
