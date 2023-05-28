import React, { useState } from 'react';
import { Button, Input } from 'antd';
import axios from 'axios';

const { TextArea } = Input;

interface Message {
  role: string;
  content: string | object; // Update the type of content to allow for objects
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleMessageSubmit = async () => {
    if (inputValue.trim() !== '') {
      const newMessage: Message = {
        role: 'user',
        content: inputValue.trim(),
      };
      const updatedMessages = [...messages, newMessage]; // Add the new message to the conversation history
      setMessages(updatedMessages);
      setInputValue('');

      try {
        const response = await axios.post('http://141.94.97.170:8027/chat', updatedMessages); // Send all messages
        const responseData = response.data;
        const receivedMessage: Message = {
          role: 'bot',
          content: responseData.message.content,
        };
        setMessages([...updatedMessages, receivedMessage]); // Add the received message to the conversation history
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const renderMessageContent = (content: string | object) => {
    if (typeof content === 'string') {
      return content;
    } else {
      // Handle rendering of object content
      return JSON.stringify(content);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <span>{message.role === 'user' ? 'User: ' : 'Bot: '}</span>
            {renderMessageContent(message.content)}
          </div>
        ))}
      </div>
      <TextArea rows={4} value={inputValue} onChange={handleInputChange} />
      <Button type="primary" onClick={handleMessageSubmit} style={{ marginTop: '10px' }}>
        Send
      </Button>
    </div>
  );
};

export default Chatbox;

