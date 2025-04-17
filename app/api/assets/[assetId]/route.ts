//import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    

    const comment = await prisma.asset.findUnique({
      where: {
        id: params.assetId,
      },
      
    });

    return NextResponse.json(comment);
  } catch (error) {
    return new NextResponse(`Internal Error: ${error}`, { status: 500 });
  }
}