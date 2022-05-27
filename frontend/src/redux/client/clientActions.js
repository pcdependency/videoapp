import axios from "axios";
import {
  UPDATE_ALV,
  CHANGE_PROFILE_ISFOLLOWING,
  CHANGE_PROFILE_FOLLOW,
  CHANGE_VIDEO_FOLLOW,
  CHANGE_MODAL_USER_ISFOLLOWING,
  CHANGE_VIDEO_ISFOLLOWING,
} from "./clientTypes";
import { SET_ALERT } from "../error/alertTypes";
import { UPDATE_TLV } from "../auth/authTypes";
const API_URL = "/api/main/";

export const updateVideoLiked =
  ({ _id, type }) =>
  async (dispatch) => {
    try {
      await axios.post(
        `/api/auth/update/profile/liked/${type}/video/${_id}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const value = type === "like" ? true : false;

      dispatch({
        type: UPDATE_ALV,
        payload: {
          keys: ["video", "isLiked"],
          value,
          type: "set",
        },
      });
      dispatch({
        type: UPDATE_ALV,
        payload: {
          keys: ["video", "likes"],
          value: value ? +1 : -1,
          type: "equate",
        },
      });
      dispatch({
        type: SET_ALERT,
        payload: {
          message: "Liked",
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

export const getFollow = (reqData) => async (dispatch) => {
  try {
    const { page_id, user_id, type, requesting, requested } = reqData;

    const res = await axios.post(`/api/auth/get/profile/${type}`, {
      user_id,
      page_id,
      requesting,
      requested,
    });
    dispatch({
      type: UPDATE_ALV,
      payload: {
        keys: ["people"],
        value: res.data,
        type: requested === 0 ? "set" : "push",
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

export const checkFollowing = (_id) => async (dispatch) => {
  try {
    const isFollowing = await axios.get(
      `/api/auth/check/profile/following/${_id}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    dispatch({
      type: UPDATE_ALV,
      payload: {
        keys: ["profile", "isFollowing"],
        value: isFollowing.data,
        type: "set",
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

export const updateFollow = (reqData) => async (dispatch) => {
  try {
    const { type, _id, variant } = reqData;
    await axios.post(
      `/api/auth/update/profile/${type}/${_id}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    const val = type === "unfollow" ? -1 : +1;
    const bool = type === "unfollow" ? false : true;

    if (variant === 1) {
      dispatch({
        type: CHANGE_PROFILE_ISFOLLOWING,
        payload: bool,
      });
      dispatch({
        type: CHANGE_PROFILE_FOLLOW,
        payload: {
          key: "followers",
          value: val,
        },
      });
    }
    if (variant === 2) {
      dispatch({
        type: CHANGE_VIDEO_ISFOLLOWING,
        payload: bool,
      });
      dispatch({
        type: CHANGE_VIDEO_FOLLOW,
        payload: {
          key: "followers",
          value: val,
        },
      });
    }
    if (variant === 3) {
      dispatch({
        type: CHANGE_MODAL_USER_ISFOLLOWING,
        payload: {
          _id,
          value: bool,
        },
      });
      dispatch({
        type: CHANGE_PROFILE_FOLLOW,
        payload: {
          key: "following",
          value: val,
        },
      });
    }
    if (variant === 4) {
      dispatch({
        type: CHANGE_MODAL_USER_ISFOLLOWING,
        payload: {
          _id,
          value: bool,
        },
      });
      dispatch({
        type: CHANGE_VIDEO_FOLLOW,
        payload: {
          key: "following",
          value: val,
        },
      });
    }
    if (variant === 5) {
      dispatch({
        type: CHANGE_MODAL_USER_ISFOLLOWING,
        payload: {
          _id,
          value: bool,
        },
      });
    }

    dispatch({
      type: SET_ALERT,
      payload: {
        message: type === "follow" ? "Followed" : "Unfollowed",
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

export const updateProfile = (userData) => async (dispatch) => {
  try {
    const { userName, email, password1, password2, picture, banner } = userData;

    if (email || userName || password2) {
      const reqData = {
        email,
        userName,
        password1,
        password2,
      };
      await axios.post("/api/auth/update/profile/info", reqData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
    }

    if (banner) {
      const formData = new FormData();
      formData.append("file", banner);
      await axios.post(API_URL + "upload/pb", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
    }
    if (picture) {
      const formData = new FormData();
      formData.append("file", picture);
      await axios.post(API_URL + "upload/pp", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
    }
    if (banner || picture) {
      window.location.reload();
    }
    if (userName) {
      dispatch({
        type: UPDATE_ALV,
        payload: {
          keys: ["profile", "userName"],
          value: userData.userName,
          type: "set",
        },
      });
    }
    if (email) {
      dispatch({
        type: UPDATE_TLV,
        payload: {
          key: "validated",
          value: false,
        },
      });
      dispatch({
        type: SET_ALERT,
        payload: {
          message: "Confirmation email sent",
          type: "success",
          duration: 2000,
          visible: true,
        },
      });
    }
    dispatch({
      type: UPDATE_ALV,
      payload: {
        keys: ["loading"],
        value: false,
        type: "set",
      },
    });
    !email &&
      dispatch({
        type: SET_ALERT,
        payload: {
          message: "Updated",
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
    dispatch({
      type: UPDATE_ALV,
      payload: {
        keys: ["loading"],
        value: false,
        type: "set",
      },
    });
  }
};

export const getProfile = (_id) => async (dispatch) => {
  try {
    const profile = await axios.get(API_URL + `/profile/${_id}`);

    dispatch({
      type: UPDATE_ALV,
      payload: {
        keys: ["profile"],
        value: profile.data[0],
        type: "set",
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

export const uploadVideo = (form) => async (dispatch) => {
  try {
    const formData = new FormData();
    formData.append("file", form.video);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);

    const videoRes = await axios.post(API_URL + "/upload/video", formData, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      onUploadProgress: (data) => {
        dispatch({
          type: UPDATE_ALV,
          payload: {
            keys: ["progress"],
            value: Math.round(100 * (data.loaded / data.total)),
            type: "set",
          },
        });
      },
    });
    if (form.thumbnail) {
      const formData = new FormData();
      formData.append("file", form.thumbnail);
      formData.append("_id", videoRes.data._id);
      await axios.post(API_URL + "/upload/thumbnail", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        onUploadProgress: (data) => {
          dispatch({
            type: UPDATE_ALV,
            payload: {
              keys: ["progress"],
              value: Math.round(100 * (data.loaded / data.total)),
              type: "set",
            },
          });
        },
      });
    }
    window.location = `/watch/${videoRes.data._id}`;
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

export const getVideo = (_id, user_id) => async (dispatch) => {
  try {
    const resolutions = [240, 360, 480, 720, 1080];
    const videoRes = await axios.get(API_URL + `/video/${_id}/${user_id}`);
    dispatch({
      type: UPDATE_ALV,
      payload: {
        keys: ["video"],
        value: {
          ...videoRes.data.video,
          isLiked: videoRes.data.isLiked,
          author: videoRes.data.video.author[0],
          resolution: resolutions[videoRes.data.video.sizes - 1],
          resolutions: resolutions.filter(
            (r, i) => i <= videoRes.data.video.sizes - 1
          ),
          currentTime: 0,
          prevTime: 0,
        },
        type: "set",
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

export const getVideos = (reqData) => async (dispatch) => {
  try {
    const { requesting, requested, _id, type } = reqData;
    const videosRes = await axios.get(
      API_URL + `videos/profile/${requested}/${requesting}/${_id}`
    );
    if (videosRes.data.length > 0) {
      dispatch({
        type: UPDATE_ALV,
        payload: {
          keys: ["videos"],
          value: videosRes.data,
          type,
        },
      });
    }
  } catch (error) {
    error.response.status !== 404 &&
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
