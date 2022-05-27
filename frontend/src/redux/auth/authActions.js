import axios from "axios";
import jwt_decode from "jwt-decode";
import { UPDATE_TLV, RESET_FLV } from "./authTypes";
import { SET_ALERT } from "../error/alertTypes";

const API_URL = "/api/auth/";

export const register = (userData) => async (dispatch) => {
  try {
    const response = await axios.post(API_URL + "register", userData);
    localStorage.setItem("token", response.data.token);
    delete response.data.token;

    dispatch({
      type: UPDATE_TLV,
      payload: { key: "_id", value: response.data._id },
    });

    dispatch({
      type: SET_ALERT,
      payload: {
        message:
          "Account created, please check your email for the confirmation code",
        type: "success",
        duration: 1000,
        visible: true,
      },
    });
  } catch (error) {
    dispatch({
      type: SET_ALERT,
      payload: {
        message: error.response.data.message,
        type: "error",
        duration: 2000,
        visible: true,
      },
    });
  }
};

export const login = (userData) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    if (token && userData === "reload") {
      return dispatch({
        type: UPDATE_TLV,
        payload: { key: "_id", value: jwt_decode(token)._id },
      });
    }

    if (!token && userData !== "reload") {
      const res = await axios.post(API_URL + "login", userData);
      localStorage.setItem("token", res.data.token);
      delete res.data.token;

      dispatch({
        type: UPDATE_TLV,
        payload: { key: "_id", value: res.data._id },
      });

      return dispatch({
        type: SET_ALERT,
        payload: {
          message: res.data.temp ? "Please change your password" : "Logged In",
          type: "success",
          duration: res.data.temp ? 2000 : 1000,
          visible: true,
        },
      });
    }
  } catch (error) {
    dispatch({
      type: SET_ALERT,
      payload: {
        message: error.response.data.message,
        type: "error",
        duration: 2000,
        visible: true,
      },
    });
  }
};

export const logout = () => (dispatch) => {
  try {
    localStorage.removeItem("token");
    dispatch({
      type: RESET_FLV,
      payload: "_id",
    });
    dispatch({
      type: SET_ALERT,
      payload: {
        message: "Logged out",
        type: "info",
        duration: 1000,
        visible: true,
      },
    });
  } catch (error) {
    dispatch({
      type: SET_ALERT,
      payload: {
        message: "Could not Logout",
        type: "error",
        duration: 2000,
        visible: true,
      },
    });
  }
};

export const verifyEmail = (token) => async (dispatch) => {
  try {
    await axios.post(
      API_URL + "verify/email/" + token.code,
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    dispatch({
      type: UPDATE_TLV,
      payload: {
        key: "validated",
        value: true,
      },
    });
    dispatch({
      type: SET_ALERT,
      payload: {
        message: "Email Confirmed",
        type: "success",
        duration: 2000,
        visible: true,
      },
    });
  } catch (error) {
    dispatch({
      type: SET_ALERT,
      payload: {
        message: error.response.data.message,
        type: "error",
        duration: 2000,
        visible: true,
      },
    });
  }
};

export const checkEmailValid = () => async (dispatch) => {
  try {
    const res = await axios.post(
      API_URL + "get/validated",
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    dispatch({
      type: UPDATE_TLV,
      payload: {
        key: "validated",
        value: res.data.validated,
      },
    });
  } catch (error) {
    dispatch({
      type: SET_ALERT,
      payload: {
        message: error.response.data.message,
        type: "error",
        duration: 2000,
        visible: true,
      },
    });
  }
};

export const resendEmail = () => async (dispatch) => {
  try {
    await axios.post(
      API_URL + "resend/email",
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    dispatch({
      type: SET_ALERT,
      payload: {
        message: "Email Sent",
        type: "success",
        duration: 2000,
        visible: true,
      },
    });
  } catch (error) {
    dispatch({
      type: SET_ALERT,
      payload: {
        message: error.response.data.message,
        type: "error",
        duration: 2000,
        visible: true,
      },
    });
  }
};

export const forgotPassword = (forgot) => async (dispatch) => {
  try {
    await axios.post(API_URL + `forgot/password/${forgot.email}`);

    dispatch({
      type: SET_ALERT,
      payload: {
        message: `Email Sent to ${forgot.email}`,
        type: "success",
        duration: 2000,
        visible: true,
      },
    });
  } catch (error) {
    dispatch({
      type: SET_ALERT,
      payload: {
        message: error.response.data.message,
        type: "error",
        duration: 2000,
        visible: true,
      },
    });
  }
};
