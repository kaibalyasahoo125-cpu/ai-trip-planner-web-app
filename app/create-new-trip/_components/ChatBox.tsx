"use client";

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios';
import { Loader, Send } from 'lucide-react'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import EmptyBoxState from './EmptyBoxState';
import GroupSizeUi from './GroupSizeUi';
import BudgetUi from './BudgetUi';
import FinalUi from './FinalUi';
import SelectDays from './SelectDaysUi';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useTripDetail, useUserDetail } from '@/app/provider';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

type Message = {
  role: string,
  content: string,
  ui?: string
}

export type TripInfo = {
  budget: string,
  destination: string,
  duration: string,
  group_size: string,
  origin: string,
  hotels: Hotel[],
  itinerary: Itinerary[]
}

export type Hotel = {
  hotel_name: string,
  hotel_address: string,
  price_per_night: string,
  hotel_image_url: string,
  geo_coordinates: {
    latitude: number,
    longitude: number
  },
  rating: number,
  description?: string
}

export type Activity = {
  place_name: string,
  place_details: string,
  place_image_url: string,
  geo_coordinates: {
    latitude: number,
    longitude: number
  },
  place_address: string,
  ticket_pricing: string,
  time_travel_each_location: string,
  best_time_to_visit: string
}

export type DayPlan = {
  day: number,
  day_plan: string,
  best_time_to_visit_day: string,
  activities: Activity[]
}

export type Itinerary = {
  day: number,
  day_plan: string,
  best_time_to_visit_day: string,
  activities: Activity[]
}

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [uiSelectedValue, setUiSelectedValue] = useState<string | null>(null);

  const [isFinal, setIsFinal] = useState(false)
  const [tripDetails, setTripDetails] = useState<TripInfo>()

  const SaveTripDetail = useMutation(api.tripDetail.CreateTripDetail)

  const { userDetail } = useUserDetail()
  const { setTripDetailInfo } = useTripDetail()
  const [tripId, setTripId] = useState<string | null>(null);

  const router = useRouter();

  const messagesRef = useRef(messages);
  const isFinalRef = useRef(isFinal);
  const userInputRef = useRef(userInput);
  const finalSentRef = useRef(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isFinalRef.current = isFinal; }, [isFinal]);
  useEffect(() => { userInputRef.current = userInput; }, [userInput]);

  const onSend = useCallback(async (messageContent = userInputRef.current, forceFinal = false) => {
    if (!messageContent?.trim() && messagesRef.current.length > 0) return;
    if (loading) return;
    
    setLoading(true);
    setUserInput('');
    
    const newMsg: Message = {
      role: 'user',
      content: messageContent
    };

    const currentMessages = [...messagesRef.current, newMsg];
    setMessages(currentMessages);
    messagesRef.current = currentMessages;

    const runFinal = forceFinal || isFinalRef.current;

    try {
      const result = await axios.post('/api/aimodel', {
        messages: currentMessages,
        isFinal: runFinal
      });

      if (result?.data?.error) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm sorry, I encountered an error. Please try again.",
          }
        ]);
        return;
      }

      if (!runFinal) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: result?.data?.resp,
            ui: result?.data?.ui
          }
        ]);
      }

      if (runFinal) {
        if (!result?.data?.trip_plan) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: "I'm sorry, I was unable to generate your trip plan. Please try again.",
            }
          ]);
          return;
        }
        setTripDetails(result?.data?.trip_plan)
        setTripDetailInfo(result?.data?.trip_plan)

        const newTripId = uuidv4();
        setTripId(newTripId);
        
        if (userDetail?._id) {
          await SaveTripDetail({
            tripDetail: result?.data?.trip_plan,
            tripId: newTripId,
            uid: userDetail._id
          })
        }
      }
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, SaveTripDetail, setTripDetailInfo, userDetail]);

  const handleManualInputSend = useCallback(() => {
    if (userInputRef.current.trim() !== '') {
      onSend(userInputRef.current);
    }
  }, [onSend]);

  const handleUiSelection = useCallback((value: string) => {
    setUiSelectedValue(value);
  }, []);

  useEffect(() => {
    if (!uiSelectedValue) return;
    const val = uiSelectedValue;
    setUiSelectedValue(null);
    onSend(val);
  }, [uiSelectedValue, onSend]);

  const RenderGenerativeUI = (ui: string) => {
    if (ui === 'budget') {
      return <BudgetUi onSelectedOption={handleUiSelection} />;
    } else if (ui === 'groupSize') {
      return <GroupSizeUi onSelectedOption={handleUiSelection} />;
    } else if (ui === 'tripDuration') {
      return <SelectDays onSelectedOption={handleUiSelection}/>
    } else if (ui === 'final') {
      return <FinalUi viewTrip={() => router.push(`/view-trip/${tripId}`)} disable={!tripDetails}  />
    }
    return null;
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.ui === 'final' && !finalSentRef.current) {
      finalSentRef.current = true;
      setIsFinal(true);
      isFinalRef.current = true;
      setTimeout(() => onSend('Ok, Great!', true), 50);
    }
  }, [messages, onSend])

  return (
    <div className="h-[85vh] md:h-[85vh] w-full md:w-auto flex flex-col border shadow rounded-2xl p-4 sm:p-5">
      {/* Empty State */}
      {messages?.length === 0 && (
        <EmptyBoxState onSelectOption={handleUiSelection} />
      )}

      {/* Display Messages */}
      <section className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3">
        {messages.map((msg: Message, index) =>
          msg.role === "user" ? (
            <div className="flex justify-end" key={index}>
              <div className="max-w-[95%] sm:max-w-lg bg-primary text-white px-4 py-2 rounded-lg text-sm sm:text-base break-words">
                {msg.content}
              </div>
            </div>
          ) : (
            <div className="flex justify-start" key={index}>
              <div className="max-w-[95%] sm:max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg text-sm sm:text-base break-words">
                {msg.content}
                {RenderGenerativeUI(msg.ui ?? "")}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[95%] sm:max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg">
              <Loader className="animate-spin" />
            </div>
          </div>
        )}
      </section>

      {/* User Input */}
      <section>
        <div className="border rounded-2xl p-4 shadow relative bg-white">
          <Textarea
            placeholder="Start typing here..."
            className="w-full h-24 sm:h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none"
            onChange={(event) => setUserInput(event.target.value)}
            value={userInput}
          />
          <Button
            size="icon"
            className="absolute bottom-6 right-6"
            onClick={handleManualInputSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );

};

export default ChatBox;