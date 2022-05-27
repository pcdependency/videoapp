import React from "react";
import "../css/Nav.css";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import { Link } from "react-router-dom";
import { SvgIcon } from "@mui/material";

const links = [
  { link: "home", icon: HomeIcon, path: "/" },
  { link: "explore", icon: ExploreIcon, path: "/explore" },
  { link: "subscriptions", icon: RecentActorsIcon, path: "/subscriptions" },
  { link: "library", icon: DynamicFeedIcon, path: "/library" },
];

const navLinkIcon = {
  height: "30px",
  width: "30px",
  fill: "white",
  color: "white",
};

const Nav = () => {
  return (
    <div className="navContainer">
      <div className="navLinksContainer">
        {links.map((l) => {
          return (
            <Link
              to={l.path}
              className={`navLinkContainer ${l.link}`}
              key={l.link}
            >
              <SvgIcon
                component={l.icon}
                className="navLinkIcon"
                style={navLinkIcon}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Nav;
