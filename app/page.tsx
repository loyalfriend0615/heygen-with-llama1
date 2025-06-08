"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType
} from "@heygen/streaming-avatar";

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)

  // Initialize streaming avatar session
  async function initializeAvatarSession() {
    try {
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

      const newSessionData = await newAvatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: "Alessandra_Grey_Sweater_public",
      });

      setAvatar(newAvatar);
      setSessionData(newSessionData);
      console.log("Session data:", newSessionData);

    } catch (error) {
      console.error("Failed to initialize avatar session:", error);
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
    } else {
      console.error("Stream is not available");
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
    await avatar.stopAvatar();
    const videoElement = document.getElementById("avatarVideo") as HTMLVideoElement;
    if (videoElement) {
      videoElement.srcObject = null;
    }
    setAvatar(null);
    setSessionData(null);
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (avatar && input.trim()) {
      try {
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
      }
      
      setInput("")
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
                disabled={avatar !== null}
                className={`font-inter text-sm ${
                  !avatar
                    ? "bg-[#92278F] hover:bg-[#7a1f78] text-white"
                    : "border-[#92278F] text-[#92278F] hover:bg-[#92278F] hover:text-white"
                }`}
              >
                Start Session
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
                disabled={!input.trim() || !avatar}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}