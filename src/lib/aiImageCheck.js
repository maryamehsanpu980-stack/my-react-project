export async function checkAIGenerated(file) {
  try {
    if (!file) {
      return {
        isAI: false,
        isAIGenerated: false,
        score: 0,
        confidence: 0,
        reason: "No file provided for AI image check.",
        fileName: null,
      };
    }

    return {
      isAI: false,
      isAIGenerated: false,
      score: 0,
      confidence: 0,
      reason: "AI image verification placeholder passed.",
      fileName: file.name || null,
      fileType: file.type || null,
      fileSize: file.size || 0,
    };
  } catch (error) {
    return {
      isAI: false,
      isAIGenerated: false,
      score: 0,
      confidence: 0,
      reason: "AI image verification could not be completed.",
      fileName: file?.name || null,
      error: error?.message || "Unknown error",
    };
  }
}