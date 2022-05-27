import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "../css/ProfilePicture.css";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth/authActions";

const ProfilePicture = ({ styles, menu, _id }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const user_id = useSelector((state) => state.auth._id);
  const [img, setImg] = useState(true);
  return (
    <>
      {img ? (
        <img
          height={styles.height}
          width={styles.width}
          className="profilePicture"
          style={styles}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          src={`/api/main/stream/pp/100/${_id}`}
          alt=""
          onError={() => setImg(false)}
        />
      ) : (
        <div style={styles} onClick={(e) => setAnchorEl(e.currentTarget)} />
      )}
      {menu && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          sx={{
            "& .MuiMenu-paper": {
              backgroundColor: "rgb(10, 10, 10)",
            },
          }}
        >
          <Link to={`/channel/${user_id}/featured`}>
            <MenuItem onClick={() => setAnchorEl(null)}>My Channel</MenuItem>
          </Link>
          <MenuItem
            onClick={() => {
              dispatch(logout());
              setAnchorEl(null);
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

export default ProfilePicture;
