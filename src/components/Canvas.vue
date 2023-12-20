<template>
<div>
    <canvas :width="canvasSize.x" :height="canvasSize.y"  ref="myCanvas" style="background-color: black; border:1px solid #000000;"></canvas>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { generateStarPositions, renderStarField } from '../helpers/createBackground';
import { Ship } from '../entitites/ship';
import { Vector2D } from '../interfaces';
import shipSvg from '../assets/gray-ship.svg';
import fireSvg from '../assets/blue-fire.svg';
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
const fireImage = new Image();
fireImage.src = fireSvg;
const stars = ref<Vector2D[]>([])

function updateBackgroundPosition(velocity: Vector2D, offset: Vector2D): Vector2D {
  const movementScaleFactor = .00001; 

  let newXOffset = offset.x! + (velocity.x || 0 / 100000000000) * movementScaleFactor;
  let newYOffset = offset.y! + (velocity.y || 0 / 100000000000) * movementScaleFactor;

  return { 
    x: (newXOffset + starBackgroundSize) % starBackgroundSize, 
    y: (newYOffset + starBackgroundSize) % starBackgroundSize 
  };
}




let animationFrameId: number;
// const starBackgroundCtx = createStarField(starBackgroundSize, starBackgroundSize, props.canvasSize.x);

const starBackgroundCtx = computed(() => {
  return renderStarField(props.canvasSize.x, props.canvasSize.y, stars.value, props.magnification,)
})
const scaleFactor = computed(() => {
  return 1 / Number(props.magnification);
})

const scaleBarCanvas = computed(() => {
  const offScreenCanvas = document.createElement('canvas');
  const ctx = offScreenCanvas.getContext('2d');
  offScreenCanvas.width = props.canvasSize.x; // Assuming canvasSize is a ref or reactive object
  offScreenCanvas.height = 30; // Height enough to fit scale bar

  const worldScaleBarLength = 100;
  const scaleFactor = 1 / Number(props.magnification);
  const canvasScaleBarLength = worldScaleBarLength * scaleFactor;

  const scaleBarX = 10;
  const scaleBarY = offScreenCanvas.height - 20;
  const scaleBarHeight = 10;
  ctx!.fillStyle = 'white';
  ctx!.fillRect(scaleBarX, scaleBarY, canvasScaleBarLength, scaleBarHeight);
  ctx!.font = '14px Arial';
  ctx!.fillText(`${worldScaleBarLength} units`, scaleBarX + canvasScaleBarLength + 5, scaleBarY + scaleBarHeight / 2 + 5);

  return offScreenCanvas;
});


const shipSize = computed(() => {
  const logBase = 2500; 

const logScaleFactor = 1 / (Math.log(props.magnification + logBase) / Math.log(logBase));

const shipWidthMultiplier = 0.2;
const shipHeightMultiplier = 0.2;
const shipWidth = shipImage.width * logScaleFactor * shipWidthMultiplier;
const shipHeight = shipImage.height * logScaleFactor * shipHeightMultiplier;
return { shipHeight, shipWidth };
})

const shipAndThrusterCtx = computed(() => {
  const offScreenCanvas = document.createElement('canvas');
  const ctx = offScreenCanvas.getContext('2d');
  const { shipHeight, shipWidth } = shipSize.value;

  offScreenCanvas.width = shipWidth;
  offScreenCanvas.height = shipHeight + (props.ship!.firingThruster ? shipHeight : 0);

  if (props.ship!.firingThruster && fireImage.complete) {
    ctx!.save();
    ctx!.translate(shipWidth / 2, shipHeight + shipHeight / 2); 
    ctx!.rotate(Math.PI); 
    ctx!.drawImage(fireImage, -shipWidth / 2, -shipHeight / 2, shipWidth, shipHeight);
    ctx!.restore();
  }

  if (shipImage.complete) {
    ctx!.drawImage(shipImage, 0, 0, shipWidth, shipHeight); 
  }

  return ctx;
});

function draw() {
  const canvas = myCanvas.value;
  const ctx = canvas?.getContext('2d');

  if (ctx && starBackgroundCtx) {
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);

    if (props.background) {
      const { x: bgX, y: bgY } = updateBackgroundPosition(props.ship?.velocity!, backgroundOffset.value);
      backgroundOffset.value.x = bgX!;
      backgroundOffset.value.y = bgY!;

      const tileWidth = starBackgroundCtx.value!.canvas.width;
      const tileHeight = starBackgroundCtx.value!.canvas.height;
      const adjustedTileWidth = tileWidth;
      const adjustedTileHeight = tileHeight;
      const startX = -(bgX! % adjustedTileWidth);
      const startY = -(bgY! % adjustedTileHeight);

      for (let x = startX - adjustedTileWidth; x < canvas!.width / Number(props.magnification) + adjustedTileWidth; x += adjustedTileWidth) {
        for (let y = startY - adjustedTileHeight; y < canvas!.height / Number(props.magnification) + adjustedTileHeight; y += adjustedTileHeight) {
          ctx.drawImage(starBackgroundCtx.value!.canvas, x, y, adjustedTileWidth, adjustedTileHeight);
        }
      }

      // const adjustedRadius = radius * props.magnification;
    }
    if (props.drawOtherObjects) {
      drawOtherObjects(ctx, props.otherObjects!, scaleFactor.value);
    }

    if (shipAndThrusterCtx.value) {
      ctx.save();
      ctx.translate(canvas!.width / 2, canvas!.height / 2);
      ctx.rotate(props.ship!.rotationAngle);
      ctx.drawImage(shipAndThrusterCtx.value.canvas, -shipSize.value.shipWidth / 2, -shipSize.value.shipHeight / 2);
      ctx.restore();
    }

    ctx.save();
    ctx.drawImage(scaleBarCanvas.value, 0, canvas!.height - scaleBarCanvas.value.height);
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
  stars.value = generateStarPositions(starBackgroundSize, props.canvasSize.y, props.canvasSize.x)
  animationFrameId = requestAnimationFrame(draw);

});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

