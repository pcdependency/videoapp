import { UPDATE_TLV, RESET_FLV } from "./authTypes";

const initialState = {
  _id: "",
  validated: true,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case RESET_FLV:
      return {
        ...state,
        [action.payload]: initialState[action.payload],
      };
    case UPDATE_TLV:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    default:
      return state;
  }
}
