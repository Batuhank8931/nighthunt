import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../../utils/utilRequest";
import { Modal, Button } from "react-bootstrap";
import DeleteUserModal from "../../modals/deleteusermodal";

function GamerList() {
    const [gamers, setGamers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGamer, setSelectedGamer] = useState(null);

    const roomid = localStorage.getItem("roomid");
    const userid = localStorage.getItem("userid");

    const getRoom = async () => {
        try {
            const response = await API.getroom(userid);
            if (response.data.gamers) {
                setGamers(response.data.gamers);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
        getRoom();
    }, []);

    const handleDelete = async () => {
        if (!selectedGamer) return;
        try {
            await API.deleteGamer(selectedGamer.uniqgamerId);
            setGamers(gamers.filter(gamer => gamer.uniqgamerId !== selectedGamer.uniqgamerId));
        } catch (error) {
            console.error("Error deleting gamer:", error);
        }
        setShowModal(false);
    };

    useEffect(() => {
        const socket = io("http://192.168.1.5:3050");

        if (roomid) {
            socket.emit("joinRoom", roomid);
        }

        socket.on("gamerData", (updatedGamers, receivedRoomid) => {
            if (roomid === receivedRoomid) {
                setGamers(updatedGamers);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [roomid]);

    return (
        <div className="container mt-4">
            <div className="card bg-dark text-white">
                <div className="card-body">
                    <h3 className="card-title text-center mb-4">🎮 Gamer List</h3>
                    {gamers.length > 0 ? (
                        <div className="list-group" style={{ maxHeight: "400px", overflowY: "auto" }}>
                            {gamers.map((gamer, index) => (
                                <div key={index} className="list-group-item d-flex align-items-center justify-content-between bg-secondary text-white mb-2 rounded">
                                    <img
                                        src={gamer.imageUrl}
                                        alt={gamer.gamername}
                                        className="rounded-circle"
                                        style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "15px" }}
                                    />
                                    <span className="font-weight-bold">{gamer.gamername}</span>
                                    <button
                                        onClick={() => { setSelectedGamer(gamer); setShowModal(true); }}
                                        className="btn btn-outline-danger btn-sm ml-auto"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-light" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <DeleteUserModal setShowModal={setShowModal} handleDelete={handleDelete}></DeleteUserModal>
            )}
        </div>
    );
}

export default GamerList;
