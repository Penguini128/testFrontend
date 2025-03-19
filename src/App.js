import React, { useState } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useSpeechSynthesis } from "react-speech-kit";

const App = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [error, setError] = useState(null);
    const { speak } = useSpeechSynthesis();
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const startListening = () => SpeechRecognition.startListening({ continuous: true });

    const handleSend = async () => {
        const promptText = input;

        if (!promptText.trim()) return; // Prevent empty requests

        try {
            setError(null); // Clear previous errors
            setResponse("Thinking..."); // Show loading state

            const res = await axios.post("http://localhost:5001/chat", { prompt: promptText });

            const aiResponse = res.data.choices[0].message.content;
            setResponse(aiResponse); // Display AI response
            speak({ text: aiResponse }); // Read response aloud

            // Reset input
            resetTranscript();
            setInput("");
        } catch (error) {
            console.error("Error:", error);
            setError("Failed to fetch response. Please try again.");
            setResponse("");
        }
    };

    const startRecording = async () => {
        resetTranscript();
        setInput("");
        startListening();
    };

    const stopRecording = async () => {
        SpeechRecognition.stopListening(); 
        setInput(transcript);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", textAlign: "center" }}>
            <h2>LLM Conversational Tool</h2>

            {/* Input Area */}
            <textarea
                value={transcript || input}
                onChange={(e) => setInput(e.target.value)}
                rows="3"
                placeholder="Type or speak your message..."
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />

            {/* Action Buttons */}
            <div>
                <button onClick={handleSend} style={{ marginRight: "10px" }}>Send</button>
                <button onClick={listening ? stopRecording : startRecording}>
                    {listening ? "Stop Listening" : "Start Listening"}
                </button>
            </div>

            {/* Response Display */}
            {response && <p><strong>Response:</strong> {response}</p>}

            {/* Error Handling */}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default App;
