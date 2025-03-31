const canvas = document.querySelector("#drawing-area");
      const ctx = canvas.getContext("2d");

      let drawing = false;
      let currentTool = "pencil"; // Default tool
      let currentColor = "rgb(0, 0, 0)"; // Default black
      let startX, startY;
      let savedCanvasState = null; // To store canvas state before drawing shapes

      ctx.lineWidth = 1; // Default line width

      // Drawing functions
      function eraseOnCanvas(currentX, currentY) {
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(currentX - 10, currentY - 10, 20, 20);
      }

      function drawOnCanvas(startX, startY, currentX, currentY) {
        ctx.strokeStyle = currentColor;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      function drawRectangle(startX, startY, currentX, currentY) {
        ctx.strokeStyle = currentColor;
        ctx.beginPath();
        ctx.rect(startX, startY, currentX - startX, currentY - startY);
        ctx.stroke();
      }

      function drawCircle(startX, startY, currentX, currentY) {
        ctx.strokeStyle = currentColor;
        ctx.beginPath();
        const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      function drawBrush(startX, startY, currentX, currentY) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      // Canvas event listeners
      canvas.addEventListener("mousedown", (e) => {
        startX = e.offsetX;
        startY = e.offsetY;
        drawing = true;

        // Save the current canvas state before drawing shapes
        if (currentTool === "rectangle" || currentTool === "circle") {
          savedCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      });

      canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;

        const currentX = e.offsetX;
        const currentY = e.offsetY;

        if (currentTool === "eraser") {
          eraseOnCanvas(currentX, currentY);
          saveCanvasState();
        } else if (currentTool === "pencil") {
          drawOnCanvas(startX, startY, currentX, currentY);
          startX = currentX;
          startY = currentY;
          saveCanvasState();
        } else if (currentTool === "brush") {
          drawBrush(startX, startY, currentX, currentY);
          startX = currentX;
          startY = currentY;
          saveCanvasState();
        }
      });

      canvas.addEventListener("mouseup", (e) => {
        if (!drawing) return;

        const currentX = e.offsetX;
        const currentY = e.offsetY;

        if (currentTool === "rectangle") {
          ctx.putImageData(savedCanvasState, 0, 0); // Restore previous state
          drawRectangle(startX, startY, currentX, currentY);
          saveCanvasState();
        } else if (currentTool === "circle") {
          ctx.putImageData(savedCanvasState, 0, 0); // Restore previous state
          drawCircle(startX, startY, currentX, currentY);
          saveCanvasState();
        }

        drawing = false;
      });

      // Tool selection
      function selectTool(tool) {
        currentTool = tool;
        ctx.lineWidth = (tool === "brush") ? 5 : 1; // Thicker line for brush
      }

      function selectColor(color) {
        currentColor = color;
        ctx.strokeStyle = color;
      }

      function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveCanvasState(); // Save cleared state
      }

      // LocalStorage with expiration
      function saveCanvasState() {
        const canvasData = canvas.toDataURL();
        const timestamp = Date.now();
        const expirationTime = 2 * 60 * 1000; // 5 minutes in milliseconds

        const data = {
          canvasData: canvasData,
          timestamp: timestamp,
          expiresIn: expirationTime
        };

        localStorage.setItem("canvasState", JSON.stringify(data));
      }

      function loadCanvasState() {
        const storedData = localStorage.getItem("canvasState");
        if (storedData) {
          const data = JSON.parse(storedData);
          const currentTime = Date.now();

          // Check if the data has expired
          if (currentTime - data.timestamp > data.expiresIn) {
            localStorage.removeItem("canvasState"); // Remove expired data
            return;
          }

          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = data.canvasData;
        }
      }

      // Load canvas state on page load
      window.onload = () => {
        loadCanvasState();
      };