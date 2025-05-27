import React, { useState, useEffect } from "react";
import API from "../../utils/utilRequest";
import GamerList from "./get_gamerData";

function GamersofRoom({ }) {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username"); // Get username from localStorage
    const [currentroom, setCurrentRoom] = useState("");


    const getRoom = async () => {
        try {
            const response = await API.getroom(username);
            if (response.data.rooms && response.data.rooms.length > 0) {
                setCurrentRoom(response.data.rooms);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
        getRoom();
    }, []);

    return (
        <div>
            <h2 className="text-center text-primary mb-4">Oyuncular</h2>
            {/* Add your players' content here */}
            <p>Oyuncular burada listelenecek...</p>
            <GamerList></GamerList>
        </div>
    );
}

export default GamersofRoom;
