import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom';
import ChatBox from './ChatBox';

const ChatHome = () => {
    const [connection, setConnection] = useState(null);
    const [usermessages, setUserMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const [chatRole, setChatRole] = useState('student');
    const [chatRoom, setChatRoom] = useState('General');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connection) {
            connection.on("ReceiveMessage", (userWithRole, message) => {
                setUserMessages(prevMessages => [...prevMessages, { user: userWithRole, message }]);
            });

            connection.onclose(() => {
                console.log("Connection closed");
            });
        }
    }, [connection]);

    const joinChatRoom = async (userName, chatRoom, chatRole) => {
        setLoading(true);
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5003/chat")//replce your backend Url
            .configureLogging(LogLevel.Information)
            .build();

        await connection.start();
        await connection.invoke("JoinChatRoom", userName, chatRoom, chatRole);
        setConnection(connection);
        setLoading(false);
    };

    const leaveChatRoom = async () => {
	if (connection) {
	    await connection.invoke("LeaveChatRoom", userName, chatRoom);
	    await connection.stop();
	    setConnection(null);
	    setUserMessages([]);
	    setUserName('');
	    setChatRoom('');
	    setChatRole('');
	}
    };

    const sendMessage = async (message) => {
        if (connection) {
            await connection.invoke("SendMessage", chatRoom, userName, chatRole,  message);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <main className="container flex-grow mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white">Connecting to chat room...</p>
                    </div>
                ) : (
                    connection ? (
                        <>
			    <ChatRoom usermessages={usermessages.slice(-30)} />
                            <ChatBox sendMessage={sendMessage} />
			    <button onClick={leaveChatRoom} className="mt-4 text-white bg-red-500 hover:bg-red-700 rounded-lg px-4 py-2">
				Leave Chat Room
			    </button>
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-screen bg-gray-900">
                            <div className="w-full max-w-lg p-8 mx-4 bg-white rounded-lg shadow-lg md:mx-auto">
                                <div>
				<label htmlFor="role" className="text-gray-700">Name</label>
				<input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
				</div>
				<div>
					<label htmlFor="role" className="text-gray-700">Room:</label>
					<select
						id="role"
						value={chatRoom}
						onChange={(e) => setChatRoom(e.target.value)}
						className="mt-2 p-2 bg-white border border-gray-300 rounded"
						>
						<option value="General">General</option>
						<option value="Announcement">Announcement</option>
					</select>
				</div>
                                <div>
					<label htmlFor="role" className="text-gray-700">Role:</label>
					<select
						id="role"
						value={chatRole}
						onChange={(e) => setChatRole(e.target.value)}
						className="mt-2 p-2 bg-white border border-gray-300 rounded"
						>
						<option value="student">Student</option>
						<option value="teacher">Teacher</option>
					</select>
				</div>
                                <button onClick={() => joinChatRoom(userName, chatRoom, chatRole)}>Join Chat Room</button>
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default ChatHome;