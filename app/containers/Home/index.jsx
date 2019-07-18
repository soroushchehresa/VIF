// @flow

import React, { Component } from 'react';
import fs from 'fs';
import base64ImageToFile from 'base64image-to-file';
import CircularProgressbar from 'react-circular-progressbar';
import getDimensions from 'get-video-dimensions';
import { getVideoDurationInSeconds } from 'get-video-duration';
import gifshot from 'gifshot';
import path from 'path';
import styles from './styles.scss';

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeDropZone: false,
      captureProgress: null,
      saving: false
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
    const { activeDropZone, saving } = this.state;
    if (activeDropZone) {
      this.setState({ activeDropZone: false });
    }
    const filePath = e.dataTransfer.files[0].path;
    const outputPath = path.join(filePath.split('/')
      .reverse()
      .slice(1)
      .reverse()
      .join('/'));
    getDimensions(filePath)
      .then(({ width, height }) => {
        const streamFile = fs.createReadStream(filePath);
        getVideoDurationInSeconds(streamFile)
          .then(videoDuration => {
            gifshot.createGIF(
              {
                gifWidth: width,
                gifHeight: height,
                video: filePath,
                numFrames: ((Math.round(videoDuration) * 1000) / 100) - (Math.round(videoDuration) * 2),
                progressCallback: captureProgress => {
                  this.setState({ captureProgress });
                  if (captureProgress === 1) {
                    this.setState({ captureProgress: null });
                  }
                  if (!saving) {
                    this.setState({ saving: true });
                  }
                }
              },
              obj => {
                if (!obj.error) {
                  let outputFileName = '';
                  if (fs.existsSync(`${filePath}.gif`)) {
                    outputFileName = `${filePath.split('/')
                      .splice(-1, 1)[0]}-${Math.floor(Math.random() * 899999 + 100000)}`;
                  } else {
                    outputFileName = `${filePath.split('/')
                      .splice(-1, 1)[0]}`;
                  }
                  base64ImageToFile(
                    obj.image,
                    outputPath,
                    outputFileName,
                    () => {
                      this.setState({ saving: false });
                    }
                  );
                }
              }
            );
            return true;
          })
          .catch(error => {
            console.log(error);
          });
        return true;
      })
      .catch(error => {
        console.log(error);
      });
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
    const { activeDropZone, captureProgress, saving } = this.state;
    return (
      <div
        onDragOver={this.ondragover}
        onDrop={this.ondrop}
        onDragLeave={this.ondragleave}
        className={styles.container}
        style={{ border: activeDropZone ? '5px solid #2f7cf6' : 'none' }}
      >
        {
          captureProgress &&
          <div className={styles.progressbarWrapper}>
            <CircularProgressbar
              percentage={Math.round(captureProgress * 100 * 10) / 10}
              text={`${Math.round(captureProgress * 100 * 10) / 10}%`}
              strokeWidth={2.5}
              styles={{
                text: {
                  fill: '#2f7cf6',
                  dominantBaseline: 'middle',
                  textAnchor: 'middle',
                  fontSize: 18
                },
                path: {
                  stroke: '#2f7cf6'
                },
                trail: {
                  stroke: 'transparent'
                }
              }}
            />
          </div>
        }
        {saving && !captureProgress && <p className={styles.centerText}>Saving...</p>}
        {!saving && <p className={styles.centerText}>Drop a Video to Convert to GIF</p>}
      </div>
    );
  }
}
