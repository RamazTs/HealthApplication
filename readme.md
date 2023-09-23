<a name="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h3 align="center">Cross Platfrom Health Application</h3>

  <p align="center">
    A README document to help jumpstart the project
    <br />
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

The project is aimed at collecting data from Raynaud patients...

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

Application development is powered by React and React Native for building a cross-platform application.

- [![React][React.js]][React-url]
- [![REACT-NATIVE]][React-Native-URL]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

<!-- To run the application, first you need to set up the development environment for react native locally on your machine. Please follow the instruction on the official react native documentation page and install the react native CLI, Xcode and Android Studio

- [https://reactnative.dev/docs/environment-setup?os=macos&platform=android](https://reactnative.dev/docs/environment-setup?os=macos&platform=android) -->

First a development environment needs to be set up on Macbook for run the application on IOS.

1. install Homebrew from https://brew.sh/

2. after Homebrew is installed, if node and watchman is not installed on the machine run the commands in the terminal separately:

   brew install node
   brew install watchman

3. Install Xcode if not installed on the macbook. Installing Xcode will also install the iOS Simulator and all the necessary tools to build your iOS app.

if problems occur with any of the steps please visit the offcial documentation to receive more information on setting up the envrionment for react native - native application for ios on macbook: https://reactnative.dev/docs/environment-setup?os=macos&platform=ios

### Installation

_To set up the app on your local machine your app. This application doesn't rely on any external services. Followi the instruction listed below._

1. Clone the repository

   ```sh
   git clone https://github.com/RamazTs/HealthApplication.git
   ```

   or
   donwload the zip file with the code from https://github.com/RamazTs/HealthApplication

2. Install NPM packages

   cd into the code repository and run "npm insall" in the terminal in the root of the project directory

3. Install pods.

   in the root of the project directory run command "cd ios && pod install"

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

To start the application development run

```sh
npm run start
```

This will start the Metro bundler and enable development on IOS/Android simulators. Follow the prompts on the screen and choose the corresponding simulator. Xcode automatically brings up the simulator. Android studio needs to start the mobile simulator first, then the metro bundler will be able to find the android sim and run the application.

To install the development version of the application on an IOS device

1. Enable developer mode on the IOS phone

Running your app on the device requires that you enable Developer Mode. On an iOS device, open Settings > Privacy & Security, scroll down to the Developer Mode list item and navigate into it.
More info: https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device

2. Open Xcode, the application installed in the prerequisites section.

Once xcode is open, press "open a project or file" and find the HealthApplication directory, inside the project open ios/HealthApplication.xcworkspace

3. Connect the IOS phone to the computer

4. Choose your Phone as a build target in Xcode

You can choose the simulators and phones as targets in the middle top bar.

5. Build the application on you local phone

Press the play button on the left of the middle top bar and wait for the application to be build on the phone.

6. Trust developer

To open the application on your device, Navigate to Settings > General > Device Management on IOS device Select the developer under the “ENTERPRISE APPS” section. Press “Trust [Developer Name]“. Select “Trust“.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

...

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

...

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

...

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- IMAGES -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[React-Native]: https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[React-Native-url]: https://reactnative.dev/
