//import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { failureId: string } }
) {
  try {
    

    const failure= await prisma.failure.findUnique({
      where: {
        id: params.failureId,
      },
      
    });

    return NextResponse.json(failure);
  } catch (error) {
    return new NextResponse(`Internal Error: ${error}`, { status: 500 });
  }
}