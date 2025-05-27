import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../../utils/utilRequest.js";

function GamerCard() {
    const [username, setUsername] = useState("");
    const [photo, setPhoto] = useState(null); // The photo will be a file object now
    const [photourl, setPhotoUrl] = useState(null); // The photo will be a file object now
    const [isReturningUser, setIsReturningUser] = useState(false);
    const [message, setMessage] = useState(""); // State for error message
    const navigate = useNavigate(); // Use navigate for redirection
    const roomid = localStorage.getItem("roomid");
    const room_name = localStorage.getItem("room_name");

    useEffect(() => {
        checkActive();
    }, []);

    const handlePhotoChange = (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            setPhoto(file); // Set photo as the file object
        }
    };

    const checkActive = async () => {
        try {
            const response = await API.getloginGamer();
            if (response.status === 200) {
                setIsReturningUser(true)
                setPhotoUrl(response.data.gamer.profileImageUrl);
                setUsername(response.data.gamer.gamername);
            }
        } catch (error) {
            console.log("Login error:", error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Create a FormData object to send the data, including the file
        const formData = new FormData();
        formData.append('gamername', username);  // Append gamername
        formData.append('roomid', roomid);      // Append roomid
        if (photo) {
            formData.append('profileImage', photo); // Append the file object (photo)
        }

        try {
            const response = await API.loginMainGamer(formData);
            if (response.status === 200) {
                window.location.reload();
            } else {
                setMessage(response.data.message || "Enter failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage(error.response?.data?.message || "Login failed. Check credentials.");
        }
    };

    const handleUpdateGamer = async (e) => {
        e.preventDefault();


        // Create a FormData object to send the data, including the file
        const formData = new FormData();
        formData.append('gamername', username);  // Append gamername
        formData.append('roomid', roomid);      // Append roomid

        if (photo) {
            formData.append('profileImage', photo); // Append the file object (photo)
            formData.append('profileImageUrl', photo.type);      // Append roomid
        }

        try {
            const response = await API.putloginGamer(formData);
            if (response.status === 200) {
                //window.location.reload();
            } else {
                setMessage(response.data.message || "Enter failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage(error.response?.data?.message || "Login failed. Check credentials.");
        }
    };


    return (
        <div
            className="card p-4 shadow-lg border-0 text-center"
            style={{
                borderRadius: "20px",
                background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                color: "white",
            }}
        >
            <h2 className="mb-3 fw-bold">Odaya Katıl!</h2>
            <p className="text-light">
                Oda: <span className="fw-bold">{room_name}</span>
            </p>

            {/* Kullanıcı adı alanı */}
            <input
                type="text"
                className="form-control mb-3 text-center"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ borderRadius: "10px", border: "none", height: "45px" }}
            />


            {/* Fotoğraf alanı sadece yeni kullanıcılar için */}
            <>
                <label
                    htmlFor="photoUpload"
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: "2px dashed white",
                        margin: "10px auto",
                    }}
                >
                    {photo ? (
                        <img
                            src={URL.createObjectURL(photo)}
                            alt="Profil"
                            className="img-fluid"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : photourl ? (
                        <img
                            src={photourl}
                            alt="Profil"
                            className="img-fluid"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <span className="text-light">Fotoğraf Yükle</span>
                    )}

                </label>
                <input
                    type="file"
                    id="photoUpload"
                    className="d-none"
                    accept="image/*"
                    onChange={handlePhotoChange}
                />
            </>

            {/* Giriş / Kayıt Butonu */}

            <button
                className="btn w-100 mt-3"
                onClick={isReturningUser ? handleUpdateGamer : handleLogin}
                style={{
                    backgroundColor: "white",
                    color: "#2575fc",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    height: "45px",
                    transition: "0.3s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#e3e3e3")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
            >
                {isReturningUser ? "Değişikliği Kaydet" : "Kayıt Ol"}
            </button>
            {message && <p className="text-danger mt-3">{message}</p>}
        </div>
    );
}

export default GamerCard;
