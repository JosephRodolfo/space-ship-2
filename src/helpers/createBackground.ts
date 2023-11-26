
const offScreenCanvas = document.createElement('canvas');
offScreenCanvas.width = 1000; 
offScreenCanvas.height = 1000;


export function createStarField(width: number, height: number, numberOfStars = 100) {
    const offScreenCanvas = document.createElement('canvas');
    const ctx = offScreenCanvas.getContext('2d');
    offScreenCanvas.width = width;
    offScreenCanvas.height = height;
  
    ctx!.fillStyle = 'black';
    ctx!.fillRect(0, 0, width, height);
  
    function generateStars(ctx: CanvasRenderingContext2D, stars: number) {
      ctx.fillStyle = 'white';
      for (let i = 0; i < stars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  
    generateStars(ctx!, numberOfStars);
  
    return ctx;
  }
  