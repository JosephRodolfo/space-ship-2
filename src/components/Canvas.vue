<template>
<div>
    <canvas :width="canvasSize.x" :height="canvasSize.y"  ref="myCanvas" style="background-color: black; border:1px solid #000000;"></canvas>
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
  },
  canvasSize: {
    default: { x: 500, y: 500 },
    type: Object,
  },
  otherObjects: {
    default: () => [],
    type: Array as () => Ship[],
  },
  drawOtherObjects: {
    default: true,
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
const starBackgroundCtx = createStarField(starBackgroundSize, starBackgroundSize, props.canvasSize.x);

function draw() {
  const canvas = myCanvas.value;
  const ctx = canvas?.getContext('2d');

  if (ctx && starBackgroundCtx) {
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);

    const scaleFactor = 1 / props.magnification; 


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
          ctx.drawImage(starBackgroundCtx.canvas, x, y, adjustedTileWidth, adjustedTileHeight);
        }
      }

      // const adjustedRadius = radius * props.magnification;
    }
    if (props.drawOtherObjects) {
      drawOtherObjects(ctx, props.otherObjects!, scaleFactor);
    }

    if (shipImage.complete) { 
      const shipWidth = shipImage.width * scaleFactor * .15 + 10;
      const shipHeight = shipImage.height * scaleFactor * .15 + 10; 

      ctx.translate(canvas!.width / 2, canvas!.height / 2);
      ctx.rotate(props.ship!.rotationAngle); 
      ctx.drawImage(shipImage, -shipWidth / 2, -shipHeight / 2, shipWidth, shipHeight); 
      ctx.rotate(-props.ship!.rotationAngle); 
      ctx.translate(-canvas!.width / 2, -canvas!.height / 2);
    }

    ctx.restore();
  }

  animationFrameId = requestAnimationFrame(draw);
}



function drawOtherObjects(ctx: CanvasRenderingContext2D, otherObjects: Array<Ship>, scaleFactor: number) {
  otherObjects.forEach((obj) => {
    const canvasCenterX = props.canvasSize.x / 2;
    const canvasCenterY = props.canvasSize.y / 2;
    const relativeObjX = ((obj.position.x! - props.ship!.position.x!) * scaleFactor) + canvasCenterX;
    const relativeObjY = ((obj.position.y! - props.ship!.position.y!) * scaleFactor) + canvasCenterY;

    const adjustedRadius = obj.radius * scaleFactor;

    ctx.beginPath();
    ctx.arc(relativeObjX, relativeObjY, adjustedRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  });
}





onMounted(() => {
  animationFrameId = requestAnimationFrame(draw);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

