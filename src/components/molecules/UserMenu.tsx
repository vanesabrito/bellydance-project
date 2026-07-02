"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import Image from "next/image";

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccountClick = () => {
    handleClose();
    router.push("/account");
  };

  const handleProfileClick = () => {
    handleClose();
    router.push("/account/profile");
  };

  const handleLogout = async () => {
    handleClose();
    await signOut({ callbackUrl: "/login" });
  };

  const user = (session as any)?.user;
  const userName = user?.nombre || user?.email || "Usuario";
  const userPhoto = user?.fotoPerfil || "/logo-bellydance-project.png";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          cursor: "pointer",
          padding: 1,
          borderRadius: 2,
          transition: "background-color 0.2s",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          },
        }}
        onClick={handleClick}
      >
        <Avatar
          src={userPhoto}
          alt={userName}
          sx={{ width: 40, height: 40 }}
          imgProps={{
            style: { objectFit: 'cover' }
          }}
        >
          {!userPhoto && <AccountCircleIcon />}
        </Avatar>
        <Box sx={{ ml: 1.5, display: { xs: "none", sm: "block" } }}>
          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.9rem", color: "white" }}>
            {userName}
          </Typography>
        </Box>
        <ExpandMoreIcon sx={{ ml: 0.5, fontSize: "1.2rem", color: "white" }} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            minWidth: 200,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleAccountClick}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" sx={{ color: "#ec407a" }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Cuenta de Usuario</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: "#ec407a" }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Mi Perfil</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "#ec407a" }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
