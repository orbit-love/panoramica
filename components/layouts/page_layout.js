import Head from "components/head";
import Header from "components/header";
import Footer from "components/footer";
import Link from "next/link";

import ProseSection from "components/prose-section";

export default function Layout({ children }) {
  return (
    <>
      <Head />
      <Header fix={true} />
      <div className="mt-24">
        <div className="flex justify-center px-4 pt-10 bg-white md:pl-0 md:pr-28">
          <div className={`flex hidden flex-col md:block`}>
            <div className="shrink-0 whitespace-nowrap md:px-0 md:w-56">
              <div className="flex flex-col px-4 space-y-2 text-lg border-l-4 border-indigo-100">
                <Link href="/#resources" scroll={false}>
                  <a className="text-indigo-500 hover:text-indigo-600">Back</a>
                </Link>
              </div>
            </div>
          </div>
          <ProseSection>{children}</ProseSection>
        </div>
      </div>
      <Footer />
    </>
  );
}
