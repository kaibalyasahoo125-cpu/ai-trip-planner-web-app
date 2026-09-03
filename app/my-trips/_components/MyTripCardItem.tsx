"use client";

import Image from 'next/image'
import React from 'react'
import { Trip } from '../page'
import { ArrowBigRightIcon } from 'lucide-react'
import Link from 'next/link';
import { usePlacePhoto } from '@/app/hooks/usePlacePhoto'

type Props = {
    trip: Trip
}

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 280'>
      <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0' stop-color='%23fef3c7'/><stop offset='1' stop-color='%23fde68a'/>
      </linearGradient></defs>
      <rect width='400' height='280' fill='url(%23g)'/>
      <text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'
        fill='%23d97706' font-family='ui-sans-serif,system-ui' font-size='20'>
        Your Trip
      </text>
    </svg>`
  );

const MyTripCardItem = React.memo(function MyTripCardItem({ trip }: Props) {
  const photoUrl = usePlacePhoto(trip?.tripDetail?.destination);
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);

  const displaySrc = imgSrc || photoUrl || PLACEHOLDER;

  return (
    <Link
      href={`/view-trip/${trip?.tripId}`}
      className="p-4 sm:p-5 shadow rounded-2xl block hover:shadow-lg transition"
    >
      <div className="relative w-full h-56 sm:h-[270px] overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={displaySrc}
          alt={trip.tripId}
          className="object-cover transition-all hover:scale-110"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          unoptimized={true}
          onError={() => setImgSrc(PLACEHOLDER)}
        />
      </div>

      <h2 className="flex gap-2 font-semibold text-lg sm:text-xl mt-3">
        {trip?.tripDetail?.origin} <ArrowBigRightIcon /> {trip?.tripDetail?.destination}
      </h2>

      <h2 className="mt-1 sm:mt-2 text-gray-500 text-sm sm:text-base">
        {trip?.tripDetail?.duration} Trip with {trip?.tripDetail?.budget} Budget
      </h2>
    </Link>
  );
});

export default MyTripCardItem