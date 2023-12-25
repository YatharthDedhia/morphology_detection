import gradio as gr
import torch
import torch.nn.functional as F
from facenet_pytorch import MTCNN, InceptionResnetV1
import numpy as np
from PIL import Image
import cv2
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import warnings
import matplotlib.pyplot as plt

# Ignore unnecessary warnings
warnings.filterwarnings("ignore")

# Download and Load Model

# Check if CUDA is available and set the device accordingly
DEVICE = 'cuda:0' if torch.cuda.is_available() else 'cpu'

# Initialize MTCNN for face detection
mtcnn = MTCNN(
    select_largest=False,
    post_process=False,
    device=DEVICE
).to(DEVICE).eval()

# Load the InceptionResnetV1 model for face classification
model = InceptionResnetV1(
    pretrained="vggface2",
    classify=True,
    num_classes=1,
    device=DEVICE
)

# Load the pre-trained weights for the model
checkpoint = torch.load("resnetinceptionv1_epoch_32.pth",
                        map_location=torch.device('cpu'))
model.load_state_dict(checkpoint['model_state_dict'])
model.to(DEVICE)
model.eval()


def predict(input_image: Image.Image):
    """Predict the label of the input_image"""
    # Detect face using MTCNN
    face = mtcnn(input_image)
    
    # If no face is detected, raise an exception
    if face is None:
        raise Exception('No face detected')

    # Add batch dimension and resize the face image
    face = face.unsqueeze(0)
    face = F.interpolate(face, size=(256, 256),
                         mode='bilinear', align_corners=False)

    # Convert the face into a numpy array for plotting
    prev_face = face.squeeze(0).permute(1, 2, 0).cpu().detach().int().numpy()
    prev_face = prev_face.astype('uint8')

    # Preprocess the face for model input
    face = face.to(DEVICE)
    face = face.to(torch.float32)
    face = face / 255.0
    face_image_to_plot = face.squeeze(0).permute(
        1, 2, 0).cpu().detach().int().numpy()

    # Set up GradCAM for visualization
    target_layers = [model.block8.branch1[-1]]
    use_cuda = True if torch.cuda.is_available() else False
    cam = GradCAM(model=model, target_layers=target_layers, use_cuda=use_cuda)
    targets = [ClassifierOutputTarget(0)]

    # Generate GradCAM visualization
    grayscale_cam = cam(input_tensor=face, targets=targets, eigen_smooth=True)
    grayscale_cam = grayscale_cam[0, :]
    visualization = show_cam_on_image(
        face_image_to_plot, grayscale_cam, use_rgb=True)
    
    # Combine original face with GradCAM visualization
    face_with_mask = cv2.addWeighted(prev_face, 1, visualization, 0.5, 0)

    # Make prediction using the model
    with torch.no_grad():
        output = torch.sigmoid(model(face).squeeze(0))
        prediction = "real" if output.item() < 0.5 else "fake"

        # Get confidence scores for real and fake predictions
        real_prediction = 1 - output.item()
        fake_prediction = output.item()

        confidences = {
            'real': real_prediction * 100,
            'fake': fake_prediction * 100
        }
    return confidences, face_with_mask

# Gradio Interface
iface = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil", label="Input Image"),
    outputs=["text", gr.Image(type="numpy", label="Output Image")],
    live=True
)

# Launch the Gradio interface
iface.launch()
