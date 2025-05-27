import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../../utils/utilRequest";

function GamerNumber() {
    const [gamerCount, setGamerCount] = useState(null);
    const username = localStorage.getItem("username");
    const roomid = localStorage.getItem("roomid");
    const userid = localStorage.getItem("userid"); // Get username from localStorage

    const getRoom = async () => {
        try {
            const response = await API.getroom(userid);
            if (response.data.rooms && response.data.rooms.length > 0) {
                setGamerCount(response.data.gamers.length);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
        getRoom();
    }, []);

    useEffect(() => {
        const socket = io("http://192.168.1.5:3050");

        if (roomid) {
            socket.emit("joinRoom", roomid);
        }

        socket.on("gamerCount", (count, receivedRoomid) => {
            if (roomid === receivedRoomid) {
                setGamerCount(count);

            }
        });

        return () => {
            socket.disconnect();
        };
    }, [roomid]);

    return (
        <div>
            <p className="mb-1">
                <strong>Oyuncu Sayısı: </strong> {gamerCount !== null ? gamerCount : "Loading..."}
            </p>
        </div>
    );
}

export default GamerNumber;
