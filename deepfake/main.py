from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import base64
from PIL import Image
from io import BytesIO
import torch
import torch.nn.functional as F
from facenet_pytorch import MTCNN, InceptionResnetV1
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import warnings
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = 'cuda:0' if torch.cuda.is_available() else 'cpu'

mtcnn = MTCNN(
    select_largest=False,
    post_process=False,
    device=DEVICE
).to(DEVICE).eval()

model = InceptionResnetV1(
    pretrained="vggface2",
    classify=True,
    num_classes=1,
    device=DEVICE
)

checkpoint = torch.load("resnetinceptionv1_epoch_32.pth",
                        map_location=torch.device('cpu'))
model.load_state_dict(checkpoint['model_state_dict'])
model.to(DEVICE)
model.eval()


def predict(input_image: Image.Image):
    face = mtcnn(input_image)
    if face is None:
        raise Exception('No face detected')

    face = face.unsqueeze(0)
    face = F.interpolate(face, size=(256, 256),
                         mode='bilinear', align_corners=False)
    face = face.to(DEVICE).to(torch.float32) / 255.0

    prev_face = face.squeeze(0).permute(
        1, 2, 0).cpu().detach().numpy().astype('uint8')

    target_layers = [model.block8.branch1[-1]]
    use_cuda = torch.cuda.is_available()
    cam = GradCAM(model=model, target_layers=target_layers, use_cuda=use_cuda)
    targets = [ClassifierOutputTarget(0)]

    grayscale_cam = cam(input_tensor=face, targets=targets,
                        eigen_smooth=True)[0, :]
    visualization = show_cam_on_image(
        face.squeeze(0).permute(1, 2, 0).cpu().detach().numpy(),
        grayscale_cam,
        use_rgb=True
    )
    face_with_mask = cv2.addWeighted(prev_face, 1, visualization, 0.5, 0)

    with torch.no_grad():
        output = torch.sigmoid(model(face).squeeze(0))
        prediction = "real" if output.item() < 0.5 else "fake"

        real_prediction = 1 - output.item()
        fake_prediction = output.item()

        confidences = {
            'real': real_prediction,
            'fake': fake_prediction
        }
    return confidences, face_with_mask


@app.websocket("/deepfake")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("received")

    while True:
        data = await ws.receive_text()
        print("data received")
        if data != 'null':
            print("hmmm")
            face_bytes = bytes(data, 'utf-8')
            face_bytes = face_bytes[face_bytes.find(b'/9'):]
            image_bytes = base64.b64decode(face_bytes)
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
            confidences, face_with_mask = predict(image)
            response_data = {"confidences": confidences}
            print(response_data)
            await ws.send_json(response_data)