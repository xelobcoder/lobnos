// Content.js

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
function Home() {
  const toggleCarousel = (action) => {
    const { Carousel } = require("bootstrap");
    const carousel = new Carousel("#myCarousel");
    if (action === "next") {
      carousel.next();
    } else {
      carousel.prev();
    }
  };
  return (
    <>
      {" "}
      <div>
        <button
          className="btn btn-primary"
          onClick={() => toggleCarousel("prev")}
        >
          Prev
        </button>
        <button
          className="btn btn-primary ms-3"
          onClick={() => toggleCarousel("next")}
        >
          Next
        </button>
      </div>
      <div>
        <div
          id="myCarousel"
          className="carousel slide"
          data-bs-touch="false"
          data-bs-interval="false"
          style={{ maxWidth: "50%", height: "80vh", overflow: "hidden" }}
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="https://picsum.photos/id/237/700/700" />
            </div>
            <div className="carousel-item">
              <img src="https://picsum.photos/id/123/700/700" />
            </div>
            <div className="carousel-item">
              <img src="https://picsum.photos/id/234/700/700" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


function Home2() {
  const showModal = () => {
    const { Modal } = require("bootstrap");
    const myModal = new Modal("#exampleModal");

    myModal.show();
  };
  return (
    <div className="d-flex">
      <button type="button" className="btn" onClick={showModal}>
        Launch demo modal
      </button>

      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Modal title
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              . . .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Content() {
  const [dropdownVisible, setDropdownVisible] = useState(null);

  const toggleDropdown = (item) => {
    setDropdownVisible(item);
  };

  return (
    <div className="content">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>Welcome to My Website</Typography>
          <nav>
            <ul className="navbar-links">
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
        </Toolbar>
      </AppBar>
      <div className="sidebar-and-main">
        <aside className="sidebar">
          <nav>
            <ul>
              {[0, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
                return (
                  <li key={index}>
                    <a href="#">Link 1</a>
                    {dropdownVisible == item && (
                      <ul>
                        <li><a href="#">Dropdown 1</a></li>
                        <li><a href="#">Dropdown 2</a></li>
                        <li><a href="#">Dropdown 3</a></li>
                        <li><a href="#">Dropdown 4</a></li>
                      </ul>
                    )}
                    <ExpandMoreIcon onClick={(ev) => { toggleDropdown(item) }} />
                  </li>
                )
              })}
              {/* Repeat for other links */}
            </ul>
          </nav>
        </aside>
        <main className="main-body">
          {/* Main body content */}
          <h2>Main Content Area</h2>
          <p>This is where the main content of the website goes.</p>
          <Home />
          <Home2 />
          <div className='responsive'>
            <table className='table'>
              <thead>
                <tr>
                  <th  className='fw-bold'>Method</th>
                  <th  className='fw-bold'>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Method</td>
                  <td>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Content;
