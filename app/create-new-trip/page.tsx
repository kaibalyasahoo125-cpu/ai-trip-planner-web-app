"use client";

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'
import { useTripDetail } from '../provider'
import { Globe2, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const GlobalMap = dynamic(() => import('./_components/GlobalMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-slate-50 text-slate-400 text-sm animate-pulse" style={{ width: '95%', height: '85vh', borderRadius: 20 }}>
      Loading map…
    </div>
  ),
})

const CreateNewTrip = () => {
  const { tripDetailInfo, setTripDetailInfo, targetPlace } = useTripDetail();
  const [activeIndex, setActiveIndex] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Only run this client-side
  useEffect(() => {
    setTripDetailInfo(null);
    setMounted(true);
  }, []);

  // When a card triggers fly to map, switch to Map view
  useEffect(() => {
    if (targetPlace) {
      setActiveIndex(1);
    }
  }, [targetPlace]);

  if (!mounted) return null; // 👈 prevents hydration mismatch

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-10'>
      <div>
        <ChatBox />
      </div>
      <div className="col-span-2 relative">
        { activeIndex === 0 ? <Itinerary /> : <GlobalMap /> }

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="absolute bottom-10 left-[50%] bg-black" 
              size="lg"
              onClick={() => setActiveIndex(activeIndex === 0 ? 1 : 0)}
            >
              { activeIndex === 0 ? <Plane /> : <Globe2 /> }
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Switch between map and Trip Itinerary
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default CreateNewTrip
