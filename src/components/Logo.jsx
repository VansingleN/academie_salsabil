import logo from '../images/logo.webp'
import './Logo.css'

function Logo({ className = "" }) {
    return (
        <div className={`navbar-logo ${className}`}>
            <img src={logo} alt="Logo" className="logo-image" />
            <p className="logo-text">
                A C A D É M I E <br />
                <span className="logo-subtext">S A L S A B I L</span>
            </p>
        </div>
    )
}


/* function Logo() {
    return (
        <div className="navbar-logo">
            <img src={logo} alt="Logo" className="logo-image" />
            <p className="logo-text">A C A D É M I E <br /><span className="logo-subtext">S A L S A B I L</span></p>
        </div>
    )
} */

export default Logo
