"use client";

import Head from "next/head";
import { useState } from "react";
import Typewriter from "typewriter-effect";
import Image from "next/image";
import Link from "next/link"; 

const AboutPage = () => {
  const [hover, setHover] = useState(false);

  return (
    <div className="min-h-screen">
      <Head>
        <title>About GenAI Studio</title>
      </Head>

      <main className="container mx-auto p-6 space-y-12">
        <section className="hero bg-gray-50 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold mb-4">
            <Typewriter
              options={{
                strings: [
                  "Welcome to GenAI Studio",
                  "Whether you are an artist",
                  "developer",
                  "entrepreneur",
                  "or visionary",
                  "GenAI Studio has the tools to bring your ideas to life.",
                ],
                autoStart: true,
                loop: true,
                cursor: "_",
                delay: 50,
              }}
            />
          </h1>
          <p className="text-lg mb-6">
            We believe that coding should be a collaborative and enjoyable experience.
          </p>
   
          <Link href="/dashboard" passHref>

            <button
              className="bg-orange-500 hover:bg-orange-700 font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              Get Started
            </button>
          </Link>
        </section>

        <section className="about bg-gray-50 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">About Us</h2>
          <div className="flex flex-col md:flex-row items-center justify-center">
            <div
              className="relative w-32 h-32 mb-4 md:mb-0 md:mr-6 cursor-pointer transform transition-transform duration-300 hover:scale-110"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <Image
                src="/images/boy.png"
                alt="Gulrez Alam"
                width={128}
                height={128}
                className="rounded-full"
              />
              {hover && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-full opacity-80">
                  <p className="text-center text-xl">Gulrez Alam</p>
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">Meet Our Founder</h3>
              <p className="text-lg">
                Gulrez Alam is a seasoned developer, entrepreneur, and AI
                enthusiast.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 teat p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Team</h2>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/boy.png"
                alt="Team Member 1"
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Jane Doe</h3>
              <p className="text-lg">Lead Developer</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/boy.png"
                alt="Team Member 2"
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">John Smith</h3>
              <p className="text-lg">AI Specialist</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/boy.png"
                alt="Team Member 3"
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Emily Johnson</h3>
              <p className="text-lg">UI/UX Designer</p>
            </div>
          </div>
        </section>

        <section className="featuret p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">What We Offer</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <li className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <i className="fas fa-code text-4xl text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Code Assistance
              </h3>
              <p className="text-lg">
                Get instant coding solutions, explanations, and best practices.
              </p>
            </li>
            <li className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <i className="fas fa-book text-4xl text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Personalized Learning
              </h3>
              <p className="text-lg">
                Receive tailored coding lessons and exercises based on your
                skill level, interests, and goals.
              </p>
            </li>
            <li className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <i className="fas fa-users text-4xl text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-lg">
                Join our community of developers, ask questions, share
                knowledge, and learn from each other.
              </p>
            </li>
            <li className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <i className="fas fa-rocket text-4xl text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Innovative Projects
              </h3>
              <p className="text-lg">
                Engage in cutting-edge projects that push the boundaries of AI
                and development.
              </p>
            </li>
            <li className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <i className="fas fa-chalkboard-teacher text-4xl text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Workshops</h3>
              <p className="text-lg">
                Attend workshops led by industry experts to enhance your skills
                and knowledge.
              </p>
            </li>
            <li className="bg-gray-50 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
              <i className="fas fa-handshake text-4xl text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Collaborative Opportunities
              </h3>
              <p className="text-lg">
                Collaborate with like-minded developers on exciting and
                impactful projects.
              </p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
