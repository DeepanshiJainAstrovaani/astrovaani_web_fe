import React from 'react';
import { Navbar, Nav } from 'reactstrap';
import logo from '../assets/logo.png';
import '../App.css';

const MainNavbar = () => (
  <Navbar style={{ background: '#0000004D' }} expand="md" className="py-3">
    <div className="container d-flex align-items-center justify-content-between">
      <img src={logo} alt="Astrovaani Logo" height="40" />
      <Nav className="mx-auto" navbar>
        <a href="/horoscope" className="nav-link text-white" style={{ fontFamily: 'Lato', fontWeight: 400 }}>Horoscope</a>
        <a href="/how-to-use" className="nav-link text-white" style={{ fontFamily: 'Lato', fontWeight: 400 }}>How to use</a>
        <a href="/join" className="nav-link text-white" style={{ fontFamily: 'Lato', fontWeight: 400 }}>Join Astrovaani</a>
        <a href="/free-kundali" className="nav-link text-white" style={{ fontFamily: 'Lato', fontWeight: 400 }}>Free Kundali</a>
      </Nav>
    </div>
  </Navbar>
);

export default MainNavbar;
