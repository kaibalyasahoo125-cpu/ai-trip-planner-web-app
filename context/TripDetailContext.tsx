import { TripInfo } from "@/app/create-new-trip/_components/ChatBox";
import React, { createContext } from "react";

export type PlaceTarget = {
  lat: number;
  lng: number;
  name: string;
  type?: "hotel" | "activity";
  day?: number;
  price?: string;
  time?: string;
  triggerId?: number;
};

export type TripContextType = {
  tripDetailInfo: TripInfo | null;
  setTripDetailInfo: React.Dispatch<React.SetStateAction<TripInfo | null>>;
  targetPlace?: PlaceTarget | null;
  setTargetPlace?: React.Dispatch<React.SetStateAction<PlaceTarget | null>>;
};

export const TripDetailContext = createContext<TripContextType | undefined>(undefined);