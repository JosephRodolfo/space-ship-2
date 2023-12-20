import { Vector2D } from "../interfaces";

const offScreenCanvas = document.createElement('canvas');
offScreenCanvas.width = 1000; 
offScreenCanvas.height = 1000;

export function renderStarField(width: number, height: number, stars: Vector2D[], magnification: number) {
  const offScreenCanvas = document.createElement('canvas');
  offScreenCanvas.width = width;
  offScreenCanvas.height = height;
  const ctx = offScreenCanvas.getContext('2d');

  ctx!.fillStyle = 'black';
  ctx!.fillRect(0, 0, width, height);

  ctx!.fillStyle = 'white';
  const minScalingFactor = Math.log10(25) * 1.1;
  const positionScalingFactor = Math.max(Math.log10(1 + magnification) * 1.1, minScalingFactor);

  stars.forEach(star => {
    const scaledX = star.x! * positionScalingFactor;
    const scaledY = star.y! * positionScalingFactor;
    ctx!.beginPath();
    ctx!.arc(scaledX, scaledY, 1, 0, Math.PI * 2);
    ctx!.fill();
  });

  return ctx;
}



export function generateStarPositions(numberOfStars: number, width: number, height: number) {
  const stars = [];
  for (let i = 0; i < numberOfStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height
    });
  }
  return stars;
}


  