const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100">
              Fashion E-Commerce
            </h3>
            <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
              Curated premium collection of modern apparel, footwear, and designer accessories. Experience fashion redefined.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100">
              Shop Categories
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-slate-400">
              <li>Men's Clothing</li>
              <li>Women's Clothing</li>
              <li>Footwear Collection</li>
              <li>Accessories</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100">
              Customer Policies
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-slate-400">
              <li>Contact Us</li>
              <li>FAQ</li>
              <li>T&C / Privacy</li>
              <li>Returns & Exchanges</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
              Subscribe to get updates on new arrivals, discounts, and style guides.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-850 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-xs text-gray-400 dark:border-slate-800 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Fashion E-Commerce. Created for Internship Submission. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
