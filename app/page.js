'use client'
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi there! What are you in the mood for today? 🍔`,
    }
  ]);
  const [message, setMessage] = useState('');
  const [chatVisible, setChatVisible] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
  };

  return (
    <Box
      width={'100vw'}
      height={'100vh'}
      display={'flex'}
      flexDirection={'column'}
      sx={{
        background: 'linear-gradient(to bottom, #ffebee, #ffccbc)',
        padding: 3,
        position: 'relative',
      }}
    >
      {/* Navigation Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: '#ff5722',
          color: 'white',
        }}
      >
        <Typography variant="h6">
          Bitebox
        </Typography>
        <Stack direction={'row'} spacing={2}>
          <Button variant="contained" color="warning">
            Login
          </Button>
          <Button variant="contained" color="warning">
            Signup
          </Button>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box
        flexGrow={1}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        sx={{ position: 'relative' }}
      >
        {/* Quickbite Button */}
        <Button
          variant="contained"
          color="warning"
          onClick={() => setChatVisible(!chatVisible)}
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '50px',
            padding: '10px 20px',
            fontSize: '16px',
            boxShadow: 3,
          }}
        >
          {chatVisible ? 'Close Chat' : 'Quickbite'}
        </Button>

        {/* Chat Box */}
        {chatVisible && (
          <Stack
            direction={'column'}
            width={'500px'}
            height={'600px'}
            sx={{
              borderRadius: 4,
              boxShadow: 3,
              backgroundColor: '#fff3e0', // Light background color
              zIndex: 2,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#ff5722', // Primary color for header
                color: 'white',
                padding: 2,
                textAlign: 'center',
                borderBottom: '1px solid #ff7043',
              }}
            >
              <Typography variant="h6" component="div">
                Bitebox AI 🍕
              </Typography>
            </Box>
            <Stack
              direction={'column'}
              spacing={2}
              flexGrow={1}
              overflow={'auto'}
              maxHeight={'100%'}
              p={2}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display={'flex'}
                  justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                >
                  <Box
                    sx={{
                      bgcolor: message.role === 'assistant' ? '#ffccbc' : '#ffab91', // Different colors for assistant and user
                      color: 'black',
                      borderRadius: 3,
                      boxShadow: 1,
                      p: 2,
                      maxWidth: '75%',
                      wordWrap: 'break-word',
                    }}
                    whiteSpace="pre-line" // Enable handling of line breaks
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction={'row'} spacing={2} p={2} sx={{ borderTop: '1px solid #ffab91' }}>
              <TextField
                label="Enter a message"
                fullWidth
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{ backgroundColor: '#fff3e0' }}
              />
              <Button variant="contained" color="warning" onClick={sendMessage}>
                Send
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
