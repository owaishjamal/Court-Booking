import React from "react";
import { Navbar, Nav, NavDropdown, Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import config from "../config";


const StylishNavbar = () => {
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userRole"); // Retrieve user type

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="navbar-brand">
        QuickCourt
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact">
              Contact
            </Nav.Link>
            <NavDropdown title="Options" id="nav-dropdown">
              {userType !== "manager" && (
                <>
                  <NavDropdown.Item as={Link} to="/user-dashboard">
                    My Bookings
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/bookings">
                    My Bookings
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/centres">
                    Find Centres
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                </>
              )}
              {userId ? (
                <NavDropdown.Item as={Link} to="/userProfile">
                  Profile
                </NavDropdown.Item>
              ) : (
                <NavDropdown.Item as={Link} to="/login">
                  Login
                </NavDropdown.Item>
              )}
              {userType === "manager" && (
                <>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/manager-dashboard">
                    Manager Dashboard
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/addCentre">
                    Add Centre
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/addSport">
                    Add Sport
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/addCourt">
                    Add Court
                  </NavDropdown.Item>
                </>
              )}
            </NavDropdown>
            {!userId && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
            {userId && (
              <Button
                variant="outline-light"
                onClick={() => {
                  localStorage.removeItem("userId");
                  localStorage.removeItem("userRole"); // Clear userRole on logout
                  window.location.reload();
                }}
                className="logout-button"
              >
                Logout
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style jsx>{`
        .custom-navbar {
          background: linear-gradient(45deg, #0d6efd, #6610f2);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .navbar-brand {
          font-family: "Montserrat", sans-serif;
          font-size: 1.5em;
          font-weight: bold;
          color: #ffffff !important;
          letter-spacing: 1px;
        }

        .ml-auto .nav-link,
        .ml-auto .dropdown-toggle {
          color: #f8f9fa !important;
          font-weight: 500;
          font-size: 1.1em;
          transition: color 0.3s ease;
        }

        .ml-auto .nav-link:hover,
        .ml-auto .dropdown-toggle:hover {
          color: #d1d9ff !important;
        }

        .nav-item .nav-link {
          margin-right: 1rem;
        }

        .logout-button {
          margin-left: 15px;
          font-size: 1em;
        }
      `}</style>
    </Navbar>
  );
};

export default StylishNavbar;
