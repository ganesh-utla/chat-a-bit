import React, { useEffect, useRef, useState } from 'react'
import LeftSideBar from '../shared/LeftSideBar'
import RightSideBar from '../shared/RightSideBar'
import { baseUrl } from '../../utils'
import { io } from 'socket.io-client';

const Message = ({ value, isIncoming=false }) => {
  return (
    <div className={`w-full flex ${isIncoming? 'justify-start' : 'justify-end'}`}>
      <div className={`xs:max-w-[60%] text-light-1 ${isIncoming? 'bg-stone-400' : 'bg-primary-500'} py-2 px-3 rounded-b-lg ${isIncoming? 'rounded-tr-lg' : 'rounded-tl-lg'}`}>
        {value}
      </div>
    </div>
  )
}

const MainPage = () => {

  const currentUser = JSON.parse(localStorage.getItem("user:details"));
  const [conversations, setConversations] = useState([]);
  const [messagesData, setMessagesData] = useState(null);
  const [currMessage, setCurrMessage] = useState("");
  const [people, setPeople] = useState([]);
  const [socket, setSocket] = useState(null);
  const endMessageRef = useRef(null);

  useEffect(() => {
    setSocket(io('http://localhost:8081/'));
  }, []);

  useEffect(() => {
    socket?.emit('addUser', currentUser.id);
    socket?.on('getMessage', data => {
      setMessagesData(prev => ({
        ...prev,
        messages: [...prev?.messages, { user: data.user, message: data.message }]
      }))
    })
  }, [socket]);

  useEffect(() => {
    endMessageRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  const getUsers = async () => {
    const res = await fetch(`${baseUrl}/api/users/${currentUser?.id}`);
    if (res.status!==200) return;
    const resData = await res.json();
    setPeople(resData);
  }

  const getConversations = async () => {
    const res = await fetch(`${baseUrl}/api/conversations/${currentUser?.id}`);
    if (res.status!==200) return;
    const resData = await res.json();
    setConversations(resData);
  }

  const getMessages = async (conversationId, user) => {
    const res = await fetch(`${baseUrl}/api/messages/${conversationId}?` + new URLSearchParams({
      senderId: currentUser.id, 
      receiverId: user.id
    }));
    if (res.status!==200) return;
    const resData = await res.json();
    setMessagesData({messages: resData, receiver: user, conversationId });
  }

  const sendMessage = async () => {
    socket.emit('sendMessage', {
      conversationId: messagesData.conversationId, 
      senderId: currentUser.id, 
      message: currMessage, 
      receiverId: messagesData.receiver.id
    });
    const res = await fetch(`${baseUrl}/api/message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId: messagesData.conversationId, 
        senderId: currentUser.id, 
        message: currMessage, 
        receiverId: messagesData.receiver.id
      })
    });
    if (res.status!==200) return;
    setCurrMessage("");
  }

  useEffect(() => {
    getConversations();
    getUsers();
  }, []);

  return (
    <div className='flex h-screen w-full'>
      <LeftSideBar currentUser={currentUser} conversations={conversations} getMessages={getMessages} />
      
      {messagesData? (
        <div className='w-1/2 flex flex-col justify-between items-center p-4 gap-5'>

          <div className='w-1/2 bg-gray-200 flex shadow-md justify-between items-center px-5 py-3 rounded-full'>
            <div className='flex items-center gap-5'>
              <img
                  src="/assets/icons/profile-placeholder.svg"
                  className='w-10 h-10 object-contain'
              />
              <div>
                <p className='text-xl font-semibold'>
                  {messagesData?.receiver.fullname}
                </p>
                <p className="text-md text-gray-1">
                  {messagesData?.receiver.email}
                </p>
              </div>
            </div>
            <div className='shadow-md bg-gray-100 rounded-full p-2 cursor-pointer'>
              <img
                  src="/assets/icons/outgoing-call.svg"
                  className='w-7 h-7 object-contain'
              />
            </div>
          </div>

          {messagesData.messages.length===0? (
            <div className='flex flex-col w-full gap-2 h-[10%] flex-grow rounded-lg p-3 justify-center items-center text-gray-1'>
              No messages
            </div>
          ) : (
            <div className='flex flex-col w-full gap-2 h-[10%] flex-grow rounded-lg p-3 overflow-auto'>
              {messagesData && messagesData.messages.map(({ user, message }, index) => (
                <div key={index}>
                  <Message value={message} isIncoming={user.id!==currentUser.id} />
                  <div ref={endMessageRef}></div>
                </div>
              ))}
            </div>
          )}

          <div className='w-full flex items-center gap-3'>
            <input 
              type='text'
              className='chat-input'
              placeholder='Type something...'
              value={currMessage}
              onChange={(e) => setCurrMessage(e.target.value)}
            />

            <button
              className='shadow-md rounded-full p-2 cursor-pointer disabled:cursor-not-allowed'
              disabled={currMessage===''}
              onClick={sendMessage}
            >
              <img
                  src="/assets/icons/send.svg"
                  className='w-7 h-7 object-contain'
              />
            </button>

            <button className='shadow-md rounded-full p-2 cursor-pointer'>
              <img
                  src="/assets/icons/attachclip.svg"
                  className='w-7 h-7 object-contain'
              />
            </button>
            
          </div>
        </div>
      ) : (
        <div className='w-1/2 flex flex-col justify-center items-center text-gray-1'>
          No conversations selected
        </div>
      )}
        


      <RightSideBar users={people} getMessages={getMessages} />
    </div>
  )
}

export default MainPage