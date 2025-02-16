import { displayFile, uploadImage } from './fileUpload.js';
import { desmosVectoriserDriver } from './vectoriser.js';

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("input").addEventListener("change", displayFile);
    document.getElementById("input").addEventListener("change", uploadImage);
    document.getElementById("desmos-vectoriser").addEventListener("click", desmosVectoriserDriver);
});
