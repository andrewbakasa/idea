import React from 'react';
import Image from 'next/image';
import kws from '/public/images/clients/kws.png';
import geps from '/public/images/clients/geps.png';
import protergia from '/public/images/clients/protergia.png';

interface ClientsProps {} // Define props if needed, otherwise use an empty interface

const clientImage: React.CSSProperties = {
  height: '10rem',
  width: 'auto',
  mixBlendMode: 'color-burn', // Corrected value with a hyphen
};

const Clients: React.FC<ClientsProps> = () => {
  return (
    <div className="mt-8 bg-gray-100">
      <section data-aos="fade-up">
        <div className="my-4 py-4">
          <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">Our Clients</h2>
          <div className="flex justify-center">
            <div className="w-24 border-b-4 border-blue-900"></div>
          </div>
          <h2 className="mt-4 mx-12 text-center text-xl lg:text-2xl font-semibold text-blue-900">
            Some of our clients.
          </h2>
        </div>

        <div className="p-16" data-aos="fade-in" data-aos-delay="600">
          <div className="grid sm:grid-cols-3 lg:grid-cols-3">
            <div style={clientImage} className="overflow-hidden flex justify-center transition-all ease-in-out opacity-50 hover:opacity-100 w-1/6">
              <Image src={kws} alt="client" />
            </div>

            <div style={clientImage} className="overflow-hidden p-3 flex justify-center transition-all ease-in-out opacity-50 hover:opacity-100">
              <Image src={protergia} alt="client" />
            </div>

            <div style={clientImage} className="overflow-hidden p-3 flex justify-center transition-all ease-in-out opacity-50 hover:opacity-100">
              <Image src={geps} alt="client" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Clients;