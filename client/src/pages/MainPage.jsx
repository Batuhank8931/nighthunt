import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../utils/utilRequest";
import CurrentGame from "../components/mainPage/roomcard.jsx";
import GamersofRoom from "../components/mainPage/gamerlistcard.jsx";
import DeleteRoomModal from "../modals/deleteroommodal.jsx";
import GamerCard from "../components/mainPage/gamercard.jsx";

function MainPage() {
  const [showModal, setShowModal] = useState(false); // State to show modal
  const [roomToDelete, setRoomToDelete] = useState(null); // Room to delete
  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState("room");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate("/login"); // Redirect to login page after logout
  };


  const handleDeleteRoom = (roomId) => {
    console.log(roomId);
    setRoomToDelete(roomId); // Set the room to be deleted
    setShowModal(true); // Show the confirmation modal
  };

  const confirmDeleteRoom = async () => {
    try {
      const response = await API.deleteroom(roomToDelete);
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column align-items-center bg-secondery">
      {/* Heading */}
      <h1 className="text-center fw-bold display-4 text-primary mt-3 animate__animated animate__fadeIn">OYUN OLUŞTUR</h1>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="btn btn-danger m-3 shadow-lg rounded-3 animate__animated animate__fadeInUp"
      >
        Logout
      </button>

      {/* Active Game Section */}
      <div className="card w-100 p-4 mb-4 shadow-xl border-0 rounded-4 animate__animated animate__fadeIn">
        {/* Tab Menu */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "room" ? "active" : ""}`} onClick={() => setActiveTab("room")}>
              Mevcut Oyun
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              Profil
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "players" ? "active" : ""}`} onClick={() => setActiveTab("players")}>
              Oyuncular
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "gamepaley" ? "active" : ""}`} onClick={() => setActiveTab("game")}>
              Oyun
            </button>
          </li>

        </ul>

        {/* Active Game Section */}
        {activeTab === "room" && (
          <CurrentGame handleDeleteRoom={handleDeleteRoom}></CurrentGame>
        )}

        {/* Players Section */}
        {activeTab === "profile" && (
          <GamerCard></GamerCard>
        )}

        {activeTab === "players" && (
          <GamersofRoom></GamersofRoom>
        )}
      </div>

      {/* Modal for Confirmation */}
      {showModal && (
        <DeleteRoomModal setShowModal={setShowModal} confirmDeleteRoom={confirmDeleteRoom}></DeleteRoomModal>
      )}
    </div>
  );
}

export default MainPage;
