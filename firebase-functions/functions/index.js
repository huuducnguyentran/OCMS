const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const path = require('path');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Azure Cognitive Services Computer Vision API Configuration
const AZURE_COMPUTER_VISION_API_KEY = '8rHOmSoL7gQ4J7kmIl6OwMTmbeVYi8caawNgkOkxEbDRUiV8PShBJQQJ99BDACYeBjFXJ3w3AAAFACOG9MDn'; // Replace with your Azure API key
const AZURE_COMPUTER_VISION_ENDPOINT = 'https://ocms-web-certificate.cognitiveservices.azure.com/'; // Replace with your Azure endpoint

// Cloud Function to analyze certificate images after upload to Firebase Storage
exports.analyzeCertificateImage = functions.storage.object().onFinalize(async (object) => {
  // Check if the file is a certificate image
  if (!object.name.startsWith('certificates/')) {
    console.log('File is not a certificate image, skipping analysis:', object.name);
    return null;
  }

  const filePath = object.name;
  const bucketName = object.bucket;
  const fileBucket = admin.storage().bucket(bucketName);
  const file = fileBucket.file(filePath);

  try {
    // Extract certificate ID from the filename
    const fileName = path.basename(filePath);
    const certificateId = fileName.split('_')[0]; // Assuming naming convention: certificateId_timestamp.ext

    console.log(`Processing certificate image: ${fileName}, certificateId: ${certificateId}`);

    // Get the image from Firebase Storage
    const [fileContent] = await file.download();

    // Make the request to Azure's Computer Vision API
    const url = `${AZURE_COMPUTER_VISION_ENDPOINT}/vision/v3.2/read/analyze`;
    
    // First, submit the image for analysis
    const submitResponse = await axios.post(url, fileContent, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': AZURE_COMPUTER_VISION_API_KEY,
      }
    });

    // Get operation location to check analysis results
    const operationLocation = submitResponse.headers['operation-location'];
    if (!operationLocation) {
      throw new Error('Operation location not found in response');
    }

    // Wait for analysis to complete (with retry)
    let analysisResult;
    let retries = 10;
    
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await axios.get(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_COMPUTER_VISION_API_KEY,
        }
      });
      
      if (resultResponse.data.status === 'succeeded') {
        analysisResult = resultResponse.data;
        break;
      } else if (resultResponse.data.status === 'failed') {
        throw new Error('Text analysis failed');
      }
      
      retries--;
    }

    if (!analysisResult) {
      throw new Error('Text analysis did not complete in time');
    }

    // Extract text from analysis result
    const extractedText = [];
    if (analysisResult.analyzeResult && analysisResult.analyzeResult.readResults) {
      for (const page of analysisResult.analyzeResult.readResults) {
        for (const line of page.lines || []) {
          extractedText.push(line.text);
        }
      }
    }

    // Try to extract certificate information
    const certificateInfo = {
      text: extractedText.join('\n'),
      possibleCode: extractPossibleCertificateCode(extractedText),
      possibleIssuer: extractPossibleIssuer(extractedText),
      possibleDates: extractPossibleDates(extractedText),
    };

    // Store the analysis in Firestore
    await admin.firestore().collection('certificateAnalysis').doc(certificateId).set({
      filePath: filePath,
      analysis: certificateInfo,
      rawAnalysis: analysisResult,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Certificate analysis complete for', certificateId);
    return null;
  } catch (error) {
    console.error('Error analyzing certificate image:', error);
    return null;
  }
});

// Helper function to extract possible certificate code
function extractPossibleCertificateCode(textLines) {
  // Look for patterns like "Certificate #", "No.", "ID:", etc.
  const codePatterns = [
    /cert(ificate)?\s*[#:]?\s*([A-Z0-9-]+)/i,
    /\b(no|number|id)[\s:.]\s*([A-Z0-9-]+)/i,
    /\b([A-Z][A-Z0-9]{5,})\b/,  // Uppercase letters and numbers, at least 6 chars
  ];
  
  for (const line of textLines) {
    for (const pattern of codePatterns) {
      const match = line.match(pattern);
      if (match && match[2]) return match[2];
      if (match && match[1] && match[1].length >= 6) return match[1];
    }
  }
  
  return null;
}

// Helper function to extract possible issuer
function extractPossibleIssuer(textLines) {
  // Look for patterns like "Issued by", "Provider:", etc.
  const issuerPatterns = [
    /issued\s*by\s*[:.]?\s*(.+)/i,
    /provider\s*[:.]?\s*(.+)/i,
    /certif(ying|ication)\s*authority\s*[:.]?\s*(.+)/i,
    /organization\s*[:.]?\s*(.+)/i,
  ];
  
  for (const line of textLines) {
    for (const pattern of issuerPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) return match[1].trim();
      if (match && match[2]) return match[2].trim();
    }
  }
  
  // Return the first line that might be an organization name
  for (const line of textLines) {
    if (line.length > 5 && line.length < 50 && !/date|cert|valid|expire|course/.test(line.toLowerCase())) {
      return line.trim();
    }
  }
  
  return null;
}

// Helper function to extract possible dates
function extractPossibleDates(textLines) {
  const dates = [];
  const datePatterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b/g,
    // Month name, DD, YYYY
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(st|nd|rd|th)?,?\s+(\d{4})\b/gi,
    // YYYY-MM-DD
    /\b(\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})\b/g,
  ];
  
  for (const line of textLines) {
    for (const pattern of datePatterns) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        if (match[0]) dates.push(match[0]);
      }
    }
  }
  
  return dates;
}
