<template>
<div>
    <canvas width="500" height="500"  ref="myCanvas" style="background-color: black; border:1px solid #000000;"></canvas>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { createStarField } from '../helpers/createBackground';
import { Ship } from '../entitites/ship';
import { Vector2D } from '../interfaces';
import shipSvg from '../assets/gray-ship.svg';
const props = defineProps({
  ship: Object as () => Ship,
  magnification: {
    type: Number,
    default: 1
  },
  shipRotation: {
    type: Number,
    default: 0
  },
  background: {
    default: false,
    type: Boolean,
  }
});

const myCanvas = ref<HTMLCanvasElement | null>(null);
const backgroundOffset = ref({ x: 0, y: 0 });
const starBackgroundSize = 1000;
const shipImage = new Image();
shipImage.src = shipSvg;

function updateBackgroundPosition(velocity: Vector2D, offset: Vector2D): Vector2D {
  let newXOffset = offset.x! + (velocity.x || 0);
  let newYOffset = offset.y! + (velocity.y || 0);

  return { 
    x: (newXOffset + starBackgroundSize) % starBackgroundSize, 
    y: (newYOffset + starBackgroundSize) % starBackgroundSize 
  };
}



let animationFrameId: number;
const starBackgroundCtx = createStarField(starBackgroundSize, starBackgroundSize, 500);

function draw() {
  const canvas = myCanvas.value;
  const ctx = canvas?.getContext('2d');

  if (ctx && starBackgroundCtx) {
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);

    ctx.save();
    ctx.scale(props.magnification, props.magnification);

    if (props.background) {

      const { x: bgX, y: bgY } = updateBackgroundPosition(props.ship?.velocity!, backgroundOffset.value);
      backgroundOffset.value.x = bgX!;
      backgroundOffset.value.y = bgY!;

      const tileWidth = starBackgroundCtx.canvas.width;
      const tileHeight = starBackgroundCtx.canvas.height;
      const adjustedTileWidth = tileWidth;
      const adjustedTileHeight = tileHeight;
      const startX = -(bgX! % adjustedTileWidth);
      const startY = -(bgY! % adjustedTileHeight);

      for (let x = startX - adjustedTileWidth; x < canvas!.width / props.magnification + adjustedTileWidth; x += adjustedTileWidth) {
        for (let y = startY - adjustedTileHeight; y < canvas!.height / props.magnification + adjustedTileHeight; y += adjustedTileHeight) {
          console.log('here');
          ctx.drawImage(starBackgroundCtx.canvas, x, y, adjustedTileWidth, adjustedTileHeight);
        }
      }

      // const adjustedRadius = radius * props.magnification;
    }

    const centerX = canvas!.width / 2;
      const centerY = canvas!.height / 2;
      const adjustedCenterX = centerX / props.magnification;
    const adjustedCenterY = centerY / props.magnification;
      
    if (shipImage.complete) { 
      const shipWidth = shipImage.width * props.magnification * .15; 
      const shipHeight = shipImage.height * props.magnification * .15;
      // ctx.drawImage(shipImage, adjustedCenterX - shipWidth / 2, adjustedCenterY - shipHeight / 2, shipWidth, shipHeight);

      ctx.translate(adjustedCenterX, adjustedCenterY); 
      ctx.rotate(props.ship!.rotationAngle); 
      ctx.drawImage(shipImage, -shipWidth / 2, -shipHeight / 2, shipWidth, shipHeight); 
      ctx.rotate(-props.ship!.rotationAngle); 
      ctx.translate(-centerX, -centerY); 
    }
    // ctx.beginPath();
    // ctx.arc(adjustedCenterX + 200, adjustedCenterY, 100 * props.magnification, 0, 2 * Math.PI, false);
    // ctx.fillStyle = 'green';
    ctx.fill();
    ctx.restore();
  }

  animationFrameId = requestAnimationFrame(draw);
}


onMounted(() => {
  animationFrameId = requestAnimationFrame(draw);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>
