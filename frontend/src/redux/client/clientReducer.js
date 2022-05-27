import {
  UPDATE_ALV,
  RESET_FLV,
  CHANGE_PROFILE_ISFOLLOWING,
  CHANGE_MODAL_USER_ISFOLLOWING,
  CHANGE_VIDEO_ISFOLLOWING,
  CHANGE_PROFILE_FOLLOW,
  CHANGE_VIDEO_FOLLOW,
  INIT_FORM,
  REMOVE_FORM,
} from "./clientTypes";

const initialState = {
  video: "",
  videos: [],
  profile: "",
  people: [],
  progress: 0,
  loading: false,
  form: "",
};

export default function clientReducer(state = initialState, action) {
  switch (action.type) {
    case INIT_FORM:
      const iState = {};
      action.payload.value.forEach((s) => {
        iState[s.name] = {
          value: "",
          focus: false,
          error: "",
        };
      });
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.key]: iState,
        },
      };
    case REMOVE_FORM:
      const forms = state.form;
      delete forms[action.payload];
      return {
        ...state,
        form: {
          ...forms,
        },
      };
    case CHANGE_MODAL_USER_ISFOLLOWING:
      return {
        ...state,
        people: state.people.map((p) =>
          action.payload._id === p._id
            ? {
                ...p,
                isFollowing: action.payload.value,
              }
            : p
        ),
      };
    case CHANGE_VIDEO_ISFOLLOWING:
      return {
        ...state,
        video: {
          ...state.video,
          author: {
            ...state.video.author,
            isFollowing: action.payload,
          },
        },
      };
    case CHANGE_VIDEO_FOLLOW:
      return {
        ...state,
        video: {
          ...state.video,
          author: {
            ...state.video.author,
            [action.payload.key]:
              state.video.author[action.payload.key] + action.payload.value,
          },
        },
      };
    case CHANGE_PROFILE_FOLLOW:
      return {
        ...state,
        profile: {
          ...state.profile,
          [action.payload.key]:
            state.profile[action.payload.key] + action.payload.value,
        },
      };
    case CHANGE_PROFILE_ISFOLLOWING:
      return {
        ...state,
        profile: {
          ...state.profile,
          isFollowing: action.payload,
        },
      };
    case RESET_FLV:
      return {
        ...state,
        [action.payload]: initialState[action.payload],
      };
    case UPDATE_ALV:
      var { keys, value, type } = action.payload;

      let target = state;
      let key = keys[0];
      for (let i = 1; i < keys.length; ++i) {
        target = target[key];
        key = keys[i];
      }
      if (type === "set") target[key] = value;
      if (type === "push") target[key].push(...value);
      if (type === "equate") {
        target[key] = target[key] + value;
      }

      return {
        ...state,
      };
    default:
      return state;
  }
}
