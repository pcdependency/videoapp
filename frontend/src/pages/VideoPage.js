import React, { useEffect, useCallback, useState } from "react";
import "../css/VideoPage.css";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { SvgIcon } from "@mui/material";
import ProfilePicture from "../components/ProfilePicture";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import FollowModal from "../modals/FollowModal";
import { getVideo, updateVideoLiked } from "../redux/client/clientActions";
import { updateFollow } from "../redux/client/clientActions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import formatNumber from "../utils/formatNumber";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { UPDATE_ALV } from "../redux/client/clientTypes";
import Button from "@mui/material/Button";
import { menuStyle, muiItemStyle } from "../css/MuiStyles";

const controls = [
  {
    control: "like",
    icon: FavoriteBorderIcon,
    text: false,
  },
  {
    control: "share",
    icon: ShareIcon,
    text: true,
  },
  {
    control: "more",
    icon: MoreHorizIcon,
    text: false,
  },
];

const controlIcon = {
  height: "25px",
  width: "25px",
  color: "white",
};

const profilePictureStyles = {
  margin: "0 10px 0 0",
  height: "60px",
  width: "60px",
  borderRadius: "50%",
  backgroundColor: "black",
};

const VideoPage = () => {
  const videoRef = React.useRef(0);
  const dispatch = useDispatch();
  const { _id } = useParams();
  const { auth, client } = useSelector((state) => state);
  const { video } = client;
  const [anchorEl, setAnchorEl] = useState(null);
  const [videoHover, setVideoHover] = useState(false);

  const GetVideo = useCallback(() => {
    dispatch(getVideo(_id, auth._id));
  }, [dispatch, _id, auth._id]);

  useEffect(() => {
    GetVideo();
  }, [GetVideo]);

  return video && video.resolution ? (
    <div className="videoPageContainer">
      <div
        className="videoPageInnerContainer"
        style={{
          paddingTop: auth.validated ? "70px" : "20px",
        }}
      >
        <div className="videoPageLeftContainer">
          <div className="videoContainer">
            <video
              width="100%"
              height="100%"
              onMouseOver={() => setVideoHover(true)}
              onMouseOut={() => setVideoHover(false)}
              onTimeUpdate={() =>
                video.prevTime > 0
                  ? (videoRef.current.currentTime = video.prevTime)
                  : dispatch({
                      type: UPDATE_ALV,
                      payload: {
                        keys: ["video", "currentTime"],
                        value: videoRef.current.currentTime,
                        type: "set",
                      },
                    })
              }
              onPlay={() => {
                dispatch({
                  type: UPDATE_ALV,
                  payload: {
                    keys: ["video", "prevTime"],
                    value: 0,
                    type: "set",
                  },
                });
              }}
              ref={videoRef}
              className="video"
              controls
              src={`/api/main/stream/video/${video.resolution}/${_id}`}
            />
            <Button
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(0, 0, 0, .04)",
                },
                margin: "10px",
                transform:
                  videoHover || videoRef.current.paused
                    ? ""
                    : "translateY(-50px)",
                transition: "ease-in-out .2s",
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              onMouseOver={() => setVideoHover(true)}
            >
              <p
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    textTransform: "lowercase",
                  }}
                >
                  {video.resolution}p
                </span>
                <span
                  style={{
                    fontSize: "50%",
                    color: "red",
                  }}
                >
                  {video.resolution >= 1080 && "HD"}
                </span>
              </p>
            </Button>
            <Menu
              sx={menuStyle}
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              {video.resolutions.map((r) => {
                return (
                  <MenuItem
                    key={r}
                    sx={{
                      ...muiItemStyle,
                      backgroundColor:
                        video.resolution === r && "rgb(40,40,40)",
                    }}
                    onClick={() => {
                      dispatch({
                        type: UPDATE_ALV,
                        payload: {
                          keys: ["video", "prevTime"],
                          value: videoRef.current.currentTime,
                          type: "set",
                        },
                      });
                      dispatch({
                        type: UPDATE_ALV,
                        payload: {
                          keys: ["video", "resolution"],
                          value: r,
                          type: "set",
                        },
                      });
                      setAnchorEl(null);
                    }}
                  >
                    {r}p
                    <p
                      style={{
                        fontSize: "50%",
                        color: "red",
                      }}
                    >
                      {r >= 1080 && "HD"}
                    </p>
                  </MenuItem>
                );
              })}
            </Menu>
          </div>
          <div className="videoInfoContainer">
            <div className="videoHeaderContainer">
              <div className="videoTitleContainer">
                <p className="videoTitleTxt">{video.title}</p>
              </div>
              <div className="videoAnalyticsContainer">
                <div className="videoAnalyticsLeftContainer">
                  <p className="videoAnalyticsTxt">
                    {video.views
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                    views -{" "}
                    {new Date(video.date).toLocaleDateString("en-us", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="videoAnalyticsRightContainer">
                  {controls.map((c) => {
                    const liked = video.isLiked;
                    const cLiked = c.control === "like";
                    return (
                      <div
                        className="controlIconContainer"
                        key={c.control}
                        style={{
                          opacity: !auth.validated ? ".5" : "1",
                          cursor: !auth.validated ? "default" : "pointer",
                        }}
                        onClick={() =>
                          cLiked &&
                          auth.validated &&
                          dispatch(
                            updateVideoLiked({
                              _id,
                              type: liked ? "unlike" : "like",
                            })
                          )
                        }
                      >
                        <SvgIcon
                          component={liked && cLiked ? FavoriteIcon : c.icon}
                          style={{
                            ...controlIcon,
                            filter:
                              "brightness(0) saturate(100%) invert(82%) sepia(8%) saturate(3211%) hue-rotate(14deg) brightness(103%) contrast(98%)",
                          }}
                          className={`controlIcon ${c.control}`}
                        />
                        <p className={`controlIconTxt ${c.control}`}>
                          {c.text
                            ? c.control
                            : c.control === "like" && formatNumber(video.likes)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="videoAuthorInfoContainer">
              <div className="videoAuthorLeftContainer">
                <Link to={`/channel/${video.author._id}/featured`}>
                  <ProfilePicture
                    styles={profilePictureStyles}
                    menu={false}
                    _id={video.author._id}
                  />
                </Link>

                <div className="videoAuthorTxtContainer">
                  <Link to={`/channel/${video.author._id}/featured`}>
                    <p className="videoAuthorTxt">{video.author.userName}</p>
                  </Link>
                  <FollowModal _id={video.author._id} type="video" />
                </div>
              </div>
              <div className="videoAuthorRightContainer">
                {!auth._id && (
                  <button
                    className="videoFollowBtn"
                    onClick={() =>
                      dispatch(
                        updateFollow({
                          type: video.author.isFollowing
                            ? "unfollow"
                            : "follow",
                          _id: video.author._id,
                          variant: 2,
                        })
                      )
                    }
                  >
                    {video.author.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </div>

            <div
              className="videoDescriptionContainer"
              style={{ maxHeight: "100px" }}
            >
              <p>{video.description}</p>
            </div>
          </div>
        </div>
        <div className="videoPageRightContainer"></div>
      </div>
    </div>
  ) : null;
};

export default VideoPage;
