import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Navbar from './Components/navbar/Navbar';
import Sidebar from './Components/sidebar/Sidebar';
import PostContainer from './Components/posts/PostContainer';

const Home = () => {
    // State variables
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [newwImage, setnewwImage] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [responseJson, setResponseJson] = useState(null);
    const [websocket, setWebsocket] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const videoRef = useRef(null);

    // Effect to check if the user is logged in
    useEffect(() => {
        const loggedInUser = localStorage.getItem("loggedIn");
        if (loggedInUser !== "true") {
            window.location.replace("/login");
        }
    }, []);

    // Fetch images from the server when the component mounts
    useEffect(() => {
        fetch('http://localhost:4000/images')
            .then((response) => response.json())
            .then((data) => handleData(data))
            .catch((error) => console.error('Error fetching images:', error));
    }, []);

    // Effect to open a WebSocket connection
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/deepfake');
        setWebsocket(ws);

        return () => {
            // Close the WebSocket connection when the component unmounts
            ws.close();
        };
    }, []);

    // Effect to set up event listeners for the WebSocket
    useEffect(() => {
        if (websocket) {
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleData(data);
                console.log(data.confidences.real);
            };
        }
    }, [websocket]);

    // Handle received data from the server
    const handleData = (data) => {
        if (data) {
            const imageList = [];
            for (let i = 0; i < data.length; i++) {
                const test = {
                    src: data[i].url,
                    likes: Math.floor(Math.random() * 100),
                    caption: 'This is a dummy caption.',
                    dateTime: new Date().toLocaleString(),
                };
                imageList.push(test);
            }
            setImages(imageList);
        }
    };

    // Handle image selection
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };

    // Handle logout
    const handleLogout = (event) => {
        localStorage.setItem("loggedIn", "false");
        localStorage.removeItem('username');
        window.location.reload('/login');
    };

    // Handle image upload
    const handleUpload = () => {
        if (selectedImage && websocket && websocket.readyState === WebSocket.OPEN) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result.split(',')[1];
                console.log("sending data");
                websocket.send(JSON.stringify({ image: base64Image }));
            };
            reader.readAsDataURL(selectedImage);

            const newImage = {
                src: URL.createObjectURL(selectedImage),
                likes: 0,
                caption: 'Newly uploaded image.',
                dateTime: new Date().toLocaleString(),
            };

            setnewwImage(newImage);
            setImages([newImage, ...images]);
            setSelectedImage(null);
        } else {
            console.error("WebSocket is not open or ready");
        }
    };

    // Handle comment change
    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    // Handle adding a comment
    const handleAddComment = (index) => {
        setComments([...comments, { index, text: newComment }]);
        setNewComment('');
    };

    // Handle navigation toggle
    const handleToggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    // Handle video upload
    const handleUploadVideo = () => {
        if (videoFile && websocket && websocket.readyState === WebSocket.OPEN) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const sendFrames = () => {
                const currentTime = video.currentTime;
                if (currentTime < video.duration) {
                    video.pause();
                    video.currentTime = currentTime + 1 / 30;

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const frameDataUrl = canvas.toDataURL('image/jpeg');

                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64Frame = reader.result.split(',')[1];
                        websocket.send(JSON.stringify({ image: base64Frame }));
                    };
                    reader.readAsDataURL(dataURLtoBlob(frameDataUrl));

                    video.play();
                } else {
                    video.pause();
                }
            };

            video.addEventListener('loadedmetadata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                sendFrames();
            });

            video.src = URL.createObjectURL(videoFile);
            video.load();
            video.play();
        } else {
            console.error("WebSocket is not open or ready");
        }
    };

    // Convert dataURL to Blob
    const dataURLtoBlob = (dataURL) => {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    return (
        <div className="social-media-container">
            {/* Navbar component */}
            <Navbar
                handleImageChange={handleImageChange}
                handleUpload={handleUpload}
                handleToggleNav={handleToggleNav}
                handleUploadVideo={handleUploadVideo}
                handleLogout={handleLogout}
            />
            {/* Sidebar component */}
            <Sidebar />
            <div className="main-content">
                <div className="post-container">
                    {/* Render each post using the PostContainer component */}
                    {images.map((post, index) => (
                        <PostContainer
                            key={index}
                            post={post}
                            index={index}
                            newComment={newComment}
                            comments={comments}
                            handleCommentChange={handleCommentChange}
                            handleAddComment={handleAddComment}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
