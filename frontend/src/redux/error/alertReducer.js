import { SET_ALERT, CLEAR_ALERT } from "./alertTypes";

const initialState = {
  message: "",
  type: "",
  duration: "",
  visible: false,
};

export default function alertReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ALERT:
      return {
        ...action.payload,
      };
    case CLEAR_ALERT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
}
