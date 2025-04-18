'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { SafeUser } from '@/app/types';

interface NavLinksProps {
  onLinkClick?: () => void; // Optional function prop to handle link clicks
  currentUser?: SafeUser | null;
}

const NavLinks: React.FC<NavLinksProps> = ({  currentUser,onLinkClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // This useEffect will run whenever currentUser changes
    console.log('currentUser updated in NavLinks:', currentUser);
    // You can add any logic here that needs to run when currentUser updates
  }, [currentUser]);

  const handleNavigate = (href: string) => {
    if (href.startsWith('#')) {
      if (pathname === '/') {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push('/' + href);
      }
    } else {
      router.push(href);
    }
    // Call the onLinkClick prop if it exists (for mobile menu closing)
    onLinkClick?.();
  };

  return (
    <>
      <Link href="#about" onClick={(e) => { e.preventDefault(); handleNavigate("#about"); }} className="px-4 font-extrabold text-gray-500 hover:text-blue-900 block py-2">
        About
      </Link>
      <Link href="#services" onClick={(e) => { e.preventDefault(); handleNavigate("#services"); }} className="px-4 font-extrabold text-gray-500 hover:text-blue-900 block py-2">
        Services
      </Link>
      <Link href="#portfolio" onClick={(e) => { e.preventDefault(); handleNavigate("#portfolio"); }} className="px-4 font-extrabold text-gray-500 hover:text-blue-900 block py-2">
        Portfolio
      </Link>
      <Link href="/contact#contact" onClick={(e) => { e.preventDefault(); handleNavigate("/contact#contact"); }} className="px-4 font-extrabold text-gray-500 hover:text-blue-900 block py-2">
        Contact Us
      </Link>
      <Link
        href="/demo#demo"
        onClick={(e) => { e.preventDefault(); handleNavigate("/demo#demo"); }}
        className="text-gray-500 hover:bg-gray-300 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl block py-2"
      >
        Demo our products
      </Link>
      <UserMenu currentUser={currentUser} />
    </>
  );
};

export default NavLinks;
