import logo from './logo.jpg'

export default function Header() {
  return (
    <header className="site">
      <div className="brand">
        <img src={logo} alt="Human Right Protection Council of Gujarat seal" />
        <div className="brand-text">
          <div className="hi">मानव अधिकार सुरक्षा संघ</div>
          <div className="en">Human Right Protection Council of Gujarat</div>
        </div>
      </div>
      <nav className="sans">
        <a href="#mandate">Mandate</a>
        <a href="#services">What We Do</a>
        <a href="#about">About</a>
        <a href="#involve">Get Involved</a>
        <a href="/leadership">Leadership</a>
        <a href="/gallery">Gallery</a>
        <a href="/news">News</a>
        <a href="/events">Events</a>
        <a href="/campaigns">Campaigns</a>
        <a href="/human-rights-links">Human Rights Links</a>
        <a href="/volunteer-register">Volunteer</a>
        <a href="/internship-register">Internship</a>
        <a href="/donate">Donate</a>
        <a href="/register-complaint">File a Complaint</a>
        <a href="/login">Login</a>
      </nav>
    </header>
  )
}
