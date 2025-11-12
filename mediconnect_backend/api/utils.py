"""Utility functions for face recognition."""
import base64
import io
import numpy as np
from PIL import Image
from deepface import DeepFace
from django.core.files.uploadedfile import InMemoryUploadedFile
import json


def decode_base64_image(base64_string):
    """Decode base64 string to PIL Image."""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        return image
    except Exception as e:
        raise ValueError(f"Invalid image data: {str(e)}")


def encode_face(image):
    """Encode face from image using DeepFace."""
    try:
        # Convert PIL Image to numpy array
        if isinstance(image, Image.Image):
            image_array = np.array(image)
        else:
            image_array = image
        
        # Get face encoding using DeepFace
        # Using VGG-Face model for face recognition
        embedding = DeepFace.represent(
            img_path=image_array,
            model_name='VGG-Face',
            enforce_detection=False
        )
        
        if embedding and len(embedding) > 0:
            # Return the first face embedding as a list
            return embedding[0]['embedding']
        else:
            raise ValueError("No face detected in image")
    except Exception as e:
        raise ValueError(f"Face encoding failed: {str(e)}")


def verify_face(image, stored_encoding):
    """Verify if face in image matches stored encoding."""
    try:
        # Get encoding from new image
        new_encoding = encode_face(image)
        
        # Load stored encoding
        if isinstance(stored_encoding, str):
            stored_encoding = json.loads(stored_encoding)
        
        # Calculate cosine similarity
        stored_array = np.array(stored_encoding)
        new_array = np.array(new_encoding)
        
        # Normalize vectors
        stored_norm = stored_array / np.linalg.norm(stored_array)
        new_norm = new_array / np.linalg.norm(new_array)
        
        # Calculate cosine similarity
        similarity = np.dot(stored_norm, new_norm)
        
        # Threshold for face matching (adjust as needed)
        threshold = 0.6
        
        return similarity >= threshold
    except Exception as e:
        raise ValueError(f"Face verification failed: {str(e)}")

