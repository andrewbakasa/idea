import React from 'react';
import Link from 'next/link';

interface NavLinksProps {} // Define props if needed, otherwise use an empty interface

const NavLinks: React.FC<NavLinksProps> = () => {
  return (
    <>
      <Link href="#about"  className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        About
      </Link>
      <Link href="#services"  className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        Services
      </Link>
      <Link href="/" className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        Portfolio
      </Link>
      <Link href="/contact#contact"  className="px-4 font-extrabold text-gray-500 hover:text-blue-900">
        Contact Us
      </Link>
      <Link href="/demo#demo"  className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl">
        Demo our products
      </Link>
    </>
  );
};

export default NavLinks;