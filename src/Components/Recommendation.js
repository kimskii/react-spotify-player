import React from 'react';
import { connect } from 'react-redux';
import Script from 'react-async-script-loader';
import hash from '../hash';

class DisconnectedRecommendation extends React.Component {
  // $.ajax({
  //   url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
  //   type: "PUT",
  //   data: '{"uris": ["spotify:track:5ya2gsaIhTkAuWYEMB0nw5"]}',
  //   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
  //   success: function(data) {
  //     console.log(data)
  //   }
  //  });

  constructor(props) {
    super(props);
    this.handleLoadSuccess = this.handleLoadSuccess.bind(this);
    this.handleLoadFailure = this.handleLoadSuccess.bind(this);
    this.cb = this.cb.bind(this);
  }

  componentDidMount() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.handleLoadSuccess();
    };
  }
  handleLoadSuccess() {
    this.setState({ scriptLoaded: true });
    console.log('Script loaded');
    const token = hash.access_token;
    const player = new window.Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => {
        cb(token);
      },
    });
    console.log(player);

    // Error handling
    player.addListener('initialization_error', ({ message }) => {
      console.error(message);
    });
    player.addListener('authentication_error', ({ message }) => {
      console.error(message);
    });
    player.addListener('account_error', ({ message }) => {
      console.error(message);
    });
    player.addListener('playback_error', ({ message }) => {
      console.error(message);
    });

    // Playback status updates
    player.addListener('player_state_changed', state => {
      console.log(state);
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);

      const play = ({
        spotify_uri,
        playerInstance: {
          _options: { getOAuthToken, id },
        },
      }) => {
        getOAuthToken(access_token => {
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [spotify_uri] }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${access_token}`,
            },
          });
        });
      };

      play({
        playerInstance: player,
        spotify_uri: 'spotify:track:7xGfFoTpQ2E7fRF5lN10tr',
      });
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();
  }

  cb(token) {
    return token;
  }

  handleScriptCreate() {
    this.setState({ scriptLoaded: false });
    console.log('Script created');
  }

  handleScriptError() {
    this.setState({ scriptError: true });
    console.log('Script error');
  }

  handleScriptLoad() {
    this.setState({ scriptLoaded: true });
    console.log('Script loaded');
  }

  render() {
    const recommendation = this.props.recommendation || [];

    console.log(this.props);
    return (
      <div className="playlist">
        <Script
          url="https://sdk.scdn.co/spotify-player.js"
          onCreate={this.handleScriptCreate.bind(this)}
          onError={this.handleScriptError.bind(this)}
          onLoad={this.handleScriptLoad.bind(this)}
        />
        <tbody>
          <tr className="playlist-header">
            <td>Song</td>
            <td>Artist</td>
            <td>Album</td>
          </tr>
          {recommendation.map(track => (
            <tr key={track.name} className="song-list">
              <td>
                <a href={track.external_urls.spotify}>{track.name}</a>
              </td>
              <td>{track.artists[0].name}</td>
              <td>{track.album.name}</td>
            </tr>
          ))}
        </tbody>
        {/* <div className="ending">
          <Typed strings={['Enjoy the playlist!']} typeSpeed={40} />
        </div> */}
        <a
          id="login-spotify"
          className="btn btn--login"
          href="http://localhost:3000/#/"
        >
          Play Again
        </a>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    recommendation: state.recommendation,
  };
};

export default connect(
  mapStateToProps,
  null
)(DisconnectedRecommendation);
