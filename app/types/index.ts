import { Board, Listing, Reservation, User, List, Card, Tag, Asset, Failure, FailureTag, AssetCategory, BoardView, CardImage } from "@prisma/client";

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
  //views:number;
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
  //views:number;
}

export type SafeBoard = Omit<
  Board, 
  "createdAt" | "updatedAt" 
> & {
  createdAt: string;
  updatedAt: string;
  lists: SafeList [];
  user_image:string;  
  views:number;
  userslist:string[];
};

export type SafeFailure = Omit<
  Failure, 
  "createdAt" | "updatedAt" 
> & {
  createdAt: string;
  updatedAt: string;
};
export type SafeAsset = Omit<
  Asset, 
  "createdAt" | "updatedAt" 
> & {
  createdAt: string;
  updatedAt: string;
 // lists: SafeList [];
  failures:SafeFailure[]
 // user_image:string;
};
export type SafeCardMedia = Omit<
  CardImage, 
  "createdAt"  
> & {
  createdAt: string;
  card:SafeCard;
  listTitle:string,
  bordTitle: string,
  boardCreatedAt: string, // Handle null
  boardUpdatedAt: string, // Handle null
}

export type cardWithImageList ={card: Card, imageList: CardImage[]}


export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

export type SafeTag = Omit<
  Tag,
  "createdAt" | "updatedAt" 
> & {
  createdAt: string;
  updatedAt: string;
};

export type SafeFailureTag = Omit<
  FailureTag,
  "createdAt" | "updatedAt" 
> & {
  createdAt: string;
  updatedAt: string;
};

export type SafeAssetCategory = Omit<
  AssetCategory,
  "createdAt" | "updatedAt" 
> & {
  createdAt: string;
  updatedAt: string;
};
