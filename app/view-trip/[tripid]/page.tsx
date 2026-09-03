"use client";

import dynamic from 'next/dynamic'
import Itinerary from '@/app/create-new-trip/_components/Itinerary';
import { Trip } from '@/app/my-trips/page';
import { useTripDetail, useUserDetail } from '@/app/provider'
import { api } from '@/convex/_generated/api'
import { useConvex } from 'convex/react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const GlobalMap = dynamic(() => import('@/app/create-new-trip/_components/GlobalMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-slate-50 text-slate-400 text-sm animate-pulse" style={{ width: '95%', height: '85vh', borderRadius: 20 }}>
      Loading map…
    </div>
  ),
})

const ViewTrip = () => {
  const { tripid } = useParams() 
  const { userDetail } = useUserDetail()
  const { setTripDetailInfo } = useTripDetail()

  const convex = useConvex()
  const [tripData, setTripData] = useState<Trip | null | undefined>(null)

  useEffect(() => {
    if (!userDetail?._id) return;

    let cancelled = false;
    const GetTrip = async () => {
      const result = await convex.query(api.tripDetail.GetTripById, {
          uid: userDetail._id,
          tripid: tripid + ''
      })
      if (cancelled) return;
      setTripData(result)
      setTripDetailInfo(result?.tripDetail)
    }
    GetTrip();
    return () => { cancelled = true; };
  }, [userDetail?._id, tripid, convex, setTripDetailInfo])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 lg:p-8">
      <div className="lg:col-span-3">
        <Itinerary />
      </div>

      <div className="lg:col-span-2">
        <GlobalMap />
      </div>
    </div>
  )
}

export default ViewTrip