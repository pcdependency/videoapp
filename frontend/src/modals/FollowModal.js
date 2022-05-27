import React, { useState, useEffect, useCallback } from "react";
import "../css/FollowModal.css";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfilePicture from "../components/ProfilePicture";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { getFollow, updateFollow } from "../redux/client/clientActions";
import { RESET_FLV } from "../redux/client/clientTypes";
import { modalStyle, outlinedBtnStyle } from "../css/MuiStyles";
import CloseIcon from "@mui/icons-material/Close";

const profilePictureStyles = {
  marginRight: "10px",
  maxHeight: "40px",
  minHeight: "40px",
  maxWidth: "40px",
  minWidth: "40px",
  borderRadius: "40px",
  cursor: "pointer",
  backgroundColor: "black",
};

const FollowModal = ({ _id, type }) => {
  const dispatch = useDispatch();
  const { client, auth } = useSelector((state) => state);
  const { people } = client;
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("following");
  const requesting = 12;
  const requested = people.length;

  function GetFollow(pt) {
    dispatch(
      getFollow({
        page_id: _id,
        user_id: auth._id,
        type: pt ? pt : page,
        requested,
        requesting,
      })
    );
  }

  const Reset = useCallback(() => {
    dispatch({
      type: RESET_FLV,
      payload: "people",
    });
  }, [dispatch]);

  function handleOpen(pt) {
    GetFollow(pt);
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
    Reset();
  }

  useEffect(() => {
    Reset();
  }, [_id, page, Reset]);

  function getVariant() {
    if (_id === auth._id && type === "profile") return 3;
    if (_id === auth._id && type === "video") return 4;
    if (_id !== auth._id && type === "video") return 5;
  }

  return (
    <div className="followModal">
      <p
        className="followTxt"
        onClick={() => {
          setPage("followers");
          handleOpen("followers");
        }}
      >
        {type === "profile"
          ? client.profile.followers
          : type === "video"
          ? client.video.author.followers
          : 0}{" "}
        followers
      </p>
      <p
        className="followTxt"
        onClick={() => {
          setPage("following");
          handleOpen("following");
        }}
      >
        {type === "profile"
          ? client.profile.following
          : type === "video"
          ? client.video.author.following
          : 0}{" "}
        following
      </p>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle} className="modalContainer">
          <div className="modalHeader">
            <p className="modalHeaderTxt">{page}</p>
            <CloseIcon
              style={{ height: "30px", width: "30px", cursor: "pointer" }}
              className="closeIcon"
              onClick={handleClose}
            />
          </div>
          <div className="followUsersContainer">
            <InfiniteScroll
              dataLength={people.length}
              next={GetFollow}
              hasMore={true}
              scrollableTarget="followUsersContainer"
            >
              {people.length > 0 ? (
                people.map((p) => {
                  return (
                    <div className="followUserContainer" key={p._id}>
                      <div className="followUserInfoContainer">
                        <Link
                          onClick={() => setOpen(false)}
                          to={`/channel/${p._id}/featured`}
                        >
                          <ProfilePicture
                            styles={profilePictureStyles}
                            menu={false}
                            _id={p._id}
                          />
                        </Link>
                        <Link
                          onClick={() => setOpen(false)}
                          to={`/channel/${p._id}/featured`}
                          className="followUserName"
                        >
                          {p.userName}
                        </Link>
                      </div>
                      {p._id !== auth._id ? (
                        <Button
                          sx={outlinedBtnStyle}
                          variant="outlined"
                          onClick={() => {
                            dispatch(
                              updateFollow({
                                type: p.isFollowing ? "unfollow" : "follow",
                                _id: p._id,
                                variant: getVariant(),
                              })
                            );
                          }}
                        >
                          {p.isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      ) : (
                        <p className="altBtnTxt">You</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="followUserContainer">
                  <div className="followUserInfoContainer">
                    <p>No {page}</p>
                  </div>
                </div>
              )}
            </InfiniteScroll>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default FollowModal;
