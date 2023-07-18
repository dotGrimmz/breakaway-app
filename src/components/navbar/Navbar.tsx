import React from "react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="flex w-full flex-col bg-white px-6 py-4 text-center font-sans shadow sm:flex-row sm:items-baseline sm:justify-between sm:text-left">
      <div className="mb-2 sm:mb-0">
        <a href="/home" className="text-grey-darkest hover:text-blue-dark text-2xl no-underline">
          Break Away
        </a>
      </div>
      <div>
        {/* // TODO: Look up next link when you need to create a new page. so far just leader boards and home */}
        {/* <a href="/one" className="text-grey-darkest hover:text-blue-dark ml-2 text-lg no-underline">
          One
        </a>
        <a href="/two" className="text-grey-darkest hover:text-blue-dark ml-2 text-lg no-underline">
          Two
        </a>
        <a href="/three" className="text-grey-darkest hover:text-blue-dark ml-2 text-lg no-underline">
          Three
        </a> */}
      </div>
    </nav>
  );
};
