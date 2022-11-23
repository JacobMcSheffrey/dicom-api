# Dicom API

### Description

A simple DICOM microservice for storing an uploaded DICOM file to local filesystem, and returning any DICOM header attribute based on a specified DICOM Tag.

### Prerequisites
- Node
- NPM

## Installation

##### Clone the repository

    git clone https://github.com/JacobMcSheffrey/dicom-api.git

##### From the root of the project install dependencies

    npm install

### Running Locally

- Start the server: `npm run start`
- For server API integration testing the default url is http://localhost:3000


### Usage Guide

- To upload a file POST `http://localhost:3000/dicom`

- To search for a header attribute GET `http://localhost:3000/dicom/{fileName}/attribute?tag=xGGGGEEEE`
where G = group number and E = element number