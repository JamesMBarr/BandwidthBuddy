# BandwidthBuddy

An application for retrieving, storing and visualizing internet speeds. Born
from a frustration with an internet provided, I wanted an application to monitor
my local internet speeds.

The secondary purpose of this application was to explore Firebase. This has led
to an over engineered solution to the problem.

## Web Application

Check it out: https://internet-monitor-8c155.web.app/

[![Screen screenshot of
BuddywidthBuddy](./docs/imgs/screen-grab.png)](https://internet-monitor-8c155.web.app/)

## Technical Overview

The solution consists of three main parts:
- a device script which performs the speed test and uploads the results
- cloud functions and services which enrich the speed test results and stores
  the results in Firestore
- web application for displaying the data including live updates

For a more detail description have a look at the Sequence Flow Diagram below.

## Sequence Flow Diagram

![Sequence diagram of the application](./docs/imgs/seq.svg)

## Device Setup

- Install Node.js on target device like a RaspberryPi
- Install [Ookla Speedtest CLI](https://www.speedtest.net/apps/cli)
- Configure the environment variable file on the device
- Clone the device script
- Install node packages
- Run the script for the first time and complete the initial [AuthN
  workflow](https://developers.google.com/identity/protocols/oauth2/limited-input-device)
- Setup a cron job to run script periodically

## Development

### Local Development
Run firebase emulators by: `yarn firebase emulators:start`

Run local web application: `yarn dev`

### Deployment
Build the web application by running `yarn build` within the `app` directory.

Deploy everything by running: `yarn firebase deploy`

## TODOs
- Add functionality to device script to record no connection events
- Chart improvements
  - Match styling to the rest of the app
  - Reduce the number of time points
- Login:
  - Add anonymous login option with simulated data
  - Add federated login options
- Add docs to describe the device authN
- Make the device script more packageable
