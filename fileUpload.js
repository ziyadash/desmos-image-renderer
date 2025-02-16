let uploadedDataURL = "";

export function displayFile() {
    const input = document.getElementById("input");
    const file = input.files[0];

    if (!file) {
        alert("Please upload an image.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedDataURL = event.target.result; // Store image in memory (not localStorage)

        const canvas = document.getElementById("canvasInput");
        const context = canvas.getContext("2d");

        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);
        };
        img.src = uploadedDataURL;
    };

    reader.readAsDataURL(file);
}

export function uploadImage() {
    if (!uploadedDataURL) {
        alert("No image to upload. Please select an image first.");
        return;
    }

    fetch('/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadedDataURL }) // Send the stored image
    })
    .then(response => response.json())
    .then(data => console.log("Upload successful:", data))
    .catch(err => console.error("Upload failed:", err));
}
