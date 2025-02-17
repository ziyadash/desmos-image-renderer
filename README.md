# Desmos Image Renderer

## Overview
This program is a simple Desmos renderer that converts an image (in PNG format) into thousands of equations, allowing it to be displayed as a traced version on a Desmos graph. The program processes the image and generates a vectorized representation using Bezier curves.

## Installation and Setup

### Clone the Repository
```sh
git clone https://github.com/ziyadash/desmos-image-renderer.git
cd desmos-image-renderer/src
```

### Install Dependencies
```sh
npm install
```

### Run the Server
```sh
node server.js
```

Once the server is running, open the website in your browser.

## Usage Instructions
1. Upload an image using the frontend interface.
2. Click the **Desmos Vectorize** button.
3. The program will take 30 seconds or so to generate around 2000 equations to render the image in a Desmos graph

## Image processing explanation
The process of converting an image into Desmos-renderable equations involves several steps:
1. **Image Preprocessing:** The uploaded image is processed by applying Gaussian blurs to reduce noise.
2. **Edge Detection:** We use Canny edge detection to extract the outline of the image, rendering it in black and white.
3. **Vectorisation:** The processed image is fed into `potrace`, which converts the raster image into an SVG file.
4. **Bezier Curve Extraction:** We parse the SVG file to extract parametric Bezier curve equations.
5. **Equation Conversion:** The parametric equations are rewritten as pairs of Cartesian equations.
6. **LaTeX Formatting:** The equations are formatted into properly structured LaTeX expressions.
7. **Desmos Rendering:** Finally, the equations are fed into the Desmos Calculator API, which renders them on a graph.

## Example Output
Here is an example of an image rendered using the program:

![Alt text](./example_output.png)

## License
This project is licensed under the MIT License.
