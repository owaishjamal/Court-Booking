// Sidebar.js
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Collapse,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactMailIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  AddCircle as AddCircleIcon,
  Book as BookIcon,
  LocationOn as LocationOnIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import config from '../config';

const drawerWidth = 280;

const Sidebar = (props) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true); // Add desktop toggle state
  const [optionsOpen, setOptionsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation(); // Add location hook

  // Get userId and userType from localStorage
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userRole"); // Retrieve user type

  // Auto-hide sidebar when on /home route
  useEffect(() => {
    if (location.pathname === '/home') {
      // Show sidebar on /home route
      if (isMobile) {
        setMobileOpen(true);
      } else {
        setDesktopOpen(true);
      }
    } else {
      // Auto-hide sidebar on other routes with 2-second delay
      const timer = setTimeout(() => {
        if (isMobile) {
          setMobileOpen(false);
        } else {
          setDesktopOpen(false);
        }
      }, 1000); // 2 seconds delay

      // Cleanup timer if component unmounts or location changes
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleOptionsClick = () => {
    setOptionsOpen(!optionsOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole"); // Clear userRole on logout
    localStorage.removeItem("authToken"); // Clear auth token on logout
    
    // Dispatch custom event to clear data cache
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    navigate("/login");
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List sx={{ 
        width: '100%',
        minWidth: desktopOpen ? drawerWidth : 0,
        overflow: 'hidden'
      }}>
        {/* Home */}
        <ListItem component={Link} to="/home" key="Home" sx={{ 
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5,
          minWidth: desktopOpen ? 'auto' : 0,
          opacity: desktopOpen ? 1 : 0,
          transition: 'opacity 0.3s ease, min-width 0.3s ease'
        }}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        {/* Manager Dashboard - Standalone for managers */}
        {userType === "manager" && (
          <ListItem component={Link} to="/manager-dashboard" sx={{ 
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
            minWidth: desktopOpen ? 'auto' : 0,
            opacity: desktopOpen ? 1 : 0,
            transition: 'opacity 0.3s ease, min-width 0.3s ease'
          }}>
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Manager Dashboard" 
              primaryTypographyProps={{ 
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            />
          </ListItem>
        )}

        {/* User Dashboard - Standalone for customers */}
        {userType === "customer" && (
          <ListItem component={Link} to="/user-dashboard" sx={{ 
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            backgroundColor: 'rgba(76, 175, 80, 0.08)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            minWidth: desktopOpen ? 'auto' : 0,
            opacity: desktopOpen ? 1 : 0,
            transition: 'opacity 0.3s ease, min-width 0.3s ease'
          }}>
            <ListItemIcon>
              <DashboardIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="My Bookings" 
              primaryTypographyProps={{ 
                fontWeight: 'bold',
                color: 'success.main'
              }}
            />
          </ListItem>
        )}

        {/* Options */}
        <ListItem onClick={handleOptionsClick} sx={{ 
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5,
          minWidth: desktopOpen ? 'auto' : 0,
          opacity: desktopOpen ? 1 : 0,
          transition: 'opacity 0.3s ease, min-width 0.3s ease'
        }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Options" />
          {optionsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={optionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {userType !== "customer" && (
              <>
                <Divider />
              </>
            )}
            {userId ? (
              <ListItem
                component={Link}
                to="/userProfile"
                sx={{ 
                  pl: 4,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  minWidth: desktopOpen ? 'auto' : 0,
                  opacity: desktopOpen ? 1 : 0,
                  transition: 'opacity 0.3s ease, min-width 0.3s ease'
                }}
              >
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
            ) : (
              <ListItem component={Link} to="/login" sx={{ 
                pl: 4,
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                minWidth: desktopOpen ? 'auto' : 0,
                opacity: desktopOpen ? 1 : 0,
                transition: 'opacity 0.3s ease, min-width 0.3s ease'
              }}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
            )}
            {userType === "manager" && (
              <>
                <Divider />
                <ListItem component={Link} to="/addSport" sx={{ 
                  pl: 4,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  minWidth: desktopOpen ? 'auto' : 0,
                  opacity: desktopOpen ? 1 : 0,
                  transition: 'opacity 0.3s ease, min-width 0.3s ease'
                }}>
                  <ListItemIcon>
                    <AddCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Add Sport" />
                </ListItem>
                <ListItem
                  component={Link}
                  to="/addCentre"
                  sx={{ 
                    pl: 4,
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    minWidth: desktopOpen ? 'auto' : 0,
                    opacity: desktopOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease, min-width 0.3s ease'
                  }}
                >
                  <ListItemIcon>
                    <AddCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Add Centre" />
                </ListItem>

                <ListItem component={Link} to="/addCourt" sx={{ 
                  pl: 4,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  minWidth: desktopOpen ? 'auto' : 0,
                  opacity: desktopOpen ? 1 : 0,
                  transition: 'opacity 0.3s ease, min-width 0.3s ease'
                }}>
                  <ListItemIcon>
                    <AddCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Add Court" />
                </ListItem>
              </>
            )}
          </List>
        </Collapse>

        {/* If user is not logged in, show Login and Register */}
        {!userId && (
          <>
            <ListItem component={Link} to="/login" sx={{ 
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              minWidth: desktopOpen ? 'auto' : 0,
              opacity: desktopOpen ? 1 : 0,
              transition: 'opacity 0.3s ease, min-width 0.3s ease'
            }}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem component={Link} to="/register" sx={{ 
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              minWidth: desktopOpen ? 'auto' : 0,
              opacity: desktopOpen ? 1 : 0,
              transition: 'opacity 0.3s ease, min-width 0.3s ease'
            }}>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}

        {/* If user is logged in, show Logout button */}
        {userId && (
          <ListItem onClick={handleLogout} sx={{ 
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            minWidth: desktopOpen ? 'auto' : 0,
            opacity: desktopOpen ? 1 : 0,
            transition: 'opacity 0.3s ease, min-width 0.3s ease'
          }}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar at the top */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: "linear-gradient(45deg, #0d6efd, #6610f2)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Toolbar>
          {/* Menu button for all screen sizes */}
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              minWidth: 44,
              minHeight: 44
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/home"
            sx={{
              textDecoration: "none",
              color: "#fff",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            QuickCourt
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile view */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: "block", md: "none" }, // Show on extra-small and small screens
          "& .MuiDrawer-paper": { 
            boxSizing: "border-box", 
            width: { xs: '100vw', sm: drawerWidth },
            maxWidth: drawerWidth
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer for desktop view */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" }, // Hide on extra-small and small screens
          "& .MuiDrawer-paper": { 
            boxSizing: "border-box", 
            width: desktopOpen ? drawerWidth : 0,
            overflowX: 'hidden',
            borderRight: desktopOpen ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
            transition: 'width 0.3s ease, border-right 0.3s ease'
          },
        }}
        open={desktopOpen}
      >
        {drawer}
      </Drawer>

      {/* Main content area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3, md: 4 },
          width: { 
            xs: '100%', 
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%'
          },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          transition: 'width 0.3s ease' // Smooth transition
        }}
      >
        <Toolbar />
        <Box sx={{ 
          maxWidth: '100%',
          overflowX: 'auto'
        }}>
          {props.children}
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;