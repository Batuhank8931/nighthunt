import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code"; // Use named import from react-qr-code
import API from "../../utils/utilRequest";
import GamerNumber from "./get_gamerNumber.jsx";

function CurrentGame({ handleDeleteRoom }) {
    const [roomname, setRoomName] = useState("");
    const [currentroom, setCurrentRoom] = useState("");
    const [qrCode, setQrCode] = useState(null);
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username"); // Get username from localStorage
    const userid = localStorage.getItem("userid"); // Get username from localStorage

    const handleNameChange = (e) => {
        setRoomName(e.target.value);
    };

    const generateGame = async () => {
        console.log(userid)
        try {
            const response = await API.createroom({
                useruniqueId: userid,
                username: username,
                room_name: roomname,
            });

            if (response.status === 200) {
                localStorage.setItem("roomid", response.data.roomData.uniqueId);
                localStorage.setItem("room_name", response.data.roomData.room_name);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error creating game:", error);
        }
    };

    const getRoom = async () => {
        try {
            const response = await API.getroom(userid);
            if (response.data.rooms && response.data.rooms.length > 0) {
                setCurrentRoom(response.data.rooms);
                const fullUrl = `${window.location.origin}/gamerpage/${response.data.rooms[0].uniqueId}/${response.data.rooms[0].room_name}`;
                console.log(fullUrl);
                setQrCode(fullUrl);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
        getRoom();
    }, []);

    return (
        currentroom.length > 0 ? (
            <div>
                <h2 className="text-center text-secondary mb-4">Mevcut Oyun</h2>
                {currentroom.map((room, index) => (
                    <div key={index} className="p-4 mb-3 rounded-3 border border-2 border-light shadow-lg bg-light transition-all duration-300 hover:scale-105">
                        <p className="mb-1"><strong>Username:</strong> {room.username}</p>
                        <p className="mb-1"><strong>Room Name:</strong> {room.room_name}</p>
                        <p className="mb-1"><strong>Unique ID:</strong> {room.uniqueId}</p>
                        <p className="mb-1"><strong>Created At:</strong> {new Date(room.createdAt).toLocaleString()}</p>
                        <GamerNumber />
                        <button onClick={() => handleDeleteRoom(room.uniqueId)} className="btn btn-danger mt-2 w-100">
                            <i className="bi bi-trash-fill"></i> Odayı Sil
                        </button>
                    </div>
                ))}
                {qrCode && (
                    <div className="d-flex justify-content-center mt-3 animate__animated animate__fadeIn">
                        <QRCode value={qrCode} size={180} />
                    </div>
                )}
            </div>
        ) : (
            <div>
                <h2 className="text-center text-success mb-4">Oyun Kur</h2>
                <div className="mb-4">
                    <label htmlFor="nameInput" className="form-label fw-semibold text-muted">Oda Adı:</label>
                    <input
                        type="text"
                        id="nameInput"
                        className="form-control rounded-3 shadow-sm transition-all duration-300 focus:ring focus:ring-primary"
                        value={roomname}
                        onChange={handleNameChange}
                        placeholder="...."
                    />
                </div>
                <button onClick={generateGame} className="btn btn-success w-100 shadow-lg rounded-3 py-3 fw-semibold transition-all duration-300 hover:scale-105">
                    Oyun Kur
                </button>
                {qrCode && (
                    <div className="d-flex justify-content-center mt-5 animate__animated animate__fadeIn">
                        <QRCode value={qrCode} size={180} />
                    </div>
                )}
            </div>
        )
    );
}

export default CurrentGame;
