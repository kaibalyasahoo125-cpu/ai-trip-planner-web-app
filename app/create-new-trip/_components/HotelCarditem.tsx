"use client";

import { Button } from '@/components/ui/button'
import { ExternalLink, Star, Wallet } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Hotel } from './ChatBox'
import { usePlacePhoto } from '@/app/hooks/usePlacePhoto'

type Props = {
    hotel: Hotel
}

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 260'>
      <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0' stop-color='%23e2e8f0'/><stop offset='1' stop-color='%23cbd5e1'/>
      </linearGradient></defs>
      <rect width='400' height='260' fill='url(%23g)'/>
      <text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'
        fill='%2394a3b8' font-family='ui-sans-serif,system-ui' font-size='18'>
        Hotel Image
      </text>
    </svg>`
  );

import { useTripDetail } from '@/app/provider';
import { Compass } from 'lucide-react';

const HotelCardItem = React.memo(function HotelCardItem({ hotel }: Props) {
  const photoUrl = usePlacePhoto(hotel?.hotel_name);
  const { setTargetPlace } = useTripDetail();
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);

  const displaySrc =
    imgSrc ||
    photoUrl ||
    (hotel?.hotel_image_url && hotel.hotel_image_url.startsWith("http") ? hotel.hotel_image_url : null) ||
    PLACEHOLDER;

  const handleFlyToMap = () => {
    const lat = hotel?.geo_coordinates?.latitude;
    const lng = hotel?.geo_coordinates?.longitude;
    if (typeof lat === "number" && typeof lng === "number" && setTargetPlace) {
      setTargetPlace({
        lat,
        lng,
        name: hotel.hotel_name,
        type: "hotel",
        price: hotel.price_per_night,
        triggerId: Date.now(),
      });
    }
  };

  return (
    <div className="flex flex-col gap-1 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
      <div
        className="w-full h-48 relative overflow-hidden rounded-xl shadow-inner bg-slate-100 cursor-pointer group"
        onClick={handleFlyToMap}
      >
        <Image
          src={displaySrc}
          alt={hotel?.hotel_name || "hotel name"}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover mb-2 transition-all duration-300 group-hover:scale-110"
          loading="lazy"
          unoptimized={true}
          onError={() => setImgSrc(PLACEHOLDER)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Compass className="h-3.5 w-3.5 text-amber-400 animate-spin" /> Fly to on Map
          </span>
        </div>
      </div>
      <h2 className="font-semibold text-lg mt-1 text-slate-800 line-clamp-1">{hotel?.hotel_name}</h2>
      <h2 className="text-gray-500 text-xs line-clamp-1">{hotel?.hotel_address}</h2>
      <div className="flex justify-between items-center mt-1">
        <p className="flex items-center gap-1 text-green-600 font-semibold text-sm">
          <Wallet className="h-4 w-4" /> {hotel?.price_per_night}
        </p>
        <p className="text-amber-500 font-bold flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-amber-400" /> {hotel?.rating}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm text-xs font-semibold"
          onClick={handleFlyToMap}
        >
          <Compass className="h-3.5 w-3.5 mr-1" /> 3D Fly Map
        </Button>
        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel?.hotel_name)}`}
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

export default HotelCardItem