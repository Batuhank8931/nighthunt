import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../utils/utilRequest.js";
import { Modal, Button } from "react-bootstrap"; // Import Bootstrap modal

function GamerPage() {
  const { roomid, roomname } = useParams();
  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState(null); // The photo will be a file object now
  const [photourl, setPhotoUrl] = useState(null); // The photo will be a file object now
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [message, setMessage] = useState(""); // State for error message
  const navigate = useNavigate(); // Use navigate for redirection

  const [showModal, setShowModal] = useState(false);
  const [modalUsername, setModalUsername] = useState("");
  const [modalPhotoUrl, setModalPhotoUrl] = useState("");
  const [modaltoken, setModalToken] = useState("");

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
      const response = await API.loginGamer(formData);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
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
    }

    try {
      const response = await API.putloginGamer(formData);
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

  const handleoldGamer = async (e) => {
    e.preventDefault();

    try {
      const response = await API.getOldGamer({
        gamername: username,
        roomid: roomid,
      });

      if (response.status === 200) {
        setModalUsername(response.data.gamername);
        setModalPhotoUrl(response.data.imageUrl);
        setModalToken(response.data.token)
        setShowModal(true); // Show the modal

      } else {
        setMessage(response.data.message || "Enter failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.message || "Login failed. Check credentials.");
    }
  };

  const confirmIdentity = () => {
    setUsername(modalUsername);
    setPhotoUrl(modalPhotoUrl);
    setShowModal(false);
    localStorage.setItem("token", modaltoken);
    window.location.reload();
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card p-4 shadow-lg border-0 text-center"
        style={{
          maxWidth: "400px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #6a11cb, #2575fc)",
          color: "white",
        }}
      >
        <h2 className="mb-3 fw-bold">Odaya Katıl!</h2>
        <p className="text-light">
          Oda: <span className="fw-bold">{roomname}</span>
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
            capture="environment" 
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

        {!isReturningUser ? (
          <button
            className="btn w-100 mt-3"
            onClick={handleoldGamer}
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
            Kullanıcı Adı ile Giriş Yap
          </button>
        ) :
          <div></div>}

        {message && <p className="text-danger mt-3">{message}</p>}
      </div>
      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="rounded-5 p-4">
        <Modal.Body
          className="p-4 text-center rounded-1"
          style={{
            background: "linear-gradient(135deg, #6a11cb, #2575fc)",
            color: "white",
            borderRadius: "0.375rem", // Ensures border radius is applied correctly
            overflow: "hidden", // Ensures no border "bleeds" out
          }}
        >
          <h2 className="mb-3 fw-bold">Bu Sen Misin?</h2>
          <div
            className="mx-auto d-flex align-items-center justify-content-center"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid white",
            }}
          >
            <img
              src={modalPhotoUrl}
              alt="Profil Resmi"
              className="img-fluid"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <h4 className="mt-3">{modalUsername}</h4>
          <p className="text-light">Bu sen misin?</p>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button
              variant="light"
              className="px-4 py-2"
              style={{
                borderRadius: "10px",
                color: "#2575fc",
                fontWeight: "bold",
              }}
              onClick={() => setShowModal(false)}
            >
              Hayır
            </Button>
            <Button
              className="px-4 py-2"
              style={{
                backgroundColor: "white",
                color: "#2575fc",
                fontWeight: "bold",
                borderRadius: "10px",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#e3e3e3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
              onClick={confirmIdentity}
            >
              Evet, Benim
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </div >
  );
}

export default GamerPage;
