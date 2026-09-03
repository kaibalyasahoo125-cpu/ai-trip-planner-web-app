"use client";

import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Ticket } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Activity } from './ChatBox'
import { usePlacePhoto } from '@/app/hooks/usePlacePhoto'

type Props = {
  activity: Activity
}

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 260'>
      <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0' stop-color='%23dbeafe'/><stop offset='1' stop-color='%23bfdbfe'/>
      </linearGradient></defs>
      <rect width='400' height='260' fill='url(%23g)'/>
      <text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'
        fill='%2360a5fa' font-family='ui-sans-serif,system-ui' font-size='18'>
        Place Image
      </text>
    </svg>`
  );

import { useTripDetail } from '@/app/provider';
import { Compass } from 'lucide-react';

const PlaceCardItem = React.memo(function PlaceCardItem({ activity }: Props) {
  const photoUrl = usePlacePhoto(activity?.place_name);
  const { setTargetPlace } = useTripDetail();
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);

  const displaySrc =
    imgSrc ||
    photoUrl ||
    (activity?.place_image_url && activity.place_image_url.startsWith("http") ? activity.place_image_url : null) ||
    PLACEHOLDER;

  const handleFlyToMap = () => {
    const lat = activity?.geo_coordinates?.latitude;
    const lng = activity?.geo_coordinates?.longitude;
    if (typeof lat === "number" && typeof lng === "number" && setTargetPlace) {
      setTargetPlace({
        lat,
        lng,
        name: activity.place_name,
        type: "activity",
        price: activity.ticket_pricing,
        time: activity.best_time_to_visit,
        triggerId: Date.now(),
      });
    }
  };

  return (
    <div className="flex flex-col p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
      <div
        className="relative w-full h-48 overflow-hidden rounded-xl bg-slate-100 shadow cursor-pointer group"
        onClick={handleFlyToMap}
      >
        <Image
          src={displaySrc}
          alt={activity?.place_name || "Activity"}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover transition-all duration-300 group-hover:scale-110"
          loading="lazy"
          unoptimized={true}
          onError={() => setImgSrc(PLACEHOLDER)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Compass className="h-3.5 w-3.5 text-sky-400 animate-spin" /> Fly to on Map
          </span>
        </div>
      </div>
      <h2 className="font-semibold text-lg mt-2 text-slate-800 line-clamp-1">{activity?.place_name}</h2>
      <p className="text-gray-500 text-xs line-clamp-2 mt-1">{activity?.place_details}</p>
      <div className="flex flex-wrap gap-y-1 justify-between items-center mt-2">
        <h2 className="flex items-center gap-1 text-sky-600 font-semibold text-xs">
          <Ticket className="h-3.5 w-3.5" />
          {activity?.ticket_pricing}
        </h2>
        <p className="flex items-center gap-1 text-amber-500 font-medium text-xs">
          <Clock className="h-3.5 w-3.5" /> {activity?.best_time_to_visit}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-sm text-xs font-semibold"
          onClick={handleFlyToMap}
        >
          <Compass className="h-3.5 w-3.5 mr-1" /> 3D Fly Map
        </Button>
        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity?.place_name)}`}
          target="_blank"
          className="w-full"
        >
          <Button size="sm" variant="outline" className="w-full text-xs">
            Google <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
});

export default PlaceCardItem