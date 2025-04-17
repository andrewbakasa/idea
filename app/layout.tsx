// "use client"
import { Nunito } from 'next/font/google'

import Navbar from './components/navbar/Navbar';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';

import ToasterProvider from './providers/ToasterProvider';
import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";

import './globals.css'
import ClientOnly from './components/ClientOnly';
import getCurrentUser from './actions/getCurrentUser';
import { Toaster } from "sonner";
import { cn } from '@/lib/utils';
// import usePaddingState from './hooks/usePaddingState';
export const metadata = {
  title: 'PM',
  description: 'Project Management',
}

const font = Nunito({ 
  subsets: ['latin'], 
});

export const dynamic = 'force-dynamic';
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser();
  // const {setPaddingState, paddingState}= usePaddingState();
  // const { paddingState, setPaddingState } = usePaddingState();

  // const path = usePathname();
   let paddingState='pt-28';
  // if(path == '/' || path == '/projects'|| path == '/myprojects'){
  //   paddingTop='pt-2';
  // }
  
  return (
    <html lang="en">
      <body className={font.className}>
        <ClientOnly>
            
          <QueryProvider>
              <ToasterProvider />
              <Toaster />
              <LoginModal currentUser={currentUser}/>
             <RegisterModal />
              {/* <SearchModal /> */}
              {/* <RentModal />  */}
              <ModalProvider />
              <Navbar currentUser={currentUser} />
              <div className={cn("pb-5 h-full",paddingState)}>
                  {children}
              </div>
          </QueryProvider>   
        </ClientOnly>
       
      </body>
    </html>
  )
}
