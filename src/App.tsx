import { useState } from "react"

const bookingUrl = "https://calendar.app.google/oiG96mHGZFGnvVL96"

const services = [
  {
    number: "01",
    title: "Groot onderhoud",
    description:
      "Een grondige check van je aandrijving, lagers, remmen, algemene boutcontrole, banden en spaakspanning.",
  },
  {
    number: "02",
    title: "Klein onderhoud",
    description:
      "Ketting smeren, remmen en versnellingen nauwkeurig afstellen.",
  },
  {
    number: "03",
    title: "Custom builds",
    description:
      "Van een nieuwe groepset tot een volledig naar wens opgebouwde fiets.",
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
            <small>Herlegemstraat 66</small>
            <small>9040 Destelbergen</small>
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
            <h1>Bikehouse Lein</h1>
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
 <section id="services" className="section services-section">
          <div className="services-intro">
            <div>
              <p className="eyebrow eyebrow--light">Onze services</p>
              <h2>Waar heeft je fiets behoefte aan?</h2>
            </div>
            <p>
              Onderhoud afgestemd op jou & je fiets
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
        <section id="over" className="section about-section">
          <div className="section-grid">
            <div className="section-heading">
              <p className="eyebrow">Over Bikehouse Lein</p>
              <h2>Gebouwd vanuit een liefde voor de fiets.</h2>
            </div>
            <div className="about-copy">
              <p className="lead">
                Bikehouse Lein is het fietsatelier van Zahre Lein.
              </p>
              <p>
                Vanuit een passie voor het vak ontstond een plek waar de sportieve en karaktervolle fiets centraal staat.  
              </p>
              <p>
                Of het nu gaat om een kleine herstelling of een groot onderhoud: we nemen de tijd om naar je te luisteren en fixen je probleem.
              </p>
              <p>
                Bikehouse Lein is ook een ontmoetingsplek. We organiseren social rides, drop rides en werken nauw samen met de community van Club 9000. Daarnaast vind je ons wekelijks op donderdag aan het werk bij Giedon.
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

        <section id="galerij" className="section work-section">
          <div className="work-heading">
            <div>
              <p className="eyebrow">Recent werk</p>
            </div>
          
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
          <a
              className="text-link"
              href="https://www.instagram.com/bikehouse_lein/"
              target="_blank"
              rel="noreferrer"
            >
              Meer op Instagram
              <ArrowIcon />
            </a>
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
            <small>Herlegemstraat 66</small>
            <small>9040 Destelbergen</small>
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
