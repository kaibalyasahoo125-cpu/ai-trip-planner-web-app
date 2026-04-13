import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { placeName } = await req.json()

    const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_PLACE_API_KEY,
            'X-Goog-FieldMask': 'places.photos,places.displayName,places.id'
        }
    }

    try {

        const result = await axios.post(BASE_URL, {
            textQuery: placeName
        }, config)

        const places = result?.data?.places;
        
        if (!places || places.length === 0) {
            return NextResponse.json({ error: "No places found" })
        }

        // Find the first place that has photos
        const placeWithPhoto = places.find((p: any) => p.photos && p.photos.length > 0);

        if (!placeWithPhoto) {
            return NextResponse.json({ error: "No photo found for any found places" })
        }

        const photo = placeWithPhoto.photos[0];
        const photoRefUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${process.env.GOOGLE_PLACE_API_KEY}`;

        return NextResponse.json({ photoUrl: photoRefUrl })
    } catch (error) {
        return NextResponse.json({ error: error })
    }

}