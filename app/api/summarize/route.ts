import { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';
import { NextResponse } from "next/server";

// Adjust this value based on your Groq Cloud plan's limits
const MAX_CHUNK_SIZE = 4000; // Number of tokens per Groq request

// export async function POST( request: Request ) {
                      
//   const body = await request.json();
//   const { text } = body;
//   console.log("Total text Len =======>" ,text.length);
//   if (!text) {
//     return new NextResponse('Missing text content', { status: 400 });
//   }

//   const apiKey = process.env.NEXT_PUBLIC_GROQ_CLOUD_API_KEY;
//   try {
//     const groqCloudClient = new Groq({ apiKey });
//     let summary = '';

//     const chunks: string[] = splitTextWithMerging(text, 5500);
//     console.log("Total chuncks=======>" ,chunks.length);
//     let counter_ =0
//     for (const chunk of chunks) {
//       counter_++;
//       if (counter_ > 30) {
//         console.log('Reached limit of 30 chunks, exiting loop...');
//         break;
//       }
//       console.log(`chunks ${counter_}:::::>>>>>>`, chunk.length)
//       const response = await groqCloudClient.chat.completions.create({
//         model: 'llama-3.3-70b-versatile', // Choose a suitable model
//         messages: [
//           { role: 'user', content: `Get topics from the following text:\n\n${chunk}` },
//         ],
//         temperature: 0.7, // Adjust for creativity (0 = factual, 1 = more creative)
//         max_tokens: 2048, // Adjust based on your needs (maximum summary length)
//         top_p: 1, // Adjust for favoring higher probability sequences
//         frequency_penalty: 0, // Adjust for penalizing repetitive sequences
//         presence_penalty: 0, // Adjust for penalizing overly present words
//       });
//       summary += response.choices[0]?.message?.content || '';
//     }

//     return NextResponse.json({ summary });
//   } catch (error) {
//     console.error('Groq Error:', error);
//     return new NextResponse(`Internal Error: ${error}`, { status: 500 });
//   }
// }

function splitTextWithMerging(text: string, maxLength: number = 6000): string[] {
  // Initial split using regular expression
  const regex = new RegExp(`.{1,${maxLength}}`, 'g');
  const initialChunks: string[] = text.match(regex) || []; 

  // Merge chunks while staying under maxLength
  const mergedChunks: string[] = [];
  let currentChunk: string = "";
  for (const chunk of initialChunks) {
      if (currentChunk.length + chunk.length <= maxLength) {
        currentChunk += " " + chunk; 
      } else {
        // push and empty
        mergedChunks.push(currentChunk.trim());
        //prepare to start next
        currentChunk = chunk;
      }
  }
  if (currentChunk) {
    mergedChunks.push(currentChunk.trim());
  }

  return mergedChunks;
}
// import { Groq, Chat } from 'groq-sdk';
// import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return new NextResponse('Missing text content', { status: 400 });
        }

        const groqCloudClient = new Groq({ apiKey: process.env.GROQ_API_KEY || 'YOUR_API_KEY' }); // Use environment variable

        const chatCompletion = await groqCloudClient.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // Use the model from the second snippet
            messages: [
                { role: 'user', content: text }, // Use the 'text' from the request body
            ],
            temperature: 0.7, // Use the temperature from the second snippet
            max_tokens: 2048, // Use the max_tokens from the second snippet
            top_p: 1,           // Use top_p from the second snippet
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: true,
            stop: null
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of chatCompletion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const encoded = encoder.encode(content);
                            controller.enqueue(encoded);
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });
     
        return new NextResponse(stream);
    } catch (error) {
        console.error("Error during Groq chat completion:", error);
        return NextResponse.json({ error: 'Failed to fetch response from Groq' }, { status: 500 });
    }
}
