import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage"; // helper crop ảnh
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = async () => {
    try {
      let formData = new FormData();
      formData.append("name", name);

      if (file) {
        const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);
        formData.append("avatar", croppedBlob, "avatar.jpg");
      }

      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) =>
            setProgress(Math.round((p.loaded * 100) / p.total)),
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data));
      alert("Cập nhật thành công!");
      navigate("/home");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Cập nhật thất bại!");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa hồ sơ</h2>

      <div className="relative w-32 h-32 mb-4">
        <img
          src={avatar || preview || "/default-avatar.png"}
          alt="avatar"
          className="w-32 h-32 rounded-full object-cover border"
        />
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-3"
      />

      {preview && (
        <div className="relative w-64 h-64 bg-gray-100 mb-4">
          <Cropper
            image={preview}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
      )}

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên hiển thị"
        className="border px-3 py-2 rounded w-full mb-4"
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        Lưu thay đổi
      </button>
    </div>
  );
}
