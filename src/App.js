import React, { Component, Fragment } from "react";
import { Auth } from "aws-amplify";
import { Link, withRouter } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Routes from "./Routes";
import { Drawer, List, ListItem, IconButton } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import Axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import "./main.css";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import compose from "recompose/compose";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#000000" },
    secondary: { main: "#FF8F00", contrastText: "#FFFFFF" }
  },
  button: {
    margin: 100,
    font: "Roboto"
  }
});

/**
 * The App component contains al
 */
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,  // Boolean to check if the current user is authenticated
      isAuthenticating: true,  // Boolean to handle if the current user is in the process of authenticating 
      clickedDrawer: false,    // Boolean to handle opening/closing the left drawer 
      role: "",                // Role of the current user, either 'artist' or 'business'
      credits: 0,              // The number of credits an artist has when logged in
      sub: ""                  // The unique ID of the current user
    };
  }

  /**
   * componentDidMount is the function that handles the components information 
   * when the component is being used. It gets the current user and gets their
   * role, sub, and if they are an artist the number of credits they currently have.
   */
  async componentDidMount() {
    try {

      // Cognito function that checks if the user is signed in.
      Auth.currentSession();

      this.setState({ isAuthenticated: true });

      // Cognito function that gets the current authenticated user and sets
      // the state of role and sub to the values of the user
      await Auth.currentAuthenticatedUser().then(user => {
        this.setState({ role: user.attributes["custom:role"] });
        this.setState({ sub: user.attributes.sub });
      });

      // Axios GET function that gets the number of credits the current number of 
      // credits an artist has.
      if (this.state.role === 'artist') {

        await Axios.get(
          "https://65aztpj6k6.execute-api.us-east-1.amazonaws.com/prod/?role=artist&key=" +
            this.state.sub
        )
        .then(user => { this.setState({credits: user.data.Items[0].credits + user.data.Items[0].freeCredits }); })
        .catch(e => console.log(e.message));
      }

    } catch (e) {
      if (e !== "No current user") {
        console.log(e);
      }

      this.setState({ isAuthenticated: false });
    }

    this.setState({ isAuthenticating: false });
  }

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });

    if (authenticated) {
      Auth.currentAuthenticatedUser().then(user => {
        this.setState({ role: user.attributes["custom:role"] });
      });
    } else {
      this.setState({ isAuthenticating: false });
    }
  };

  // Logs out the current user, then routes to the home page.
  handleLogout = async event => {
    await Auth.signOut();

    await this.setState({ isAuthenticated: false });

    this.props.history.push("/");
  };

  // handleDrawer is the function that handles clicking the drawer open/closed.
  handleDrawer = event => {
    this.setState({
      clickedDrawer: this.state.clickedDrawer ? false : true
    });
  };

  renderBusiness() {
    return (
      <List>
        <LinkContainer to="/BusinessSubmissions">
          <ListItem>
            <Button>Submissions</Button>
          </ListItem>
        </LinkContainer>
        <LinkContainer to="/MyBusinessAccount">
          <ListItem>
            <Button>My Account</Button>
          </ListItem>
        </LinkContainer>
      </List>
    );
  }

  renderArtist() {
    return (
      <List>
        <LinkContainer to="/UploadPage">
          <ListItem>
            <Button>Upload Art</Button>
          </ListItem>
        </LinkContainer>
        <LinkContainer to="/Dashboard">
          <ListItem>
            <Button>Dashboard</Button>
          </ListItem>
        </LinkContainer>
        {this.state.role === "artist" ? (
          <LinkContainer to="/MyArtistAccount">
            <ListItem>
              <Button>My Account</Button>
            </ListItem>
          </LinkContainer>
        ) : (
          <LinkContainer to="/MyBusinessAccount">
            <ListItem>
              <Button>My Account</Button>
            </ListItem>
          </LinkContainer>
        )}
        <LinkContainer to="/ArtistReviews">
          <ListItem>
            <Button>Reviews</Button>
          </ListItem>
        </LinkContainer>
      </List>
    );
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated
    };

    return (
      !this.state.isAuthenticating && (
        <div className="App container">
          <Navbar fluid collapseOnSelect style={{ whiteSpace: "nowrap" }}>
            <Navbar.Header>
              {this.state.isAuthenticated ? (
                <Navbar.Brand>
                  <IconButton onClick={this.handleDrawer}>
                    <MenuIcon />
                  </IconButton>
                </Navbar.Brand>
              ) : null}

              <Navbar.Brand>
                <Link to="/">
                  {
                    <img
                      src="https://i.imgur.com/5vIKxfR.png"
                      alt=""
                      height="32"
                      width="32"
                    />
                  }
                </Link>
              </Navbar.Brand>
              <Navbar.Toggle />
              <MuiThemeProvider>
                <text
                  className="title"
                  fontFamily="Covered By Your Grace"
                  variant="title"
                  color="primary"
                >
                  Share Yourself Artists
                </text>
                <br />
              </MuiThemeProvider>
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight>
                {this.state.isAuthenticated && this.state.role === "artist" ? (
                  <Fragment>
                    <NavItem>Credits: {this.state.credits}</NavItem>
                  </Fragment>
                ) : null}
                <Fragment>
                  <LinkContainer to="/Home">
                    <NavItem>Home</NavItem>
                  </LinkContainer>
                </Fragment>
                <Fragment>
                  <LinkContainer to="/AboutUs">
                    <NavItem>About Us</NavItem>
                  </LinkContainer>
                </Fragment>
                {this.state.isAuthenticated ? (
                  <Fragment>
                    <NavItem onClick={this.handleLogout}>Sign Out</NavItem>
                  </Fragment>
                ) : (
                  <Fragment>
                    <LinkContainer to="/SignIn">
                      <NavItem>Sign In</NavItem>
                    </LinkContainer>
                  </Fragment>
                )}
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Drawer
            anchor="left"
            open={this.state.clickedDrawer}
            onClick={this.handleDrawer}
            width="200"
          >
            {this.state.role === "artist"
              ? this.renderArtist()
              : this.state.role === "business"
              ? this.renderBusiness()
              : null}
          </Drawer>
          <Routes childProps={childProps} />
        </div>
      )
    );
  }
}

export default compose(withStyles(theme))(withRouter(App));
