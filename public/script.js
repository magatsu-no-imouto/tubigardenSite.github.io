<script>
    // Get the image container element
    const imageContainer = document.getElementById('image-container');
    
    // Add an event listener for mouse drag
    let isDragging = false;
    let startX;
    let scrollLeft;
    
    imageContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - imageContainer.offsetLeft;
        scrollLeft = imageContainer.scrollLeft;
    });
    
    imageContainer.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    imageContainer.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    imageContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - imageContainer.offsetLeft;
        const walk = (x - startX) * 2; // Adjust the speed of dragging
        imageContainer.scrollLeft = scrollLeft - walk;
    });
</script>