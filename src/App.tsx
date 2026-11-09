import { useState } from "react"

const bookingUrl = "https://calendar.app.google/oiG96mHGZFGnvVL96"

const services = [
  {
    number: "01",
    title: "Groot onderhoud",
    description:
      "Een grondige check van banden, aandrijving, lagers, remmen, bouten, bandendruk en spaakspanning.",
  },
  {
    number: "02",
    title: "Klein onderhoud",
    description:
      "Ketting smeren en remmen en versnellingen nauwkeurig afstellen, zodat je fiets weer vlot rijdt.",
  },
  {
    number: "03",
    title: "Custom builds",
    description:
      "Van een nieuwe groepset tot een volledig opgebouwde fiets die past bij jouw ritten en ambities.",
  },
  {
    number: "04",
    title: "Bandenservice",
    description:
      "Binnen- en buitenbanden vervangen, tubeless monteren of sealant bijvullen.",
  },
]

const projects = [
  {
    image: "/images/bianchi.jpg",
    title: "Bianchi custom build",
    description: "Afgewerkt met SRAM",
    className: "project project--wide",
  },
  {
    image: "/images/remmen-ontluchten.jpeg",
    title: "Remmen ontluchten",
    description: "Klein onderhoud",
    className: "project",
  },
  {
    image: "/images/tideace-custom-build.jfif",
    title: "Tideace custom build",
    description: "Opbouw op maat",
    className: "project",
  },
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`menu-icon ${open ? "menu-icon--open" : ""}`}
      aria-hidden="true"
    >
      <span />
      <span />
    </span>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="brand"
          href="#home"
          onClick={closeMenu}
          aria-label="Bikehouse Lein, naar home"
        >
          <span className="brand-mark" aria-hidden="true">
            BL
          </span>
          <span>
            <strong>Bikehouse Lein</strong>
            <small>Fietsatelier Gent</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <MenuIcon open={menuOpen} />
        </button>

        <nav
          id="main-navigation"
          className={`main-navigation ${
            menuOpen ? "main-navigation--open" : ""
          }`}
          aria-label="Hoofdnavigatie"
        >
          <a href="#over" onClick={closeMenu}>
            Over ons
          </a>
          <a href="#services" onClick={closeMenu}>
            Services
          </a>
          <a href="#galerij" onClick={closeMenu}>
            Werk
          </a>
          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
          <a
            className="nav-cta"
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            Afspraak maken
            <ArrowIcon />
          </a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <img
            className="hero-image"
            src="/images/achtergrond-opening.jpeg"
            alt="Racefiets in het atelier van Bikehouse Lein"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow eyebrow--light">
              Fietsatelier in Destelbergen
            </p>
            <h1>Vakwerk voor elke sportieve fiets.</h1>
            <p className="hero-intro">
              Persoonlijk onderhoud, herstellingen en custom builds voor
              racefietsen, gravelbikes en trekkingfietsen.
            </p>
            <div className="hero-actions">
              <a
                className="button button--primary"
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Maak een afspraak
                <ArrowIcon />
              </a>
              <a className="text-link text-link--light" href="#services">
                Bekijk onze services
              </a>
            </div>
          </div>
          <a className="hero-location" href="#contact">
            <span>Herlegemstraat 66</span>
            <strong>9040 Destelbergen</strong>
          </a>
        </section>

        <section id="over" className="section about-section">
          <div className="section-grid">
            <div className="section-heading">
              <p className="eyebrow">Over Bikehouse Lein</p>
              <h2>Gebouwd vanuit een liefde voor de fiets.</h2>
            </div>
            <div className="about-copy">
              <p className="lead">
                Bikehouse Lein is het fietsatelier van Zahre Lein: fervent
                fietser, renner en bikepacker.
              </p>
              <p>
                Vanuit die passie ontstond een plek waar kwaliteit, persoonlijk
                advies en technisch vakmanschap centraal staan. We denken mee
                over wat jouw fiets nodig heeft en werken elke herstelling
                zorgvuldig af.
              </p>
              <p>
                Je kan bij ons terecht met racefietsen, gravelbikes en
                trekkingfietsen, van een snelle afstelling tot een volledig op
                maat gebouwde fiets.
              </p>
            </div>
          </div>
          <div className="about-visual">
            <img
              src="/images/over-ons.png"
              alt="Zahre Lein werkt aan een fiets in het atelier"
            />
            <div
              className="about-stamp"
              aria-label="Persoonlijk atelier, lokaal vakwerk"
            >
              <span>Persoonlijk atelier</span>
              <strong>Lokaal vakwerk</strong>
            </div>
          </div>
        </section>

        <section id="services" className="section services-section">
          <div className="services-intro">
            <div>
              <p className="eyebrow eyebrow--light">Onze services</p>
              <h2>Alles om jouw fiets in topvorm te houden.</h2>
            </div>
            <p>
              Geen standaardoplossing, maar onderhoud afgestemd op je fiets,
              rijstijl en plannen.
            </p>
          </div>
          <div className="services-list">
            {services.map((service) => (
              <article className="service-row" key={service.number}>
                <span className="service-number">{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="service-arrow" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </article>
            ))}
          </div>
        </section>

        <section id="galerij" className="section work-section">
          <div className="work-heading">
            <div>
              <p className="eyebrow">Recent werk</p>
              <h2>Met aandacht gebouwd. Klaar om te rijden.</h2>
            </div>
            <a
              className="text-link"
              href="https://www.instagram.com/bikehouse_lein/"
              target="_blank"
              rel="noreferrer"
            >
              Meer op Instagram
              <ArrowIcon />
            </a>
          </div>
          <div className="projects-grid">
            {projects.map((project) => (
              <article className={project.className} key={project.title}>
                <img src={project.image} alt={project.title} />
                <div className="project-caption">
                  <span>{project.description}</span>
                  <h3>{project.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="booking-banner" aria-labelledby="booking-title">
          <p className="eyebrow eyebrow--light">Klaar voor je volgende rit?</p>
          <h2 id="booking-title">Geef je fiets de zorg die hij verdient.</h2>
          <a
            className="button button--light"
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            Plan je afspraak
            <ArrowIcon />
          </a>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-heading">
            <p className="eyebrow">Contact</p>
            <h2>Spring gerust eens binnen.</h2>
            <p>
              Een vraag over je fiets of herstelling? Bel, mail of maak meteen
              een afspraak.
            </p>
          </div>
          <div className="contact-details">
            <div className="contact-item">
              <span>Telefoon</span>
              <a href="tel:+32470247672">+32 470 24 76 72</a>
            </div>
            <div className="contact-item">
              <span>E-mail</span>
              <a href="mailto:Bikehouselein@gmail.com">
                Bikehouselein@gmail.com
              </a>
            </div>
            <div className="contact-item">
              <span>Atelier</span>
              <a
                href="https://maps.google.com/?q=Herlegemstraat+66,+9040+Destelbergen"
                target="_blank"
                rel="noreferrer"
              >
                Herlegemstraat 66
                <br />
                9040 Destelbergen
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a
          className="brand brand--footer"
          href="#home"
          aria-label="Bikehouse Lein, naar home"
        >
          <span className="brand-mark" aria-hidden="true">
            BL
          </span>
          <span>
            <strong>Bikehouse Lein</strong>
            <small>Fietsatelier Gent</small>
          </span>
        </a>
        <p>Onderhoud, herstellingen en custom builds.</p>
        <div className="footer-meta">
          <a
            href="https://www.instagram.com/bikehouse_lein/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <span>© 2026 Bikehouse Lein</span>
        </div>
      </footer>
    </div>
  )
}
