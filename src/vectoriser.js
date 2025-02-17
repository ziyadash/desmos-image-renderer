export function desmosVectoriserDriver() {
    const imgElement = new Image();
    imgElement.src = '/uploaded_src_image.png'; // Correct path

    imgElement.onload = function () {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Set canvas size after image loads
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;

        // Draw image onto canvas
        context.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

        // Process image with OpenCV
        processImage(canvas);

        // Convert processed image to PNG
        const outputCanvas = document.getElementById('canvasOutput');
        const dataURL = outputCanvas.toDataURL('image/png');

        // Send to backend for SVG conversion
        fetch('/convert-to-svg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataURL })
        })
        .then(response => response.json())
        .then(data => {
            const parsedData = data.parsed;
            console.log('Parsed SVG Path:', parsedData);
            loadCalculator(parsedData, canvas.height);
        })
        .catch(err => console.error('Error:', err));
    };

    imgElement.onerror = function () {
        console.error("Error loading uploaded image.");
    };
}


function processImage(srcCanvas) {
    const src = cv.imread(srcCanvas);
    const dst = new cv.Mat();
    cv.GaussianBlur(src, src, new cv.Size(9, 9), 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(src, dst, 80, 100, 3, false);
    cv.imshow('canvasOutput', dst);

    // Free OpenCV memory
    src.delete();
    dst.delete();
}

// Function to load and render equations into Desmos
function loadCalculator(data, canvasHeight) {
    // Dynamically create the calculator div
    const elt = document.createElement('div');
    elt.setAttribute('id', 'calculator');
    elt.style.width = '1200px';
    elt.style.height = '900px';
    document.getElementById('space').appendChild(elt);

    // Initialise the calculator
    const options = { keypad: false };
    const calculator = Desmos.GraphingCalculator(elt, options);

    // Load the equations into the calculator
    const eqns = parseFormattedSvgData(data, canvasHeight);
    let graphId = 1;
    for (let item of eqns) {
        if (graphId == 1800) {
            break;
        }
        // Parametric equation in the form "(X(t), Y(t))"
        const latexExpression = `(${item.eqn_x}, ${item.eqn_y})`;
        calculator.setExpression({ id: 'graph' + graphId, latex: latexExpression });
        graphId++;
        console.log('Line drawn!');
    }
}

// Parses SVG `d` attribute into a set of parametric equations
function parseFormattedSvgData(data, canvasHeight) {
    let currX = 0;
    let currY = 0;
    let latexEqns = []; // Stores parametric equations

    for (let item of data) {
        if (item.code === 'M') { // MoveTo
            currX = item.x;
            currY = canvasHeight - item.y; // Invert y-axis
        } else if (item.code === 'L') { // LineTo
            latexEqns.push(getLinearEqns(item, currX, currY, canvasHeight));
            currX = item.x;
            currY = canvasHeight - item.y; // Invert y-axis
        } else if (item.code === 'C') { // Cubic Bezier
            latexEqns.push(getCubicEqns(item, currX, currY, canvasHeight));
            currX = item.x;
            currY = canvasHeight - item.y; // Invert y-axis
        } else {
            console.log('Unhandled command:', item);
            break;
        }
        console.log('Item processed!');
    }

    return latexEqns;
}

// Convert linear segments into parametric equations
function getLinearEqns(frame, initX, initY, canvasHeight) {
    let p0X = initX;
    let p0Y = initY;
    let p1X = frame.x;
    let p1Y = canvasHeight - frame.y; // Invert y-axis

    // Parametric equations for x(t) and y(t)
    let eqn_x = `(1-t) * ${p0X} + t * ${p1X}`;
    let eqn_y = `(1-t) * ${p0Y} + t * ${p1Y}`;

    return { eqn_x, eqn_y };
}

// Convert cubic Bezier curves into parametric equations
function getCubicEqns(frame, initX, initY, canvasHeight) {
    let p0X = initX;
    let p0Y = initY;
    let p1X = frame.x1;
    let p1Y = canvasHeight - frame.y1;
    let p2X = frame.x2;
    let p2Y = canvasHeight - frame.y2;
    let p3X = frame.x;
    let p3Y = canvasHeight - frame.y;

    // Parametric equations for x(t) and y(t)
    let eqn_x = `(1-t)^3 * ${p0X} + 3*(1-t)^2*t * ${p1X} + 3*(1-t)*t^2 * ${p2X} + t^3 * ${p3X}`;
    let eqn_y = `(1-t)^3 * ${p0Y} + 3*(1-t)^2*t * ${p1Y} + 3*(1-t)*t^2 * ${p2Y} + t^3 * ${p3Y}`;

    return { eqn_x, eqn_y };
}
