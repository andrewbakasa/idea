import React from 'react';
import Image from 'next/image'; // Import the Image component
import heroImg from '/public/images/web-dev.svg';
import Link from 'next/link';
import NavBar from './navbar/NavBar2';

const Hero = () => {
  return (
    <>
      <div className="hero" id='hero'>
        <div>
          <NavBar />
        </div>

        <div className="m-auto overflow-hidden mx-4 mt-8 lg:mt-4 p-2 md:p-12 h-5/6" data-aos="zoom-in">
          <div id='hero' className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left">
            <div className="lg:w-1/2 flex flex-col justify-center" data-aos="zoom-in" data-aos-delay="200">
              <h1 className="mb-5 md:text-5xl text-3xl font-bold text-blue-900">
              Bespoke Fit for Your Business Success
              </h1>
              <div className="text-xl font-semibold tracking-tight mb-5 text-gray-500">
              We're a dedicated team of top technologists, engineers, and business minds focused on empowering established organizations like yours. Our integrated, state-of-the-art platform and comprehensive support will revolutionize how you design, model, assemble, maintain, manufacture, and operate – driving unprecedented efficiency and innovation.
                 
                </div>
              <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
                <Link href="/contact" className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0">
                  Learn more
                  <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </Link>
              </div>
            </div>
            <div className="flex lg:justify-end w-full lg:w-1/2" data-aos="fade-up" data-aos-delay="700">
              <Image
                src={heroImg}
                alt="hero image"
                className="rounded-t float-right duration-1000 w-full"
                priority // Optional: Use priority for important above-the-fold images
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
/* 
The issue you're encountering with the heroImg not showing and the TypeScript warning about using any likely stems from how Next.js handles static assets, especially when imported directly in this manner.

Here's a breakdown of the problem and the correct way to handle it in Next.js:

Problem:

When you import an image like import heroImg from '/public/images/web-dev.svg';, Next.js, by default, doesn't directly treat this import as a resolvable URL that the <img src={heroImg} /> tag can use in the browser. Instead, it might be processed by webpack in a way that results in a module or a different kind of asset representation, leading to the any type and the image not rendering correctly.

Solution using Next.js <Image> Component (Recommended):

The most efficient and recommended way to handle images in Next.js is by using the built-in <Image> component from next/image. This component provides optimizations like lazy loading, responsive images, and preventing layout shift.

Here's how to modify your Hero component to use <Image>:
 */
// import React from 'react';
// import heroImg from '/public/images/web-dev.svg';
// import Link from 'next/link';
// import NavBar from './navbar/NavBar2';

// const Hero = () => {
//     return (
//         <>
//             <div className="hero" id='hero'>
//                 {/* Navbar handled by Layout.. */}
//                 <div>
//                     <NavBar />
//                 </div> 
                
//                 <div className="m-auto overflow-hidden mx-4 mt-8 lg:mt-4 p-2 md:p-12 h-5/6" data-aos="zoom-in">

//                     <div id='hero' className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left">
//                         <div className="lg:w-1/2 flex flex-col justify-center" data-aos="zoom-in" data-aos-delay="200">
//                             <h1 className="mb-5 md:text-5xl text-3xl font-bold text-blue-900">
//                             {/* We build digital solutions to help businesses scale */}
//                                 Bespoke software solutions for your unique business needs
//                             </h1>
//                             <div className="text-xl font-semibold tracking-tight mb-5 text-gray-500">We are a team of highly motivated and skilled developers dedicated to delivering only the best software.</div>
//                             <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
//                                 <Link href="/contact" className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0">
//                                     Learn more
//                                     <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
//                                 </Link>
//                                 {/* <Link to="/contact" className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0">
//                                     Get Started
//                                     <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
//                                 </Link> */}
//                                 {/* <a href="#_" className="inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg text-white bg-gray-500 hover:bg-gray-400 shadow-xl rounded-2xl sm:w-auto sm:mb-0">
//                                     Learn More
//                                     <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
//                                 </a> */}
//                             </div>
//                         </div>
//                         <div className="flex lg:justify-end w-full lg:w-1/2" data-aos="fade-up" data-aos-delay="700">
//                             <img alt="card img" className="rounded-t float-right duration-1000 w-full" src={heroImg} />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

// export default Hero;