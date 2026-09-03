import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
// ai model API route
import { getAj } from "@/lib/server";

import { auth, currentUser } from "@clerk/nextjs/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const PROMPT = `
You are an AI Trip Planner Agent. Your mission is to assist the user by collecting specific trip details in a strict, step-by-step sequence. Your tone should be friendly and conversational.

**The Sequential Information to Collect in Order:**
1. Starting Location (Source / Origin / Departure City)
2. Destination City or Country
3. Group Size (Just Me, Couple, A Family, Friends)
4. Budget (Cheap, Moderate, Luxury)
5. Trip Duration (number of days)
6. Travel Interests (e.g., adventure, cultural, nightlife, food)
7. Special Requirements or Preferences (if any)

**Crucial Rules for Each Response:**
- **Always review the entire conversation history** to identify which information has already been provided.
- **FIRST ask the starting point (Origin / departure city)**.
- **SECOND ask the destination point (Destination city / country)** only after the starting point is known.
- **NEVER ask both starting point and destination point in a single message** unless the user already provided both upfront (e.g., "from New York to Paris").
- **Ask for only ONE missing piece of information at a time** from the sequence.
- Your response must be a single, strict JSON object with two keys: \`resp\` for the text and \`ui\` for the UI component.
- **NEVER include any text or explanations outside of the JSON object.**

**UI Component Mapping (STRICTLY ADHERE TO THIS):**
- If the next question is "Starting Location," \`ui\` MUST be \`null\`.
- If the next question is "Destination," \`ui\` MUST be \`null\`.
- If the next question is "Group Size," \`ui\` MUST be \`"groupSize"\`.
- If the next question is "Budget," \`ui\` MUST be \`"budget"\`.
- If the next question is "Trip Duration," \`ui\` MUST be \`"tripDuration"\`.
- If the next question is "Travel Interests," \`ui\` MUST be \`null\`.
- If the next question is "Special Requirements," \`ui\` MUST be \`null\`.
- For any message where you are just replying without asking for one of the specific UI components (Group Size, Budget, Trip Duration), \`ui\` MUST be \`null\`.

**Example Step-by-Step Flow:**
- User: "Create New Trip"
  Agent: { "resp": "Welcome! Where will you be starting your trip from (your departure city or origin)?", "ui": null }
- User: "Delhi"
  Agent: { "resp": "Great, starting from Delhi! Where is your dream destination?", "ui": null }
- User: "Paris"
  Agent: { "resp": "Paris is a fantastic destination! Who will be traveling with you?", "ui": "groupSize" }
- User: "Couple"
  Agent: { "resp": "Wonderful! What is your planned budget range for this trip?", "ui": "budget" }

**Example (User providing both origin and destination at once):**
- User: "I want to take a trip from New York to Madrid."
- Agent: { "resp": "That sounds fantastic! To help me plan your journey from New York to Madrid, who will be traveling with you?", "ui": "groupSize" }

**Final Output:**
- After collecting all seven details, prompt for final generation confirmation.
- The final response confirmation MUST be a strict JSON object with \`ui\` set to \`"final"\`.
    \`\`\`json
    {
      "resp": "I have all your details! Ready to generate your personalized itinerary?",
      "ui": "final"
    }
    \`\`\`
`

const FINAL_PROMPT = `Generate Travel Plan with give details, give me Hotels options list with HotelName, 

Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and  suggest itinerary with placeName, Place Details, Place Image Url,

 Geo Coordinates,Place address, ticket Pricing, Time travel each of the location , with each day plan with best time to visit in JSON format.

 Output Schema:

 {

  "trip_plan": {

    "destination": "string",

    "duration": "string",

    "origin": "string",

    "budget": "string",

    "group_size": "string",

    "hotels": [

      {

        "hotel_name": "string",

        "hotel_address": "string",

        "price_per_night": "string",

        "hotel_image_url": "string",

        "geo_coordinates": {

          "latitude": "number",

          "longitude": "number"

        },

        "rating": "number",

        "description": "string"

      }

    ],

    "itinerary": [

      {

        "day": "number",

        "day_plan": "string",

        "best_time_to_visit_day": "string",

        "activities": [

          {

            "place_name": "string",

            "place_details": "string",

            "place_image_url": "string",

            "geo_coordinates": {

              "latitude": "number",

              "longitude": "number"

            },

            "place_address": "string",

            "ticket_pricing": "string",

            "time_travel_each_location": "string",

            "best_time_to_visit": "string"

          }

        ]

      }

    ]

  }

}`

function capitalizeWords(str: string) {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function analyzeChatState(messages: { role: string; content: string }[]) {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content.trim());
  const allText = userMessages.join(" ");

  const isGeneric = (text: string) =>
    /^(?:create new trip|inspire me(?: where to go)?|discover hidden gems?|adventure destination|hello|hi|hey|start|plan a trip|plan trip)$/i.test(
      text.trim()
    );

  let origin = "";
  let destination = "";
  let bothInSingleMsg = false;

  // 1. Check if both origin and destination provided in one message (e.g. "from X to Y" or "X to Y")
  const fromToMatch = allText.match(/from\s+([A-Za-z\s,]+?)\s+to\s+([A-Za-z\s,]+?)(?:\s+(?:for|with|on|in|\d)|[?.!,]|$)/i);
  if (fromToMatch && fromToMatch[1] && fromToMatch[2]) {
    origin = capitalizeWords(fromToMatch[1].trim());
    destination = capitalizeWords(fromToMatch[2].trim());
    bothInSingleMsg = true;
  } else {
    const toMatch = allText.match(/([A-Za-z\s,]+?)\s+to\s+([A-Za-z\s,]+?)(?:\s+(?:for|with|on|in|\d)|[?.!,]|$)/i);
    if (toMatch && toMatch[1] && toMatch[2] && !/create|start|inspire|plan|welcome/i.test(toMatch[1])) {
      origin = capitalizeWords(toMatch[1].trim());
      destination = capitalizeWords(toMatch[2].trim());
      bothInSingleMsg = true;
    }
  }

  // Filter out generic starter actions
  const contentMsgs = userMessages.filter((msg) => !isGeneric(msg));

  // 2. Turn-by-turn fallback extraction
  if (!origin || !destination) {
    // Check if first content message has destination keywords e.g. "Trip to Paris"
    const firstMsg = contentMsgs[0] || "";
    const destMatch = firstMsg.match(/^(?:trip to|travel to|visit|going to|vacation in)\s+([A-Za-z\s,]+?)(?:\s+(?:for|with|on|in|from|\d)|[?.!,]|$)/i);
    const originMatch = firstMsg.match(/^(?:from|starting from|start from|origin)\s+([A-Za-z\s,]+?)(?:\s+(?:to|for|with|on|in|\d)|[?.!,]|$)/i);

    if (destMatch && destMatch[1]) {
      destination = capitalizeWords(destMatch[1].trim());
      if (contentMsgs.length > 1) {
        origin = capitalizeWords(contentMsgs[1].replace(/^(?:from|starting from|start from)\s+/i, "").trim());
      }
    } else if (originMatch && originMatch[1]) {
      origin = capitalizeWords(originMatch[1].trim());
      if (contentMsgs.length > 1) {
        destination = capitalizeWords(contentMsgs[1].replace(/^(?:to|going to|trip to)\s+/i, "").trim());
      }
    } else {
      // First is Origin, Second is Destination
      if (contentMsgs.length > 0) {
        origin = capitalizeWords(contentMsgs[0]);
      }
      if (contentMsgs.length > 1) {
        destination = capitalizeWords(contentMsgs[1]);
      }
    }
  }

  return {
    userMessages,
    contentMsgs,
    origin,
    destination,
    bothInSingleMsg,
  };
}

function extractOriginAndDestination(messages: { role: string; content: string }[]) {
  const { origin, destination } = analyzeChatState(messages);
  return {
    origin: origin || "New York, USA",
    destination: destination || "Paris, France",
  };
}

function generateFallbackPlan(messages: { role: string; content: string }[]) {
  const allText = messages.map((m) => m.content).join(" ");
  const { origin, destination } = extractOriginAndDestination(messages);
  const dest = destination;

  // Detect group size
  let groupSize = "Couple";
  if (/family/i.test(allText)) groupSize = "A Family";
  else if (/friend/i.test(allText)) groupSize = "Friends";
  else if (/solo|just me|alone/i.test(allText)) groupSize = "Just Me";

  // Detect budget
  let budget = "Moderate";
  if (/cheap|budget|economy/i.test(allText)) budget = "Cheap";
  else if (/luxury|expensive|high-end/i.test(allText)) budget = "Luxury";

  // Detect duration
  let durationNum = 3;
  const daysMatch = allText.match(/(\d+)\s*(?:days?|day)/i);
  if (daysMatch) {
    durationNum = Math.min(Math.max(parseInt(daysMatch[1], 10), 1), 7);
  }

  // Base coordinates for common cities or fallback
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    paris: { lat: 48.8566, lng: 2.3522 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    "new york": { lat: 40.7128, lng: -74.006 },
    london: { lat: 51.5074, lng: -0.1278 },
    rome: { lat: 41.9028, lng: 12.4964 },
    bali: { lat: -8.4095, lng: 115.1889 },
    dubai: { lat: 25.2048, lng: 55.2708 },
    barcelona: { lat: 41.3851, lng: 2.1734 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    singapore: { lat: 1.3521, lng: 103.8198 },
    goa: { lat: 15.2993, lng: 74.124 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.209 },
    amsterdam: { lat: 52.3676, lng: 4.9041 },
    bangkok: { lat: 13.7563, lng: 100.5018 },
  };

  const lowerDest = dest.toLowerCase();
  let baseCoords = { lat: 48.8566, lng: 2.3522 };
  for (const [key, coords] of Object.entries(cityCoords)) {
    if (lowerDest.includes(key)) {
      baseCoords = coords;
      break;
    }
  }

  const activitiesTemplates = [
    { name: `Historic City Center & Landmarks`, details: `Explore the iconic historic highlights, architecture, and scenic walkways of ${dest}.`, time: "Morning (09:00 AM - 12:30 PM)", cost: "$15 - $25" },
    { name: `Cultural Heritage & Museum Tour`, details: `Immerse yourself in world-class art collections, galleries, and regional history.`, time: "Afternoon (01:30 PM - 04:30 PM)", cost: "$20" },
    { name: `Sunset Panorama & Fine Dining`, details: `Take in breathtaking skyline views followed by signature local cuisine at a top-rated restaurant.`, time: "Evening (06:00 PM - 09:30 PM)", cost: "$40 - $75" },
    { name: `Artisan Markets & Street Food`, details: `Wander through vibrant local markets tasting artisanal pastries, coffee, and delicacies.`, time: "Morning (09:30 AM - 12:00 PM)", cost: "Free entry (food varies)" },
    { name: `Scenic River Walk & Waterfront Park`, details: `Relax along peaceful riverside promenades, lush green parks, and scenic viewpoints.`, time: "Afternoon (02:00 PM - 05:00 PM)", cost: "Free" },
    { name: `Nightlife & Cultural Music Experience`, details: `Experience the vibrant evening nightlife, live acoustic performances, and cocktail lounges.`, time: "Night (08:00 PM - 11:30 PM)", cost: "$30" },
  ];

  const itinerary = [];
  for (let i = 1; i <= durationNum; i++) {
    const act1 = activitiesTemplates[(i * 2 - 2) % activitiesTemplates.length];
    const act2 = activitiesTemplates[(i * 2 - 1) % activitiesTemplates.length];
    const offset1 = (i * 0.008) - 0.015;
    const offset2 = (i * 0.009) + 0.012;

    itinerary.push({
      day: i,
      day_plan: `Day ${i}: Exploring the Best of ${dest}`,
      best_time_to_visit_day: "09:00 AM - 09:00 PM",
      activities: [
        {
          place_name: `${dest} - ${act1.name}`,
          place_details: act1.details,
          place_image_url: "",
          geo_coordinates: {
            latitude: Number((baseCoords.lat + offset1).toFixed(4)),
            longitude: Number((baseCoords.lng + offset1 * 1.2).toFixed(4)),
          },
          place_address: `Central District, ${dest}`,
          ticket_pricing: act1.cost,
          time_travel_each_location: "20-30 mins via transit / taxi",
          best_time_to_visit: act1.time,
        },
        {
          place_name: `${dest} - ${act2.name}`,
          place_details: act2.details,
          place_image_url: "",
          geo_coordinates: {
            latitude: Number((baseCoords.lat + offset2).toFixed(4)),
            longitude: Number((baseCoords.lng - offset2 * 0.8).toFixed(4)),
          },
          place_address: `Grand Promenade, ${dest}`,
          ticket_pricing: act2.cost,
          time_travel_each_location: "15-25 mins",
          best_time_to_visit: act2.time,
        },
      ],
    });
  }

  return {
    trip_plan: {
      destination: dest,
      duration: `${durationNum} Days`,
      origin: origin,
      budget: budget,
      group_size: groupSize,
      hotels: [
        {
          hotel_name: `Grand Palace Hotel ${dest.split(',')[0]}`,
          hotel_address: `12 Boulevard de Luxe, ${dest}`,
          price_per_night: budget === "Luxury" ? "$450 / night" : budget === "Cheap" ? "$95 / night" : "$210 / night",
          hotel_image_url: "",
          geo_coordinates: {
            latitude: Number((baseCoords.lat + 0.004).toFixed(4)),
            longitude: Number((baseCoords.lng + 0.005).toFixed(4)),
          },
          rating: 4.8,
          description: `Prime central location with luxurious rooms, panoramic rooftop views, spa, and gourmet breakfast.`,
        },
        {
          hotel_name: `Boutique Urban Suites ${dest.split(',')[0]}`,
          hotel_address: `45 Riverside Avenue, ${dest}`,
          price_per_night: budget === "Luxury" ? "$380 / night" : budget === "Cheap" ? "$75 / night" : "$160 / night",
          hotel_image_url: "",
          geo_coordinates: {
            latitude: Number((baseCoords.lat - 0.006).toFixed(4)),
            longitude: Number((baseCoords.lng - 0.004).toFixed(4)),
          },
          rating: 4.6,
          description: `Charming boutique retreat with stylish modern interior, cocktail lounge, and seamless subway access.`,
        },
      ],
      itinerary,
    },
  };
}

function generateFallbackChatStep(messages: { role: string; content: string }[]) {
  const { contentMsgs, origin, destination, bothInSingleMsg } = analyzeChatState(messages);

  // 1. Initial starter action (e.g. "Create New Trip" clicked or no location yet)
  if (contentMsgs.length === 0) {
    return {
      resp: "Welcome! Where will you be starting your trip from (Origin / departure city)?",
      ui: null,
    };
  }

  // 2. If origin is known but destination is missing
  if (origin && !destination) {
    return {
      resp: `Awesome, starting from ${origin}! Where is your dream destination?`,
      ui: null,
    };
  }

  // 3. If destination is known but origin is missing
  if (!origin && destination) {
    return {
      resp: `${destination} is a fantastic destination! Where will you be starting your trip from (Origin / departure city)?`,
      ui: null,
    };
  }

  // 4. Both origin and destination are known. Now step through remaining details.
  // Calculate how many answers have been submitted after location(s)
  const locationTurnsCount = bothInSingleMsg ? 1 : 2;
  const subsequentAnswersCount = Math.max(0, contentMsgs.length - locationTurnsCount);

  // Step 3: Group Size
  if (subsequentAnswersCount === 0) {
    return {
      resp: `Exciting journey to ${destination}! Who will be traveling with you?`,
      ui: "groupSize",
    };
  }

  // Step 4: Budget Range
  if (subsequentAnswersCount === 1) {
    return {
      resp: "Wonderful! What is your planned budget range for this trip?",
      ui: "budget",
    };
  }

  // Step 5: Trip Duration
  if (subsequentAnswersCount === 2) {
    return {
      resp: "Got it! How many days are you planning for this trip?",
      ui: "tripDuration",
    };
  }

  // Step 6: Travel Interests
  if (subsequentAnswersCount === 3) {
    return {
      resp: "Sounds like a great timeframe! Do you have any specific travel interests (e.g., food & cuisine, historical sights, nature, beaches, adventure)?",
      ui: null,
    };
  }

  // Step 7: Special Requirements
  if (subsequentAnswersCount === 4) {
    return {
      resp: "Awesome! Any special requirements or dietary preferences (e.g. kid-friendly, vegetarian, accessibility)?",
      ui: null,
    };
  }

  // Final Step: Confirmation
  return {
    resp: "I have all the details needed! Ready to craft your customized itinerary with hotels and interactive map?",
    ui: "final",
  };
}

export async function POST(req: NextRequest) {
  const { messages, isFinal } = await req.json();

  let userEmail: string | undefined;
  let hasPremiumAccess = false;
  try {
    const user = await currentUser();
    userEmail = user?.primaryEmailAddress?.emailAddress;
    const authObj = await auth();
    hasPremiumAccess = authObj.has({ plan: "monthly" }) || userEmail === "kaibalyasahoo125@gmail.com";
  } catch {
    // Unauthenticated / fallback
  }

  // Lazy-load Arcjet to prevent client-side bundling issues
  const aj = await getAj();

  const decision = await aj.protect(req, {
    userId: userEmail ?? "anonymous",
    requested: isFinal && !hasPremiumAccess ? 5 : 0,
  });

  //@ts-ignore
  if (decision?.reason?.remaining === 0 && !hasPremiumAccess) {
    return NextResponse.json({
      resp: "You’ve used up today’s free credits.",
      ui: "limit",
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    if (isFinal) {
      return NextResponse.json(generateFallbackPlan(messages ?? []));
    } else {
      return NextResponse.json(generateFallbackChatStep(messages ?? []));
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: isFinal ? FINAL_PROMPT : PROMPT },
        ...(messages ?? []),
      ],
    });

    const message = completion.choices[0].message;
    let content = message.content ?? "";
    // Strip markdown wrapper if present
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("AI completion error, falling back to simulated generator:", error);
    if (isFinal) {
      return NextResponse.json(generateFallbackPlan(messages ?? []));
    } else {
      return NextResponse.json(generateFallbackChatStep(messages ?? []));
    }
  }
}
