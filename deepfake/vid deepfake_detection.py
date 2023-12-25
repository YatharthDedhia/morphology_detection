import torch
import torch.nn.functional as F
from facenet_pytorch import MTCNN, InceptionResnetV1
import cv2
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import warnings
from PIL import Image

warnings.filterwarnings("ignore")

"""# Download and Load Model"""

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

checkpoint = torch.load("resnetinceptionv1_epoch_32.pth", map_location=torch.device('cpu'))
model.load_state_dict(checkpoint['model_state_dict'])
model.to(DEVICE)
model.eval()

"""# Model Inference"""

def predict(input_frame):
    """Predict the label of the input_frame"""
    input_image = Image.fromarray(cv2.cvtColor(input_frame, cv2.COLOR_BGR2RGB))
    
    face = mtcnn(input_image)
    if face is None:
        raise Exception('No face detected')
    face = face.unsqueeze(0)  # add the batch dimension
    face = F.interpolate(face, size=(256, 256), mode='bilinear', align_corners=False)

    # convert the face into a numpy array to be able to plot it
    prev_face = face.squeeze(0).permute(1, 2, 0).cpu().detach().int().numpy()
    prev_face = prev_face.astype('uint8')

    face = face.to(DEVICE)
    face = face.to(torch.float32)
    face = face / 255.0
    face_image_to_plot = face.squeeze(0).permute(1, 2, 0).cpu().detach().int().numpy()

    target_layers = [model.block8.branch1[-1]]
    use_cuda = True if torch.cuda.is_available() else False
    cam = GradCAM(model=model, target_layers=target_layers, use_cuda=use_cuda)
    targets = [ClassifierOutputTarget(0)]

    grayscale_cam = cam(input_tensor=face, targets=targets, eigen_smooth=True)
    grayscale_cam = grayscale_cam[0, :]
    visualization = show_cam_on_image(face_image_to_plot, grayscale_cam, use_rgb=True)
    face_with_mask = cv2.addWeighted(prev_face, 1, visualization, 0.5, 0)

    with torch.no_grad():
        output = torch.sigmoid(model(face).squeeze(0))
        real_prediction = 1 - output.item()
        fake_prediction = output.item()

        confidences = {
            'real': real_prediction,
            'fake': fake_prediction
        }
    return input_frame, face_with_mask, confidences

# Get video file path from the user
video_path = input("Enter the path to the video file: ")

# Open the video capture
cap = cv2.VideoCapture(video_path)

# Get video properties
fps = int(cap.get(cv2.CAP_PROP_FPS))
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Define the codec and create VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'XVID')
output_path = 'output_video.avi'
out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

frame_counter = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_counter += 1
    input_frame, frame_with_mask, confidences = predict(frame)

    # Display the result
    cv2.putText(input_frame, f"Real: {confidences['real']:.2f}, Fake: {confidences['fake']:.2f}",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

    cv2.imshow('Original Frame', input_frame)
    cv2.imshow('Frame with Mask', frame_with_mask)

    # Write the frame to the output video
    out.write(input_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the video capture and writer
cap.release()
out.release()
cv2.destroyAllWindows()

print(f"Output video saved at: {output_path}")
