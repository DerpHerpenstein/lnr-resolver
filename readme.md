
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">LNR Resolver</h3>
  <p align="center">
    A basic upgradeable LNR resolver
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

I built this project using truffle and ganache, it is based on a template I made
last year for creating NFT projects so there is some dangling code in here that
still needs to be cleaned up.



### Built With


* [Truffle](https://trufflesuite.com/index.html)
* [Ganache](https://trufflesuite.com/ganache/index.html)
* [web3.js](https://web3js.readthedocs.io/en/v1.7.1/)
* [Nodejs](https://nodejs.org/en/)


<!-- GETTING STARTED -->
## Getting Started

LETS GO!

### Prerequisites

Ensure you have Node.js and NPM installed.  I am using node v18.x

Use NPM to install some needed packages:

* Install Ganache
  ```sh
  npm install ganache -g
  ```
* Install Truffle
  ```sh
  npm install truffle -g

### Installation

Once Ganache and Truffle are installed

1. Navigate to where you want the repo to go
2. Clone the repo
   ```sh
   git clone https://github.com/DerpHerpenstein/lnr-resolver.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```


<!-- USAGE EXAMPLES -->
## Usage

Open 2 terminal windows in the root directory.

In the first terminal, launch ganache with a mnemonic so you get repeatable addresses:
   ```sh
   ganache -e 10000  -m "nice fetch insect exact south wheel stay pepper section piece tenant select" --fork
   ```

In the second terminal run:
   ```sh
   truffle test
   ```
It should succeed.



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


<!-- CONTACT -->
## Contact

Derp Herpenstein - [@0xDerpNation](https://twitter.com/0xDerpNation)
