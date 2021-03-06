import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import CardMedia from "./CardMedia";
import { Auth } from "aws-amplify";
import Axios from "axios";
import { LinkContainer } from "react-router-bootstrap";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { getArtAction } from "../actions/getArtAction";
import { dashBoardImageAction } from "../actions/dashBoardImageAction";

/*
 * Dashboard is the name for the artist dashboard. This component holds all
 * of the artist's uploaded art work in a card.
 */
class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mySub: ""
    };
  }

  /*
   * componentDidMount gets the artist information from the URL.
   */
  async componentDidMount() {
    try {
      // Gets the user sub from cognito.
      await Auth.currentAuthenticatedUser().then(user => {
        this.setState({ mySub: user.attributes.sub });
      });

      // Gets the image array using Axios and stores it in redux using getImages
      await Axios.get(
        "https://70tcdlzobd.execute-api.us-east-1.amazonaws.com/prod/user-images?key=" +
          this.state.mySub
      )
        .then(result => this.props.getImages(result.data.Items))
        .catch(err => console.log(err));
    } catch (e) {
      alert(e);
    }
  }

  /*
  //Render displays dashboard, if no images uploaded shows the no art uploaded page
  */
  render() {
    return (
      <div>
        <Grid container justify = "space-evenly" spacing={16}>
          {this.props.images.length === 0 ? (
            <div>
              <h1>No Art Uploaded Yet!</h1>
              <div>Upload Art by pressing the button below!</div>
              <LinkContainer to = "/UploadPage">
                <Button>Upload Art</Button>
              </LinkContainer>
            </div>
          ) : (
            this.props.images.map(imageInfo => (
              <Grid key={imageInfo.sourceKey} item>
                <CardMedia
                  date = {imageInfo.date}
                  sourceKey = {imageInfo.sourceKey}
                  artistName = {imageInfo.artistName}
                  artTitle = {imageInfo.artTitle}
                  url = {imageInfo.url}
                  descript = {imageInfo.description}
                  userSub = {imageInfo.userSub}
                />
              </Grid>
            ))
          )}
        </Grid>
      </div>
    );
  }
}

// Maps the current state to props using redux
const mapStateToProps = state => ({
  images: state.dashBoardReducer.images
});

//Redux function
const mapDispatchToProps = {
  getArt: getArtAction,
  getImages: dashBoardImageAction
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
