import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, List, Typography, Popconfirm, Row, Col } from 'antd';
import { DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ScaleLoader } from 'react-spinners';

const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  id: number;
  role: string;
  content: string | object;
  timestamp: number;
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [messageIdToRemove, setMessageIdToRemove] = useState<number | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set default theme to dark

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const generateMessageId = () => {
    return Date.now(); // Simple way to generate unique message IDs, can be replaced with UUID or other solutions
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      setIsBotTyping(true);

      const handleBotResponse = async () => {
        try {
          const response = await axios.post('http://141.94.97.170:8027/chat', messages);
          const responseData = response.data;
          const receivedMessage: Message = {
            id: generateMessageId(),
            role: 'bot',
            content: responseData.message.content,
            timestamp: Date.now(),
          };
          const updatedMessages = [...messages, receivedMessage];
          setMessages(updatedMessages);
          setIsBotTyping(false);
        } catch (error) {
          console.error('Error:', error);
        }
      };

      const typingTimer = setTimeout(handleBotResponse, 1500);

      return () => clearTimeout(typingTimer);
    }
  }, [messages]);

  const handleMessageSubmit = () => {
    if (inputValue.trim() !== '') {
      const newMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content: inputValue.trim(),
        timestamp: Date.now(),
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInputValue('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleMessageSubmit();
    }
  };

  const handleRemoveMessage = (messageId: number) => {
    const updatedMessages = messages.filter((message) => message.id !== messageId);
    setMessages(updatedMessages);
  };

  const handleClearDiscussion = () => {
    setMessages([]);
  };

  const renderMessageContent = (content: string | object) => {
    if (typeof content === 'string') {
      return <ReactMarkdown>{content}</ReactMarkdown>;
    } else {
      return JSON.stringify(content);
    }
  };

  const renderMessageTimestamp = (timestamp: number) => {
    const messageDate = new Date(timestamp);
    const formattedTimestamp = messageDate.toLocaleString(); // Format the timestamp as desired

    return <div style={timestampStyle}>{formattedTimestamp}</div>;
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDownloadDiscussion = () => {
    const jsonContent = JSON.stringify(messages);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'discussion.json';
    link.click();
  };

  const handleUploadDiscussion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const parsedMessages = JSON.parse(content);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: isDarkMode ? '#1f2937' : '#edf2f7',
    color: isDarkMode ? 'white' : 'black',
    padding: '20px',
    fontFamily: 'sans-serif',
  };

  const chatContainerStyle: React.CSSProperties = {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'flex-start',
    position: 'relative',
    overflowY: 'auto',
    flex: 1,
  };

  const chatBubbleStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#4299e1' : '#a0c3ff',
    color: isDarkMode ? 'white' : 'black',
    borderRadius: '5px',
    position: 'relative',
    alignSelf: 'flex-end',
    wordWrap: 'break-word',
  };

  const typingIndicatorStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#f7fafc' : '#edf2f7',
    color: isDarkMode ? 'black' : 'white',
    padding: '10px',
    borderRadius: '5px',
    alignSelf: 'flex-end',
    display: 'flex',
    alignItems: 'center',
  };

  const timestampStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    right: '0',
    fontSize: '12px',
    color: isDarkMode ? 'white' : 'black',
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    marginTop: '10px',
  };

  const clearButtonStyle: React.CSSProperties = {
    marginLeft: '10px',
    color: isDarkMode ? 'white' : 'black',
  };

  const modeButtonStyle: React.CSSProperties = {
    marginLeft: '10px',
    color: isDarkMode ? 'white' : 'black',
  };

  const downloadButtonStyle: React.CSSProperties = {
    marginLeft: '10px',
    color: isDarkMode ? 'white' : 'black',
  };

  const uploadButtonStyle: React.CSSProperties = {
    marginLeft: '10px',
    color: isDarkMode ? 'white' : 'black',
  };

  return (
    <div style={containerStyle}>
      <div ref={chatContainerRef} style={chatContainerStyle}>
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item
              key={message.id}
              style={message.role === 'user' ? { ...chatContainerStyle, justifyContent: 'flex-end' } : chatContainerStyle}
              onMouseEnter={() => setMessageIdToRemove(message.id)}
              onMouseLeave={() => setMessageIdToRemove(null)}
            >
              <div
                style={message.role === 'user' ? { ...chatBubbleStyle, backgroundColor: isDarkMode ? '#667EEA' : '#93C5FD' } : chatBubbleStyle}
              >
                <Text strong>{message.role === 'user' ? 'User: ' : 'Bot: '}</Text>
                <div style={timestampStyle}>{renderMessageTimestamp(message.timestamp)}</div>
                {renderMessageContent(message.content)}
                {messageIdToRemove === message.id && (
                  <Popconfirm
                    title="Are you sure you want to remove this message?"
                    onConfirm={() => handleRemoveMessage(message.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      style={{ position: 'absolute', top: '5px', right: '5px', color: 'white' }}
                    />
                  </Popconfirm>
                )}
              </div>
            </List.Item>
          )}
        />
        {isBotTyping && (
          <List.Item style={chatContainerStyle}>
            <div style={typingIndicatorStyle}>
              <Text strong>Bot: </Text>
              <ScaleLoader color={isDarkMode ? '#000' : '#fff'} loading={true} height={10} width={2} radius={2} />
            </div>
          </List.Item>
        )}
      </div>
      <div style={inputContainerStyle}>
        <TextArea
          rows={1}
          autoSize={{ minRows: 1, maxRows: 6 }}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
          style={{ resize: 'none', flex: 1 }}
        />
        <Button type="primary" onClick={handleMessageSubmit}>
          Send
        </Button>
      </div>
      <Row justify="space-between" style={{ marginTop: '10px' }}>
        <Col>
          <Button type="link" onClick={handleClearDiscussion} style={clearButtonStyle}>
            Clear Discussion
          </Button>
          <Button type="link" onClick={handleDarkModeToggle} style={modeButtonStyle}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Col>
        <Col>
          <Button type="link" onClick={handleDownloadDiscussion} style={downloadButtonStyle} icon={<DownloadOutlined />}>
            Download Discussion
          </Button>
          <input type="file" accept=".json" onChange={handleUploadDiscussion} style={{ display: 'none' }} />
          <Button
            type="link"
            onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement)?.click()}
            style={uploadButtonStyle}
            icon={<UploadOutlined />}
          >
            Upload Discussion
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Chatbox;
