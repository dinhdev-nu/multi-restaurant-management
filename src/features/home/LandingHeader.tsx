export default function LandingHeader() {
  return (
    <>
      <header className="sticky left-0 top-0 z-[110] flex w-full flex-col border-b border-[--border] bg-[--surface-primary] dark:border-[--dark-border] dark:bg-[--dark-surface-primary]">
        <div className="flex h-[--header-height] bg-[--surface-primary] dark:bg-[--dark-surface-primary]">
          <div className="container mx-auto grid w-full grid-cols-[1fr_max-content_1fr] place-items-center content-center items-center px-6 *:first:justify-self-start">
            <a
              className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 flex items-center ring-offset-2"
              href="/"
            >
              <img
                alt="Logo"
                className="hidden dark:block w-auto max-w-[200px] object-contain h-6 sf-hidden"
                data-nimg={1}
                decoding="async"
                height={20}
                src="data:,"
                style={{ color: "transparent", aspectRatio: "101/20" }}
                width={101}
              />
              <img
                alt="logo"
                className="dark:hidden w-auto max-w-[200px] object-contain h-6"
                data-nimg={1}
                decoding="async"
                height={20}
                src="/assets/home/PD94bWwgdm.svg"
                style={{ color: "transparent", aspectRatio: "101/20" }}
                width={101}
              />
            </a>
            <nav
              aria-label="Main"
              className="z-1 relative flex-col justify-center lg:flex hidden"
              data-orientation="horizontal"
              dir="ltr"
            >
              <div style={{ position: "relative" }}>
                <ul
                  className="flex flex-1 gap-0.5 px-4"
                  data-orientation="horizontal"
                  dir="ltr"
                >
                  <li className="relative items-center gap-0.5">
                    <button
                      aria-controls="radix-_r_0_-content-radix-_r_1_"
                      aria-expanded="false"
                      className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 inline-flex items-center pb-px pl-3 pr-2 tracking-tight hover:bg-[--surface-tertiary] dark:hover:bg-[--dark-surface-tertiary] lg:h-7"
                      data-radix-collection-item=""
                      data-state="closed"
                      id="radix-_r_0_-trigger-radix-_r_1_"
                    >
                      <span className="cursor-default">Features</span>
                      <svg
                        className="text-[--text-tertiary] dark:text-[--dark-text-tertiary]"
                        fill="none"
                        height={15}
                        viewBox="0 0 15 15"
                        width={15}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          clipRule="evenodd"
                          d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                          fill="currentColor"
                          fillRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </li>
                  <li>
                    <a
                      className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 inline-flex h-6 items-center justify-center px-3 pb-px tracking-tight hover:bg-[--surface-tertiary] dark:hover:bg-[--dark-surface-tertiary] lg:h-7"
                      data-radix-collection-item=""
                      href="/#pricing"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 inline-flex h-6 items-center justify-center px-3 pb-px tracking-tight hover:bg-[--surface-tertiary] dark:hover:bg-[--dark-surface-tertiary] lg:h-7"
                      data-radix-collection-item=""
                      href="/#blog"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 inline-flex h-6 items-center justify-center px-3 pb-px tracking-tight hover:bg-[--surface-tertiary] dark:hover:bg-[--dark-surface-tertiary] lg:h-7"
                      data-radix-collection-item=""
                      href="/#changelog"
                    >
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
            <div className="hidden items-center gap-2 !justify-self-end lg:flex">
              <a
                className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 bg-[--surface-secondary] text-[--text-primary] border-[--border] border dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:border-[--dark-border] hover:bg-[--surface-tertiary] dark:hover:bg-[--dark-surface-tertiary] inline-flex items-center justify-center px-3.5 text-sm h-8 md:px-5 !px-3.5"
                href="/auth/login"
              >
                Log In
              </a>
              <a
                className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 bg-[--accent-500] hover:bg-[--accent-600] text-[--text-on-accent-primary] border-[--accent-600] inline-flex items-center justify-center px-3.5 text-sm h-8 md:px-5 !px-3.5"
                href="/auth/register"
              >
                Get Started Today
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}