from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io
import base64
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


model = load_model('mnist_cnn_model_0.keras')

# Home route
@app.route('/')
def home():
    return 'MNIST Model API'

@app.route('/test', methods=['GET'])
def base():
    print(request)
    return 'MNIST Model API'


@app.route('/recognize', methods=['POST'])
def recognize():
    try:

        img_data = request.json['image']
        
        img_data = img_data.split(',')[1]  
        img = Image.open(io.BytesIO(base64.b64decode(img_data)))
        

        img = img.convert('L')  
        img = img.resize((28, 28))  
        
        # Convert image to a numpy array and normalize the pixel values
        img = np.array(img) / 255.0  # Normalize the image data
        img = img.reshape(1, 28, 28, 1)  # Reshape for the model input (28, 28, 1)


        print(f"Image shape: {img.shape}, Image dtype: {img.dtype}")


        prediction = model.predict(img)


        predicted_class = np.argmax(prediction, axis=1)[0]
        predicted_confidence = np.max(prediction)

        return jsonify({'prediction': str(predicted_class), 'confidence': str(predicted_confidence)})

    except Exception as e:

        print(f"Error: {str(e)}")  
        return jsonify({'error': f"Error during prediction: {str(e)}"})

if __name__ == '__main__':
    app.run(debug=True)
