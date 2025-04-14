import { NextResponse } from "next/server";

//import getCurrentUser from getCurrentUser
import prisma from "../../../libs/prismadb"//"..app/libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";

interface IParams {
  cardId?: string;
}
//make public

export async function DELETE(
  request: Request, 
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.error();
  }

  const { cardId } = params;

  if (!cardId || typeof cardId !== 'string') {
    throw new Error('Invalid ID');
  }



  const card = await prisma.card.deleteMany({
    where: {
      id: cardId,
    },
  });

  return NextResponse.json(card);
}


