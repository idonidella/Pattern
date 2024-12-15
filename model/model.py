import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.datasets import cifar10
from sklearn.metrics import confusion_matrix
import seaborn as sns
import pandas as pd

# Data loading and preprocessing
(X_train, Y_train), (X_test, Y_test) = cifar10.load_data()
X_train = X_train.astype('float32') / 255.0
X_test = X_test.astype('float32') / 255.0
Y_train = to_categorical(Y_train, 10)
Y_test = to_categorical(Y_test, 10)

# Data augmentation
datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True
)
datagen.fit(X_train)

# Model creation
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
    MaxPooling2D((2, 2)),
    Dropout(0.25),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Dropout(0.25),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(10, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Model training
batch_size = 64
epochs = 5
history = model.fit(
    datagen.flow(X_train, Y_train, batch_size=batch_size),
    validation_data=(X_test, Y_test),
    steps_per_epoch=X_train.shape[0] // batch_size,
    epochs=epochs
)

# Model evaluation
loss, accuracy = model.evaluate(X_test, Y_test, verbose=0)
print(f"Test Loss: {loss:.4f}")
print(f"Test Accuracy: {accuracy:.4f}")

# Plot: Accuracy vs. Epoch
plt.figure(figsize=(10, 6))
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Accuracy vs. Epoch')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)
plt.show()

# Plot: Loss vs. Epoch
plt.figure(figsize=(10, 6))
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Loss vs. Epoch')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True)
plt.show()

# Predictions and Confusion Matrix
y_true = np.argmax(Y_test, axis=1)
y_pred = np.argmax(model.predict(X_test), axis=1)
cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=range(10), yticklabels=range(10))
plt.title('Confusion Matrix')
plt.xlabel('Predicted Labels')
plt.ylabel('True Labels')
plt.show()

# Scatterplot: True Values vs. Predicted Values
plt.figure(figsize=(10, 6))
plt.scatter(y_true[:100], y_pred[:100], alpha=0.6, color='blue')
plt.xlabel('True Values')
plt.ylabel('Predicted Values')
plt.title('Scatterplot: True Values vs Predicted Values')
plt.grid(True)
plt.show()

# Save training statistics
stats = {
    "Epoch": list(range(1, epochs + 1)),
    "Train Accuracy": history.history['accuracy'],
    "Validation Accuracy": history.history['val_accuracy'],
    "Train Loss": history.history['loss'],
    "Validation Loss": history.history['val_loss']
}
df_stats = pd.DataFrame(stats)
df_stats.to_csv("training_statistics.csv", index=False)
print("Training statistics saved to 'training_statistics.csv'.")
