import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Dropdown, Image } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiTool, FiCalendar, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import styles from "./UserHeader.module.css";
import defaultAvatar from "../../src/assets/images/profile.png";

interface User {
  name: string;
  profilePicture: string;
}

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    name: "User",
    profilePicture: defaultAvatar,
  });

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userDataString = localStorage.getItem("userData");
        if (!userDataString) return;

        const userData = JSON.parse(userDataString) as User;
        
        let profilePicUrl = defaultAvatar;
        if (userData?.profilePicture) {
          if (userData.profilePicture.startsWith("http")) {
            profilePicUrl = userData.profilePicture;
          } else {
            const cleanedPath = userData.profilePicture
              .replace(/\\/g, "/")
              .replace(/^uploads\//, "")
              .replace(/^undefined\//, "");
            
            console.log("Cleaned path:", cleanedPath);
            profilePicUrl = `http://localhost:5000/${cleanedPath}`;
          }
        }

        setUser({
          name: userData?.name || "User",
          profilePicture: profilePicUrl,
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser({ name: "User", profilePicture: defaultAvatar });
      }
    };

    loadUserData();
    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn("Failed to load profile image:", e.currentTarget.src);
    e.currentTarget.src = defaultAvatar;
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <Navbar
      expand="lg"
      className={`${styles.navbarCustom}`}
      style={{ 
        background: "linear-gradient(145deg, #1e1e2d, #2c2c3d)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
      }}
    >
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/user/home" className={`fw-bold fs-4 ${styles.brand}`}>
          WORK SPHERE
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className={styles.navbarToggler} />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/user/home" 
              className={`mx-2 ${styles.navLink} ${location.pathname === "/user/home" ? styles.activeLink : ""}`}
            >
              <FiHome className={styles.navIcon} />
              <span className={styles.navText}>Home</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/user/services" 
              className={`mx-2 ${styles.navLink} ${location.pathname === "/user/services" ? styles.activeLink : ""}`}
            >
              <FiTool className={styles.navIcon} />
              <span className={styles.navText}>Services</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/user/bookings" 
              className={`mx-2 ${styles.navLink} ${location.pathname === "/user/bookings" ? styles.activeLink : ""}`}
            >
              <FiCalendar className={styles.navIcon} />
              <span className={styles.navText}>Book Service</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/user/mybookings" 
              className={`mx-2 ${styles.navLink} ${location.pathname === "/user/mybookings" ? styles.activeLink : ""}`}
            >
              <FiCalendar className={styles.navIcon} />
              <span className={styles.navText}>My Bookings</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/user/profile" 
              className={`mx-2 ${styles.navLink} ${location.pathname === "/user/profile" ? styles.activeLink : ""}`}
            >
              <FiUser className={styles.navIcon} />
              <span className={styles.navText}>Profile</span>
            </Nav.Link>
          </Nav>

          <Dropdown align="end" className={styles.profileDropdown}>
            <Dropdown.Toggle 
              variant="link" 
              className={`d-flex align-items-center ${styles.dropdownToggle}`}
            >
              <div className={styles.avatarContainer}>
                <Image
                  src={user.profilePicture}
                  roundedCircle
                  className={styles.avatar}
                  onError={handleImageError}
                />
              </div>
              <span className={styles.userName}>{user.name}</span>
              <FiChevronDown className={styles.dropdownChevron} />
            </Dropdown.Toggle>

            <Dropdown.Menu className={styles.dropdownMenu}>
              <Dropdown.Item 
                as={Link} 
                to="/user/profile" 
                className={styles.dropdownItem}
              >
                <FiUser className={styles.dropdownIcon} />
                Profile
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={handleLogout}
                className={styles.dropdownItem}
              >
                <FiLogOut className={styles.dropdownIcon} />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;