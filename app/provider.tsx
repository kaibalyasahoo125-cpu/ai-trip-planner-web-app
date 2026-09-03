"use client"

import React, { useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import Header from './_components/Header';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';
import { TripContextType, TripDetailContext } from '@/context/TripDetailContext';
import { TripInfo } from './create-new-trip/_components/ChatBox';

function Provider ({
  children
}: Readonly<{
  children: React.ReactNode;
}>){

  const createUserMutation = useMutation(api.user.CreateNewUser);
  const [userDetail, setUserDetail] = useState<any>();
  const [tripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(null);
  const [targetPlace, setTargetPlace] = useState<any>(null);

  const { user } = useUser();
  const createdRef = useRef<string | null>(null);

  const handleCreateUser = useCallback(async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email || createdRef.current === email) return;
    createdRef.current = email;

    try {
      const result = await createUserMutation({
        email: email ?? "",
        imageUrl: user?.imageUrl ?? "",
        name: user?.fullName ?? "",
      });
      setUserDetail(result);
    } catch (e) {
      console.error("Create user failed", e);
    }
  }, [user, createUserMutation]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      handleCreateUser();
    }
  }, [user?.primaryEmailAddress?.emailAddress, handleCreateUser]);

  const userDetailValue = useMemo(
    () => ({ userDetail, setUserDetail }),
    [userDetail],
  );

  const tripDetailValue = useMemo<TripContextType>(
    () => ({ tripDetailInfo, setTripDetailInfo, targetPlace, setTargetPlace }),
    [tripDetailInfo, targetPlace],
  );

  return (
    <UserDetailContext.Provider value={userDetailValue}>
      <TripDetailContext.Provider value={tripDetailValue}>
        <Header />
        {children}
      </TripDetailContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider 

export const useUserDetail = () => {
  return useContext(UserDetailContext)
}

export const useTripDetail = (): TripContextType => {
  const context = useContext(TripDetailContext);
  if (!context) {
    throw new Error("useTripDetail must be used within a TripDetailProvider");
  }
  return context;
};