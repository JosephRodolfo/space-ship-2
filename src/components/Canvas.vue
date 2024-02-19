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
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  generateStarPositions,
  renderStarField,
} from "../helpers/createBackground";
import { Vector2D } from "../interfaces";
import shipSvg from "../assets/gray-ship.svg";
import fireSvg from "../assets/blue-fire.svg";
import { Planet } from "../entitites/planet";
import { Physics } from "../entitites/physics";
import { useMainStore } from "../store/store"; 
import loadingSvg from '../assets/loading.svg';

const props = defineProps({
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
const loadingIcon = new Image();
const stars = ref<Vector2D[]>([]);
const shipImageLoaded = ref(false);
const fireImageLoaded = ref(false);
const loadingIconLoaded = ref(false);
const physics = new Physics();
const store = useMainStore();
let loadingIconRotationAngle = 0;
const computedTrajectoryData = computed(() => {
  return store.trajectoryData;
});

const ship = computed(() => {
  return store.initialState?.ship;
})

const otherObjects = computed(() => {
  return store.initialState?.otherBodies;
})


function updateBackgroundPosition(
  velocity: Vector2D,
  offset: Vector2D
): Vector2D {
  const movementScaleFactor = 0.00001;

  let newXOffset =
    offset.x! + (velocity.x! / 100 || 0 / 1000000000000) * movementScaleFactor;
  let newYOffset =
    offset.y! + (velocity.y! / 100 || 0 / 1000000000000) * movementScaleFactor;

  return {
    x: (newXOffset + starBackgroundSize) % starBackgroundSize,
    y: (newYOffset + starBackgroundSize) % starBackgroundSize,
  };
}

let animationFrameId: number;
// let lastX = 0;
// let lastY = 0
// let cumulativeX = 0;
// let cumulativeY = 0;
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
    shipHeight + (ship.value!.firingThruster ? shipHeight : 0);
  if (
    (fireImageLoaded.value, ship.value!.firingThruster && fireImage.complete)
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
const currentReferenceBody = computed(() => {
  return store.initialState!.otherBodies.find((el) => el.name === store.referenceBody);

});

const pointsToDraw = computed(() => {
  return computedTrajectoryData.value.filter((el) => el.index! > store.gameEngine.windowCount);

})


const trajectoryCtx = computed(() => {
  // cumulativeX = 0;
  // cumulativeY = 0;
  const offScreenCanvas = document.createElement("canvas");
  offScreenCanvas.width = props.canvasSize.x * 3; 
  offScreenCanvas.height = props.canvasSize.y * 3; 
  const ctx = offScreenCanvas.getContext("2d");
  if (!ctx) return null;

  ctx.beginPath();
  ctx.strokeStyle = "white";
 pointsToDraw.value.forEach((point, index) => {
    const origin = pointsToDraw.value[0];
    const relativeObjX = (point.x! - origin.x!) * scaleFactor.value + offScreenCanvas.width / 2 + props.canvasCenterOffset.x!;
    const relativeObjY = (point.y! - origin.y!) * scaleFactor.value + offScreenCanvas.height / 2 + props.canvasCenterOffset.y!;

    if (index === 0) {
      ctx.moveTo(relativeObjX, relativeObjY);
    } else {
      ctx.lineTo(relativeObjX, relativeObjY);
    }
  });

  ctx.stroke();
  return ctx;
});


function draw() {
  const canvas = myCanvas.value;
  const ctx = canvas?.getContext("2d");

  if (ctx) {
    const canvasCenterX = props.canvasSize.x / 2 + props.canvasCenterOffset.x!;
    const canvasCenterY = props.canvasSize.y / 2 + props.canvasCenterOffset.y!;


  if (ctx && starBackgroundCtx) {
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);

    if (props.background) {
      const velocity = currentReferenceBody.value 
      ? physics.calculateRelativeVelocity(ship.value!.velocity, currentReferenceBody.value.velocity) 
      : ship.value!.velocity;
      const { x: bgX, y: bgY } = updateBackgroundPosition(
        !store.pause ? velocity! : { x: 0, y: 0},
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
      drawOtherObjects(ctx, otherObjects.value!, scaleFactor.value, 10, { x: canvasCenterX, y: canvasCenterY });
    }

    if (shipAndThrusterCtx.value) {
      ctx.save();
      ctx.translate(canvasCenterX, canvasCenterY); 
      ctx.rotate(ship.value!.rotationAngle);
      ctx.drawImage(
        shipAndThrusterCtx.value.canvas,
        -shipSize.value.shipWidth / 2,
        -shipSize.value.shipHeight / 2
      );
      ctx.restore();
    }
    
    if (store.gameEngine.windowCount && computedTrajectoryData.value.length > 0 && trajectoryCtx.value) {
    const trajectoryCanvas = trajectoryCtx.value.canvas;
    ctx.save();
    if (currentReferenceBody.value) {
      // cumulativeX += currentReferenceBody.value!.position.x! - lastX;
      // cumulativeX += currentReferenceBody.value!.position.y! - lastY;
    }

    const offsetX = (pointsToDraw.value[0].x! - ship!.value!.position.x!) * scaleFactor.value;
    const offsetY = (pointsToDraw.value[0].y! - ship!.value!.position.y!) * scaleFactor.value;
    const drawStartX = (trajectoryCanvas.width / 2) - offsetX - ( canvas!.width / 2);
    const drawStartY = (trajectoryCanvas.height / 2) - offsetY - (canvas!.height / 2);
    if (currentReferenceBody.value) {
    // lastX = currentReferenceBody.value!.position.x!;
    // lastY = currentReferenceBody.value!.position.y!;
    }
    ctx.drawImage(trajectoryCanvas, drawStartX, drawStartY, canvas!.width, canvas!.height, 0, 0, canvas!.width, canvas!.height);

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

  if (store.trajectorySettings.loadingTrajectory) {
  drawLoadingIcon(ctx, canvas!.width, canvas!.height)
  }

}
  animationFrameId = requestAnimationFrame(draw);
}
function drawLoadingIcon(ctx: CanvasRenderingContext2D, canvasCenterX: number, canvasCenterY: number) {
  if (!loadingIconLoaded.value || !loadingIcon.complete) return;
  ctx.save();
  ctx.translate(canvasCenterX / 2, canvasCenterY / 2);
  ctx.rotate(loadingIconRotationAngle);
  const iconSize = 50; 
  ctx.drawImage(loadingIcon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
  loadingIconRotationAngle += .01;
  if (store.trajectorySettings.chunksReceived === 0) {
    loadingIconRotationAngle = 0;
  }
  ctx.restore();
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
      (obj.position.x! - ship!.value!.position.x!) * scaleFactor + canvasCenterX!;
    const relativeObjY =
      (obj.position.y! - ship.value!.position.y!) * scaleFactor + canvasCenterY!;

    const adjustedRadius = Math.max(obj.radius * scaleFactor, minimumSize);

    ctx.beginPath();
    ctx.arc(relativeObjX, relativeObjY, adjustedRadius, 0, 2 * Math.PI);
    let color;
    if (obj.name === 'earth') {
      color = 'blue';
    } else if (obj.name === 'mars') {
      color = 'red';
    }else {
      color = 'yellow';

    }

    ctx.fillStyle = color;
    ctx.fill();
  });
}

onMounted(() => {
  if (currentReferenceBody.value) {
    // lastX = currentReferenceBody.value!.position.x!;
    // lastY = currentReferenceBody.value!.position.y!;
  }
  stars.value = generateStarPositions(
    starBackgroundSize,
    props.canvasSize.y,
    props.canvasSize.x
  );

  let imagesLoaded = 0;
  const totalImages = 3;

  const checkImagesLoaded = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      draw();
    }
  };

  shipImage.onload = () => {
    shipImageLoaded.value = true;
    checkImagesLoaded();
  };
  shipImage.src = shipSvg;

  fireImage.onload = () => {
    fireImageLoaded.value = true;
    checkImagesLoaded();
  };
  fireImage.src = fireSvg;
  loadingIcon.onload = () => {
    loadingIconLoaded.value = true;
    checkImagesLoaded();
  };
  loadingIcon.src = loadingSvg;
});


onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>


