"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType
} from "@heygen/streaming-avatar";

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  
  // Handle avatar start talking event
  const handleAvatarStartTalking = useCallback(() => {
    setIsProcessing(false)
  }, [])

  // Initialize streaming avatar session
  async function initializeAvatarSession() {
    try {
      setIsInitializing(true); // Start loading
      const apiKey = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
      const response = await fetch(
        "https://api.heygen.com/v1/streaming.create_token",
        {
          method: "POST",
          headers: { "x-api-key": apiKey || "" },
        }
      );
      const { data } = await response.json();
      const token = data.token;

      const newAvatar = new StreamingAvatar({ token });

      newAvatar.on(StreamingEvents.STREAM_READY, handleStreamReady);
      newAvatar.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);
      newAvatar.on(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);

      const newSessionData = await newAvatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: "Alessandra_Grey_Sweater_public",
      });

      setAvatar(newAvatar);
      setSessionData(newSessionData);
      console.log("Session data:", newSessionData);

    } catch (error) {
      console.error("Failed to initialize avatar session:", error);
      setIsInitializing(false); // Stop loading on error
    }
  }

  // Handle when avatar stream is ready
  function handleStreamReady(event: any) {
    const videoElement = document.getElementById("avatarVideo") as HTMLVideoElement;
    if (event.detail && videoElement) {
      videoElement.srcObject = event.detail;
      videoElement.onloadedmetadata = () => {
        videoElement.play().catch(console.error);
      };
      setIsInitializing(false); // Stop the loading state when stream is ready
    } else {
      console.error("Stream is not available");
      setIsInitializing(false); // Also stop loading on error
    }
  }

  function handleStreamDisconnected() {
    console.log("Stream disconnected");
    const videoElement = document.getElementById("avatarVideo") as HTMLVideoElement;
    if (videoElement) {
      videoElement.srcObject = null;
    }
    setAvatar(null);
    setSessionData(null);
  }

  async function terminateAvatarSession() {
    if (!avatar) return;

    // Remove event listeners
    avatar.off(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);

    await avatar.stopAvatar();
    const videoElement = document.getElementById("avatarVideo") as HTMLVideoElement;
    if (videoElement) {
      videoElement.srcObject = null;
    }
    setAvatar(null);
    setSessionData(null);
    setIsProcessing(false); // Reset processing state
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (avatar && input.trim() && !isProcessing) {
      try {
        setIsProcessing(true)
        setInput("") // Clear input after successful processing
        // Note: We don't set isProcessing to false here anymore
        // It will be set to false when the avatar starts talking
        const response = await fetch("/api", {
          method: "POST",
          body: JSON.stringify({ query: input }),
        })
        const data = await response.json()
        // Make the avatar speak the response
        await avatar.speak({
          text: data.message.content,
          taskType: TaskType.REPEAT,
        });
        console.log(data)
      }
      catch (error) {
        console.error("Error getting response:", error)
        setIsProcessing(false) // Reset processing state on error
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white rounded-t-lg">
          <div className="flex items-center justify-center space-x-3">
            <img
              src="/logo.png"
              alt="Chat Interface Logo"
              className="w-12 h-12 rounded-full border-2 border-white/20"
            />
            <CardTitle className="font-playfair text-2xl font-bold">Chat Interface</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <video 
              id="avatarVideo" 
              className={`w-full h-full object-cover ${!avatar ? 'hidden' : ''}`}
            />
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t border-gray-100">
          <div className="w-full space-y-3">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={avatar ? "outline" : "default"}
                onClick={initializeAvatarSession}
                disabled={avatar !== null || isInitializing}
                className={`font-inter text-sm ${
                  !avatar
                    ? "bg-[#92278F] hover:bg-[#7a1f78] text-white"
                    : "border-[#92278F] text-[#92278F] hover:bg-[#92278F] hover:text-white"
                }`}
              >
                {isInitializing ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Initializing...
                  </div>
                ) : (
                  'Start Session'
                )}
              </Button>
              <Button
                type="button"
                variant={avatar ? "default" : "outline"}
                onClick={terminateAvatarSession}
                disabled={avatar === null}
                className={`font-inter text-sm ${
                  avatar
                    ? "bg-black hover:bg-gray-800 text-white"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                End Session
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 font-inter border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
              />
              <Button
                type="submit"
                className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-6"
                disabled={!input.trim() || !avatar || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}