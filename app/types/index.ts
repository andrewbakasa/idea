import { Board, Listing, Reservation, User, List, Card } from "@prisma/client";

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
};

export type SafeReservation = Omit<
  Reservation, 
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: SafeListing;
};

export type SafeCard = Omit<
  Card, 
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export type SafeList = Omit<
  List, 
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  cards: SafeCard []
 
};


export type SafeListWithBoard ={
  id: string;
  user_image: string | null;
  imageThumbUrl: string;
  board_title: string;
  list_title: string;
  owner_email: string ;
  cards: {
      createdAt: string;
      updatedAt: string;
      id: string;
      title: string;
      order: number;
      description: string | null;
      listId: string;
      visible: boolean; 
      active: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type SafeCardWithBoard= {
  title: string;
  description: string | null;
  id: string;
  user_image: string | null;
  imageThumbUrl: string;
  board_title: string;
  list_title: string;
  owner_email: string;
  createdAt: string;
  updatedAt: string;
}

export type SafeBoard = Omit<
  Board, 
  "createdAt" | "updatedAt" 
> & {
  createdAt: string;
  updatedAt: string;
  lists: SafeList [];
  user_image:string;
};



export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};
