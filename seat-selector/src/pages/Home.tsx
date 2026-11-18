import { Container, Navbar, NavDropdown } from "react-bootstrap";

export default function Home() {
  return (
    <div className="home-page">
      <Navbar>
        <Container className="justify-content-start gap-4">
          <Navbar.Brand>Seat Selector</Navbar.Brand>
          <NavDropdown title="Seat Canvas">
            <NavDropdown.Item href="/canvas">New Seat Canvas</NavDropdown.Item>
            <NavDropdown.Item href="/load-canvas">
              Load Seat Canvas
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Guest Arrangement">
            <NavDropdown.Item href="/guest">
              New Guest Arrangement
            </NavDropdown.Item>
            <NavDropdown.Item href="/load-arrangement">
              Load Guest Arrangement
            </NavDropdown.Item>
          </NavDropdown>
        </Container>
      </Navbar>

      <p>Create custom seating arrangements for your events</p>
    </div>
  );
}
