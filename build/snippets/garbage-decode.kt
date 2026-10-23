    private fun postProcessOutputs(
        originalBitmap: Bitmap,
        detections: Array<FloatArray>,
        masks: Array<Array<FloatArray>>
    ): Bitmap {
        val detectedObjects = mutableListOf<Detection>()
        val confidenceThreshold = 0.05f
        val iouThreshold = 0.45f
        val numClasses = classLabels.size
        val numCoefficients = 32

        for (i in 0 until 8400) {
            val x = detections[0][i] * INPUT_SIZE
            val y = detections[1][i] * INPUT_SIZE
            val w = detections[2][i] * INPUT_SIZE
            val h = detections[3][i] * INPUT_SIZE

            var maxScore = -1.0f
            var classId = -1
            for (j in 0 until numClasses) {
                val score = detections[4 + j][i]
                if (score > maxScore) {
                    maxScore = score
                    classId = j
                }
            }

            if (maxScore > confidenceThreshold) {
                val maskCoeffs = FloatArray(numCoefficients) { k -> detections[4 + numClasses + k][i] }
                detectedObjects.add(Detection(x, y, w, h, maxScore, classId, maskCoeffs))
            }
        }

        val finalDetections = applyNMS(detectedObjects, iouThreshold)
        return drawMasksOnly(originalBitmap, finalDetections, masks)
