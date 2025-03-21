import { useState } from "react";
import PropTypes from "prop-types";
import { AvatarContext } from "./AvatarContext";

const AvatarProvider = ({ children }) => {
  const [avatar, setAvatar] = useState(null);

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

AvatarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AvatarProvider;
