import React, { useState } from "react";
import "./UploadImage.css";
import Loader from "./Loader";

export default function UploadImage() {
  const [detections, setDetections] = useState(0);
  const [detected, setDetected] = useState(false);
  const [loading, setLoading] = useState(false);

  const draw_image_and_boxes = (file, boxes) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.querySelector("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 3;
      ctx.font = "18px serif";
      setDetections(boxes.length);
      boxes.forEach(([x1, y1, x2, y2, label]) => {
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.fillStyle = "#00ff00";
        const width = ctx.measureText(label).width;
        ctx.fillRect(x1, y1, width + 10, 25);
        ctx.fillStyle = "#000000";
        ctx.fillText(label, x1, y1 + 18);
      });
    };
  };

  const imageUploadHandler = async (event) => {
    setLoading(() => true);
    const file = event.target.files[0];
    const data = new FormData();
    data.append("image_file", file, "image_file");
    try {
      const response = await fetch("http://localhost:8081/detect", {
        method: "post",
        body: data,
      });
      const boxes = await response.json();
      draw_image_and_boxes(file, boxes);
    } catch (err) {
      console.log("error in /detect route");
      console.log(err);
      draw_image_and_boxes(file, []);
    } finally {
      setLoading(() => false);
      setDetected(true);
    }
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <label className="custom-file-upload">
        <input id="uploadInput" type="file" onChange={imageUploadHandler} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
            stroke="#fffffff"
            strokeWidth="2"
          ></path>
          <path
            d="M17 15V18M17 21V18M17 18H14M17 18H20"
            stroke="#fffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        ADD IMAGE
      </label>
      {loading && <Loader />}
      {detected && (
        <h4
          style={{
            fontFamily: `'-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif'`,
            color: "#ffffff",
          }}
        >
          Identified damages: {detections}
        </h4>
      )}
      <canvas
        style={{
          display: "block",
          border: "1px solid #488aec",
          height: "50vh",
          width: "100vh",
          borderRadius: "8px",
          marginTop: "5vh",
        }}
      ></canvas>
    </div>
  );
}
