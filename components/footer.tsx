import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-slate-900">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          <div className="pb-6">
            <Link
              href="/about"
              className="text-sm leading-6 text-gray-300 hover:text-white"
            >
              About
            </Link>
          </div>
          <div className="pb-6">
            <Link
              href="#"
              className="text-sm leading-6 text-gray-300 hover:text-white"
            >
              Blog
            </Link>
          </div>
          {/* <div className="pb-6">
            <Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
              Careers
            </Link>
          </div> */}
          <div className="pb-6">
            <a
              href="mailto:egulrezalam@gmail.com"
              className="text-sm leading-6 text-gray-300 hover:text-white"
            >
              Contact
            </a>
          </div>
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-gray-400">
          &copy; 2024 GenAI Studio, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
