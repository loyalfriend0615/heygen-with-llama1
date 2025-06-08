"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, User, Bot } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hey there! How are you doing today?",
      sender: "other",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      content: "I'm doing great, thanks for asking! Just working on some new projects.",
      sender: "user",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      content: "That sounds exciting! What kind of projects are you working on?",
      sender: "other",
      timestamp: new Date(Date.now() - 180000),
    },
  ])
  const [input, setInput] = useState("")
  const [currentSender, setCurrentSender] = useState<"user" | "other">("user")

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: currentSender,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")

    const response = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({ query: input }),
    })

    const data = await response.json()
    console.log(data)
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      content: data.message.content,
      sender: currentSender === "user" ? "other" : "user",
      timestamp: new Date(),
    }])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
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
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.sender === "other" && (
                <div className="w-8 h-8 rounded-full bg-[#92278F] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`flex flex-col ${message.sender === "user" ? "ml-auto items-end" : "items-start"} max-w-[70%]`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-[#92278F] text-white rounded-br-md"
                      : "bg-gray-100 text-black rounded-bl-md border border-gray-200"
                  } shadow-sm`}
                >
                  <p className="font-inter text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 font-inter">{formatTime(message.timestamp)}</span>
              </div>

              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="p-6 border-t border-gray-100">
          <div className="w-full space-y-3">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={currentSender === "user" ? "default" : "outline"}
                onClick={() => setCurrentSender("user")}
                className={`font-inter text-sm ${
                  currentSender === "user"
                    ? "bg-[#92278F] hover:bg-[#7a1f78] text-white"
                    : "border-[#92278F] text-[#92278F] hover:bg-[#92278F] hover:text-white"
                }`}
              >
                Send as User
              </Button>
              <Button
                type="button"
                variant={currentSender === "other" ? "default" : "outline"}
                onClick={() => setCurrentSender("other")}
                className={`font-inter text-sm ${
                  currentSender === "other"
                    ? "bg-black hover:bg-gray-800 text-white"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                Send as Other
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
                disabled={!input.trim()}
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
