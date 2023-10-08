export const getCanvasRenderingContext2D = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new TypeError('CanvasRenderingContext2D could not be created from <canvas> element');
  }

  return ctx;
};

export const createCanvasFromImageData = (data: ImageData): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = getCanvasRenderingContext2D(canvas);

  canvas.width = data.width;
  canvas.height = data.height;
  ctx.clearRect(0, 0, data.width, data.height);
  ctx.putImageData(data, 0, 0);

  return canvas;
};

export const createImageDataFromDataUri = (uri: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = getCanvasRenderingContext2D(canvas);
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }, false);
    image.src = uri;
  });
};

export const drawImageCenteredOnCanvas = (canvas: HTMLCanvasElement, image: CanvasImageSource, ratioMultiplier: number = 1) => {
  const width = canvas.width;
  const height = canvas.height;
  const hRatio = width / (image.width as number);
  const vRatio = height / (image.height as number);
  const ratio = Math.min(hRatio, vRatio, 1) * ratioMultiplier;
  const centerShiftX = (width - ((image.width as number) * ratio)) / 2;
  const centerShiftY = (height - ((image.height as number) * ratio)) / 2;
  const destWidth = (image.width as number) * ratio;
  const destHeight = (image.height as number) * ratio;
  const ctx = getCanvasRenderingContext2D(canvas);
  // ctx.clearRect(0, 0, width, height)
  ctx.clearRect(centerShiftX, centerShiftY, destWidth, destHeight);
  ctx.drawImage(image, centerShiftX, centerShiftY, destWidth, destHeight);
};

export const getCanvasCroppedImageData = (canvas: HTMLCanvasElement): ImageData => {
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  if (imgWidth === 0 || imgHeight === 0) {
    return null;
  }

  const ctx = getCanvasRenderingContext2D(canvas);
  const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);

  const data = imageData.data;

  const getAlpha = (x, y) => {
    return data[(((imgWidth * y) + x) * 4) + 3];
  };

  const scanY = (fromTop) => {
    const offset = fromTop ? 1 : -1;

    // loop through each row
    for (let y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
      // loop through each column
      for (let x = 0; x < imgWidth; x += 1) {
        if (getAlpha(x, y)) {
          return y;
        }
      }
    }
    return null; // all image is transparent
  };

  const scanX = function (fromLeft) {
    const offset = fromLeft ? 1 : -1;

    // loop through each column
    for (let x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
      // loop through each row
      for (let y = 0; y < imgHeight; y += 1) {
        if (getAlpha(x, y)) {
          return x;
        }
      }
    }
    return null; // all image is transparent
  };

  const cropTop = scanY(true);
  const cropBottom = scanY(false);
  const cropLeft = scanX(true);
  const cropRight = scanX(false);

  if (cropTop === null ||
      cropBottom === null ||
      cropLeft === null ||
      cropRight === null) {
    return;
  }

  // If the image has a 1 pixel width, cropRight and cropLeft would be the same value
  // hence the need to add an extra pixel to the width and height values
  const width = (cropRight - cropLeft) + 1;
  const height = (cropBottom - cropTop) + 1;
  return ctx.getImageData(cropLeft, cropTop, width, height);
};

export const getCanvasCroppedDataUrl = (canvas: HTMLCanvasElement, type?: string, encoderOptions?: number) => {
  const imageData = getCanvasCroppedImageData(canvas);

  if (!imageData) {
    return;
  }

  const croppedCanvas = createCanvasFromImageData(imageData);

  return croppedCanvas.toDataURL(type, encoderOptions);
};

export const resizeCanvas = (canvas: HTMLCanvasElement, width: number, height: number, scaleDown: boolean, fullSizeCanvas?: HTMLCanvasElement): boolean => {
  // Dont do anything if width and height have not changed
  if (canvas.width === width && canvas.height === height) {
    return true;
  }

  // Get the cropped image inside the canvas so that we can check if we need
  // to resize the image before we resize the canvas
  const croppedImageData = getCanvasCroppedImageData(fullSizeCanvas || canvas);

  // If image is completely transparent, just resize.
  if (!croppedImageData) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }

  // If the cropped image will fit inside the new canvas size,
  // we can just center it inside the new canvas
  if (width >= croppedImageData.width && height >= croppedImageData.height) {
    const centerShiftX = (width - croppedImageData.width) / 2;
    const centerShiftY = (height - croppedImageData.height) / 2;
    const ctx = getCanvasRenderingContext2D(canvas);

    canvas.width = width;
    canvas.height = height;

    ctx.putImageData(
      croppedImageData,
      centerShiftX,
      centerShiftY,
      0,
      0,
      croppedImageData.width,
      croppedImageData.height
    );

    return true;
  }

  // If the cropped image will not fit inside the new canvas size
  // we can either scale the image down to fit or just clear the canvas
  if (!scaleDown) {
    canvas.width = width;
    canvas.height = height;

    return false;
  }

  const croppedCanvas = fullSizeCanvas || createCanvasFromImageData(croppedImageData);

  canvas.width = width;
  canvas.height = height;

  drawImageCenteredOnCanvas(canvas, croppedCanvas);

  return true;
};
