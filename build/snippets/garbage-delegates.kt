    init {
        try {
            logDeviceInfo()
            val modelFile = loadModelFile(context)

            // Setup TFLite GPU delegate (OpenGL/Vulkan)
            setupTFLiteGpuInterpreter(modelFile)

            // Setup NNAPI (may route to vendor accelerator if available)
            setupNNAPIInterpreter(modelFile)

            // Always setup CPU as fallback
            setupCPUInterpreter(modelFile)

            // Set initial delegate based on availability (prefer TFLite GPU > NNAPI > CPU)
            currentDelegate = when {
                gpuAvailable -> DelegateType.GPU
                nnapiAvailable -> DelegateType.NNAPI
                else -> DelegateType.CPU
            }
