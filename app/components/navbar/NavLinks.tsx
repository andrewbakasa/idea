
'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';;

interface NavLinksProps {}

const NavLinks: React.FC<NavLinksProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  // const searchParams = useSearchParams();
  
  const handleNavigate = (href: string) => {
    // const search = searchParams?.toString();
    // const fullUrl = `${pathname}${search ? `?${search}` : ''}`;   
    if (pathname === '/') {
      if (href.startsWith('#')) {
        // Scroll to the hash directly on the current page
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to the new path
        router.push(href);
      }
    } else {
        // Navigate to the new path
        router.push("/"+ href);
    } 
    
  };

  return (
    <>
      <Link href="#about" onClick={(e) => { e.preventDefault(); handleNavigate("#about"); }} className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        About
      </Link>
      <Link href="#services" onClick={(e) => { e.preventDefault(); handleNavigate("#services"); }} className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        Services
      </Link>
      <Link href="/" className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        Portfolio
      </Link>
      <Link href="/contact#contact" onClick={(e) => { e.preventDefault(); handleNavigate("/contact#contact"); }} className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        Contact Us
      </Link>
      <Link
        href="/demo#demo"
        onClick={(e) => { e.preventDefault(); handleNavigate("/demo#demo"); }}
        className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl"
      >
        Demo our products
      </Link>
    </>
  );
};

export default NavLinks;
