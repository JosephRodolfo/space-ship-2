<template>
  <div>
    <canvas
      :width="canvasSize.x"
      :height="canvasSize.y"
      ref="myCanvas"
      style="background-color: black; border: 1px solid #000000"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import {
  generateStarPositions,
  renderStarField,
} from "../helpers/createBackground";
import { Ship } from "../entitites/ship";
import { Vector2D } from "../interfaces";
import shipSvg from "../assets/gray-ship.svg";
import fireSvg from "../assets/blue-fire.svg";
import { Planet } from "../entitites/planet";
import { useMainStore } from "../store/store"; 

const props = defineProps({
  ship: Object as () => Ship,
  magnification: {
    type: Number,
    default: 1,
  },
  shipRotation: {
    type: Number,
    default: 0,
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
    type: Array as () => Planet[],
  },
  drawOtherObjects: {
    default: true,
    type: Boolean,
  },
  canvasCenterOffset: {
    default: { x: 0, y: 0 },
    type: Object as () => Vector2D,
  },
});

const myCanvas = ref<HTMLCanvasElement | null>(null);
const backgroundOffset = ref({ x: 0, y: 0 });
const starBackgroundSize = 1000;
const shipImage = new Image();
const fireImage = new Image();
const stars = ref<Vector2D[]>([]);
const shipImageLoaded = ref(false);
const fireImageLoaded = ref(false);

const store = useMainStore();
const computedTrajectoryData = computed(() => {
  return store.trajectoryData;
});



function updateBackgroundPosition(
  velocity: Vector2D,
  offset: Vector2D
): Vector2D {
  const movementScaleFactor = 0.00001;

  let newXOffset =
    offset.x! + (velocity.x || 0 / 100000000000) * movementScaleFactor;
  let newYOffset =
    offset.y! + (velocity.y || 0 / 100000000000) * movementScaleFactor;

  return {
    x: (newXOffset + starBackgroundSize) % starBackgroundSize,
    y: (newYOffset + starBackgroundSize) % starBackgroundSize,
  };
}

let animationFrameId: number;

const starBackgroundCtx = computed(() => {
  return renderStarField(
    props.canvasSize.x,
    props.canvasSize.y,
    stars.value,
    props.magnification
  );
});
const scaleFactor = computed(() => {
  return 1 / Number(props.magnification);
});

const scaleBarCanvas = computed(() => {
  const offScreenCanvas = document.createElement("canvas");
  const ctx = offScreenCanvas.getContext("2d");
  offScreenCanvas.width = props.canvasSize.x;
  offScreenCanvas.height = 30;

  const worldScaleBarLength = 100;
  const scaleFactor = 1 / Number(props.magnification);
  const canvasScaleBarLength = worldScaleBarLength * scaleFactor;

  const scaleBarX = 10;
  const scaleBarY = offScreenCanvas.height - 20;
  const scaleBarHeight = 10;
  ctx!.fillStyle = "white";
  ctx!.fillRect(scaleBarX, scaleBarY, canvasScaleBarLength, scaleBarHeight);
  ctx!.font = "14px Arial";
  ctx!.fillText(
    `${worldScaleBarLength} units`,
    scaleBarX + canvasScaleBarLength + 5,
    scaleBarY + scaleBarHeight / 2 + 5
  );

  return offScreenCanvas;
});

const shipSize = computed(() => {
  const logBase = 2500;

  const logScaleFactor =
    1 / (Math.log(props.magnification + logBase) / Math.log(logBase));

  const shipWidthMultiplier = 0.2;
  const shipHeightMultiplier = 0.2;
  const shipWidth = shipImage.width * logScaleFactor * shipWidthMultiplier;
  const shipHeight = shipImage.height * logScaleFactor * shipHeightMultiplier;
  return { shipHeight, shipWidth };
});

const shipAndThrusterCtx = computed(() => {
  const offScreenCanvas = document.createElement("canvas");
  const ctx = offScreenCanvas.getContext("2d");
  const { shipHeight, shipWidth } = shipSize.value;

  offScreenCanvas.width = shipWidth;
  offScreenCanvas.height =
    shipHeight + (props.ship!.firingThruster ? shipHeight : 0);
  if (
    (fireImageLoaded.value, props.ship!.firingThruster && fireImage.complete)
  ) {
    ctx!.save();
    ctx!.translate(shipWidth / 2, shipHeight + shipHeight / 2);
    ctx!.rotate(Math.PI);
    ctx!.drawImage(
      fireImage,
      -shipWidth / 2,
      -shipHeight / 2,
      shipWidth,
      shipHeight
    );
    ctx!.restore();
  }

  if (shipImageLoaded.value && shipImage.complete) {
    ctx!.drawImage(shipImage, 0, 0, shipWidth, shipHeight);
  }

  return ctx;
});
// const currentReferenceBody = computed(() => {
//   return store.initialState.otherBodies.find((el) => el.name === store.referenceBody);

// });
// const trajectoryCtx = computed(() => {
//   console.log('recomputing trajectory image');
//   const offScreenCanvas = document.createElement("canvas");
//   offScreenCanvas.width = props.canvasSize.x; 
//   offScreenCanvas.height = props.canvasSize.y; 
//   const ctx = offScreenCanvas.getContext("2d");
//   if (!ctx) return null;

//   ctx.beginPath();
//   ctx.strokeStyle = "white";

//   computedTrajectoryData.value.forEach((point, index) => {
//     const canvasCenterX = props.canvasSize.x / 2 + props.canvasCenterOffset.x!;
//     const canvasCenterY = props.canvasSize.y / 2 + props.canvasCenterOffset.y!;

//     const relativeObjX =
//       (point.x! - props.ship!.position.x!) * scaleFactor.value + canvasCenterX!;
//     const relativeObjY =
//       (point.y! - props.ship!.position.y!) * scaleFactor.value + canvasCenterY!;

//     if (index === 0) {
//       ctx.moveTo(relativeObjX, relativeObjY);
//     } else {
//       ctx.lineTo(relativeObjX, relativeObjY);
//     }
//     ctx.stroke();

//     ctx.save(); 
//     ctx.beginPath();
//     ctx.arc(relativeObjX, relativeObjY, 2 * 0.5, 0, 2 * Math.PI); 
//     ctx.fillStyle = "white";
//     ctx.fill(); 
//     ctx.restore();
//   });

//   ctx.stroke(); 

//   return ctx;
// });

const trajectoryCtx = computed(() => {
  const offScreenCanvas = document.createElement("canvas");
  
  offScreenCanvas.width = props.canvasSize.x * 10; 
  offScreenCanvas.height = props.canvasSize.y * 10; 
  const ctx = offScreenCanvas.getContext("2d");
  if (!ctx) return null;

  ctx.beginPath();
  ctx.strokeStyle = "white";

  computedTrajectoryData.value.forEach((point, index) => {
    const origin = computedTrajectoryData.value[0];
    const relativeObjX = (point.x! - origin.x!) * scaleFactor.value + offScreenCanvas.width / 2;
    const relativeObjY = (point.y! - origin.y!) * scaleFactor.value + offScreenCanvas.height / 2;

    if (index === 0) {
      ctx.moveTo(relativeObjX, relativeObjY);
    } else {
      ctx.lineTo(relativeObjX, relativeObjY);
    }
  });

  ctx.stroke();
  return ctx;
});
// const trajectoryCtx = computed(() => {
//   const offScreenCanvas = document.createElement("canvas");
//   offScreenCanvas.width = props.canvasSize.x; 
//   offScreenCanvas.height = props.canvasSize.y; 
//   const ctx = offScreenCanvas.getContext("2d");
//   if (!ctx) return null;

//   ctx.beginPath();
//   computedTrajectoryData.value.forEach((point, index) => {
//     const canvasCenterX = props.canvasSize.x / 2;
//     const canvasCenterY = props.canvasSize.y / 2;
//     const referenceBodyX = currentReferenceBody.value ? currentReferenceBody.value.position.x : 0;
//     const referenceBodyY = currentReferenceBody.value ? currentReferenceBody.value.position.y : 0;

//     const relativeObjX =
//       (point.x! - referenceBodyX! - props.ship!.position.x!) * scaleFactor.value + canvasCenterX;
//     const relativeObjY =
//       (point.y! - referenceBodyY! - props.ship!.position.y!) * scaleFactor.value + canvasCenterY;

//     if (index === 0) {
//       ctx.moveTo(relativeObjX, relativeObjY);
//     } else {
//       ctx.lineTo(relativeObjX, relativeObjY);
//     }
//   });

//   ctx.strokeStyle = "white";
//   ctx.stroke();

//   return ctx;});
const passedTrajectoryEnd = ref(false);
watch(computedTrajectoryData, () => {
  passedTrajectoryEnd.value = true;
})


function draw() {
  const canvas = myCanvas.value;
  const ctx = canvas?.getContext("2d");

  if (ctx) {
    const canvasCenterX = props.canvasSize.x / 2 + props.canvasCenterOffset.x!;
    const canvasCenterY = props.canvasSize.y / 2 + props.canvasCenterOffset.y!;
  

  if (ctx && starBackgroundCtx) {
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);

    if (props.background) {
      const { x: bgX, y: bgY } = updateBackgroundPosition(
        !store.pause ? props.ship?.velocity! : { x: 0, y: 0},
        backgroundOffset.value
      );
      backgroundOffset.value.x = bgX!;
      backgroundOffset.value.y = bgY!;

      const tileWidth = starBackgroundCtx.value!.canvas.width;
      const tileHeight = starBackgroundCtx.value!.canvas.height;
      const adjustedTileWidth = tileWidth;
      const adjustedTileHeight = tileHeight;
      const startX = -(bgX! % adjustedTileWidth);
      const startY = -(bgY! % adjustedTileHeight);

      for (
        let x = startX - adjustedTileWidth;
        x < canvas!.width / Number(props.magnification) + adjustedTileWidth;
        x += adjustedTileWidth
      ) {
        for (
          let y = startY - adjustedTileHeight;
          y < canvas!.height / Number(props.magnification) + adjustedTileHeight;
          y += adjustedTileHeight
        ) {
          ctx.drawImage(
            starBackgroundCtx.value!.canvas,
            x,
            y,
            adjustedTileWidth,
            adjustedTileHeight
          );
        }
      }

    }
    if (props.drawOtherObjects) {
      drawOtherObjects(ctx, props.otherObjects!, scaleFactor.value, 10, { x: canvasCenterX, y: canvasCenterY });
    }

    if (shipAndThrusterCtx.value) {
      ctx.save();
      ctx.translate(canvasCenterX, canvasCenterY); 
      ctx.rotate(props.ship!.rotationAngle);
      ctx.drawImage(
        shipAndThrusterCtx.value.canvas,
        -shipSize.value.shipWidth / 2,
        -shipSize.value.shipHeight / 2
      );
      ctx.restore();
    }
    // const res = computedTrajectoryData.value.find(
    //   ({ x, y }) => x === props.ship?.position.x  && y === props.ship?.position.y
    // );
    const lastTrajectoryPoint = computedTrajectoryData.value[computedTrajectoryData.value.length - 1];

      if (lastTrajectoryPoint && lastTrajectoryPoint.x === props.ship?.position.x && props.ship?.position.y === lastTrajectoryPoint.y) {
        passedTrajectoryEnd.value = false;
    }

    if (passedTrajectoryEnd.value && computedTrajectoryData.value.length > 0 && trajectoryCtx.value) {
      const trajectoryCanvas = trajectoryCtx.value.canvas;

      ctx.save();

      const shipOffsetX = (computedTrajectoryData.value[0].x! - props.ship!.position.x!) * scaleFactor.value;
      const shipOffsetY = (computedTrajectoryData.value[0].y! - props.ship!.position.y!) * scaleFactor.value;

      const drawStartX = (trajectoryCanvas.width / 2) - shipOffsetX - (canvas!.width / 2);
      const drawStartY = (trajectoryCanvas.height / 2) - shipOffsetY - (canvas!.height / 2);

      const startX = drawStartX;
      const startY = drawStartY;

      ctx.drawImage(trajectoryCanvas, startX, startY, canvas!.width, canvas!.height, 0, 0, canvas!.width, canvas!.height);

      ctx.restore();
    }

    ctx.save();
    ctx.drawImage(
      scaleBarCanvas.value,
      0,
      canvas!.height - scaleBarCanvas.value.height
    );
    ctx.restore();
  }

}
  animationFrameId = requestAnimationFrame(draw);
}

function drawOtherObjects(
  ctx: CanvasRenderingContext2D,
  otherObjects: Array<Planet>,
  scaleFactor: number,
  minimumSize: number = 10,
  canvasCenter: Vector2D, 
) {
  const { x: canvasCenterX, y: canvasCenterY } = canvasCenter;
  otherObjects.forEach((obj) => {
    // const canvasCenterX = props.canvasSize.x / 2;
    // const canvasCenterY = props.canvasSize.y / 2;
    const relativeObjX =
      (obj.position.x! - props.ship!.position.x!) * scaleFactor + canvasCenterX!;
    const relativeObjY =
      (obj.position.y! - props.ship!.position.y!) * scaleFactor + canvasCenterY!;

    const adjustedRadius = Math.max(obj.radius * scaleFactor, minimumSize);

    ctx.beginPath();
    ctx.arc(relativeObjX, relativeObjY, adjustedRadius, 0, 2 * Math.PI);
    const color = obj.name === 'earth' ? 'blue' : 'yellow';
    ctx.fillStyle = color;
    ctx.fill();
  });
}

onMounted(() => {
  stars.value = generateStarPositions(
    starBackgroundSize,
    props.canvasSize.y,
    props.canvasSize.x
  );
  animationFrameId = requestAnimationFrame(draw);
  shipImage.onload = () => {
    shipImageLoaded.value = true;
  };
  shipImage.src = shipSvg;

  fireImage.onload = () => {
    fireImageLoaded.value = true;
  };
  fireImage.src = fireSvg;
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>
