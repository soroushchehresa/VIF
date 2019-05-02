// @flow

import React, { Component, Fragment } from 'react';
import base64ImageToFile from 'base64image-to-file';
import gifshot from 'gifshot';
import path from 'path';
import styles from './Home.css';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeDropZone: false,
      captureProgress: null
    };
  }

  ondragover = e => {
    const { activeDropZone } = this.state;
    if (e.dataTransfer.items.length === 1) {
      e.preventDefault();
      if (!activeDropZone) {
        this.setState({ activeDropZone: true });
      }
    }
    return false;
  };

  ondrop = e => {
    e.preventDefault();
    const { activeDropZone } = this.state;
    if (activeDropZone) {
      this.setState({ activeDropZone: false });
    }
    const filePath = e.dataTransfer.files[0].path;
    const output = path.join(
      filePath
        .split('/')
        .reverse()
        .slice(1)
        .reverse()
        .join('/')
    );
    gifshot.createGIF(
      {
        gifWidth: 300,
        gifHeight: 300,
        video: filePath,
        interval: 0.1,
        numFrames: 20,
        frameDuration: 2,
        text: 'oooow',
        fontWeight: 'bold',
        fontSize: '30px',
        fontFamily: 'Arial',
        fontColor: '#ffffff',
        textAlign: 'center',
        textBaseline: 'bottom',
        sampleInterval: 20,
        numWorkers: 10,
        progressCallback: captureProgress => {
          this.setState({ captureProgress });
          if (captureProgress === 1) {
            this.setState({ captureProgress: null });
          }
        }
      },
      obj => {
        if (!obj.error) {
          base64ImageToFile(
            obj.image,
            output,
            filePath.split('/').splice(-1, 1),
            () => {
              alert('Done!');
            }
          );
        }
      }
    );
  };

  ondragleave = e => {
    e.preventDefault();
    const { activeDropZone } = this.state;
    if (activeDropZone) {
      this.setState({ activeDropZone: false });
    }
    return false;
  };

  render() {
    const { activeDropZone, captureProgress } = this.state;
    return (
      <div
        onDragOver={this.ondragover}
        onDrop={this.ondrop}
        onDragLeave={this.ondragleave}
        className={styles.container}
        style={{ background: activeDropZone ? 'blue' : 'transparent' }}
      >
        {!captureProgress && <p>Drop a Video to Convert to GIF</p>}
        {captureProgress && (
          <Fragment>
            <p>Converting...</p>
            <p>{Math.round(captureProgress * 100 * 10) / 10}%</p>
          </Fragment>
        )}
      </div>
    );
  }
}
