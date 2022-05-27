import { combineReducers } from "redux";
import clientReducer from "./client/clientReducer";
import authReducer from "./auth/authReducer";
import alertReducer from "./error/alertReducer";

export default combineReducers({
  client: clientReducer,
  auth: authReducer,
  alert: alertReducer,
});
